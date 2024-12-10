<!-- Full player for a project/story -->
<template>
	<div :class="{ player_container: true, full_screen: isFullscreen }">
		<player @ready="onPlayerReady" :options="playerOptions" />
		<div class="overlay">
			<div class="marker"></div>
		</div>
		<div v-if="props?.data?.scenes?.length">
			<span v-for="(scene, index) in props.data.scenes">{{ `Service scene ${ index + 1 }` }} --- </span>
		</div>
	</div>
</template>

<script>
import { EVENT_TYPES } from "@/stores/storyStore"
import { runCode } from "@/libs/actionCode"
</script>

<script setup>
import { ref, toRaw, onUnmounted } from "vue"
import Player from "@/components/Player.vue"

import { useFullscreen } from "@/composables/fullscreen"
import { useWindowSize } from "@/composables/windowSize"

import { runCode } from "@/libs/actionCode"

const props = defineProps({
	// story data we'll be playing
	data: {
		type: Object,
		default: null,
	},
	// player's container element
	containerEl: {
		type: Object,
		default: null,
	},
})
const emit = defineEmits(["ready", "error", "showable"])

const { isFullscreen } = useFullscreen()

const playerAspect = ref(1)
const playerWidth = ref(1)
const playerHeight = ref(1)
const playbackActive = ref(false)

let videoJS
let currentState

/**
 * Do some setup when video player ready.
 *
 * @param      {Object}  vJS     The VideoJS instance
 */
const onPlayerReady = vJS => {
	videoJS = window.videoJS = vJS
	setTimeout(getAllDimensions, 1000)
	resizePlayerToContainerWidth()
	emit("showable", { videoJS })
}

/**
 * Get all deimensions of the video (optionally announcing we're ready once done)
 *
 * @param      {boolean}  [announceReady=true]  Announce we're ready or not
 */
const getAllDimensions = (announceReady = true) => {
	videoJS.getDimensions().then(dimensions => {
		playerAspect.value = dimensions.width / dimensions.height
		playerWidth.value = dimensions.width
		playerHeight.value = dimensions.height
		announceReady && emit("ready", { videoJS })
	})
}

/**
 * Resize player to given width (optional) and height (optional)
 *
 * @param      {Object}  arg1                     Dimensions object
 * @param      {number}  [arg1.width=undefined]   The width
 * @param      {number}  [arg1.height=undefined]  The height
 * @return     {any}     n/a
 */
const resizePlayer = ({ width = undefined, height = undefined }) => {
	if (!videoJS) return
	if (width !== undefined && height !== undefined) videoJS.dimensions(width, height)
	else if (width !== undefined) videoJS.dimension("width", width)
	else if (height !== undefined) videoJS.dimensions("height", height)
}

// make sure player sizes appropriately with window resizes
const resizePlayerToContainerWidth = () => resizePlayer({ width: props.containerEl.clientWidth })
let { stopWatching: stopWatchingWindowResize } = useWindowSize(resizePlayerToContainerWidth) // make sure player gets sized appropriately on window resize

// go to full screen player
const goFullscreen = () => document.querySelector("html").requestFullscreen()

// getting videos, scenes, source objects for videoJS
const getSceneSourceObject = scene => getVideoSourceObject(getVideo(scene.videoId))
const getVideoSourceObject = ({ sourceType: type, url: src }) => ({ type: "video/" + type, src })
const getVideo = id => props.data.videos.find(v => v.id === id)
const getScene = id => structuredClone(toRaw(props.data.scenes.find(s => s.id === id)))

// intitial options for videoJS - show the beginning of first scene video
const getInitialPlayerOptions = () => ({
	sources: [getSceneSourceObject(getScene(props.data.initialSceneId))],
})
const playerOptions = getInitialPlayerOptions()

/**
 * Start playing the story/project
 *
 * @param      {(AbortSignal|undefined)}  [abortSignal=undefined]  The abort signal (from an AbortController)
 * @return     {Promise}                  Resolves to object containing final state or reasons for bailing early
 */
async function start(abortSignal = undefined) {
	let currentSceneId = props.data.initialSceneId

	getAllDimensions(false) // make sure we have dimensions (fails sometimes intially)

	currentState = structuredClone(toRaw(props.data.initialState))

	let result, currentScene
	if (abortSignal?.aborted) return handleAbort({ aborted: true, error: "Playback aborted" })
	playbackActive.value = true

	do {
		currentScene = getScene(currentSceneId)
		result = await playScene(currentScene, abortSignal)
		if (result?.aborted || result?.error) return handleAbort(result)
		currentSceneId = result.nextSceneId
	} while (currentSceneId !== false)

	return result
}

/**
 * Handle situation when playback is aborted
 *
 * @param      {Object}  err     The error (object with info relating to the abort)
 * @return     {Object}  Same error object passed in
 */
function handleAbort(err) {
	playbackActive.value = false
	videoJS.pause()
	return err
}

/**
 * Play a scene from a story
 *
 * @param      {Object}                   scene                    The scene data
 * @param      {(AbortSignal|undefined)}  [abortSignal=undefined]  The abort signal so we can keep an eye on whether
 *                                                                 we've been asked to stop
 * @return     {Promise}                  Resolves to object with abort info, next scene info, or completion info
 */
function playScene(scene, abortSignal = undefined) {
	return new Promise(resolve => {
		const completedEventIds = []

		const CMD_LIBRARY = {
			gotoScene(id) {
				announceDone({ nextSceneId: id })
				return null // bail on any more commands
			},
			setNextScene(id) {
				scene.nextSceneId = id
			},
			gotoNextScene() {
				if (scene.nextSceneId === -1) return // do nothing if no next scene
				announceDone({ nextSceneId: scene.nextSceneId })
				return null // bail on any more commands
			},
		}

		const abortHandler = () => announceDone({ aborted: true, error: "Playback aborted" })

		function setup() {
			activateHandlers()
			const srcObj = getSceneSourceObject(scene)
			if (srcObj.type !== videoJS.currentType() || srcObj.src !== videoJS.currentSrc()) videoJS.src(srcObj)
			if (!scene.startTime) videoJS.play()
			else videoJS.currentTime(scene.startTime)
		}

		function teardown() {
			activateHandlers(false)
		}

		const activateHandlers = (state = true) => {
			Object.entries(handlers).forEach(([event, handler]) => videoJS[state ? "on" : "off"](event, handler))
			abortSignal?.[state ? "addEventListener" : "removeEventListener"]("abort", abortHandler)
		}

		function announceDone(result) {
			teardown()
			resolve(result)
		}

		async function handleSceneEnd() {
			// check for 'end of scene' events
			scene.events.forEach(event => {
				if (event.launchTime == -1 && !completedEventIds.includes(event.id)) handleEvent(event)
			})

			// go to next scene if we have one
			if (scene.nextSceneId !== -1) {
				announceDone({ nextSceneId: scene.nextSceneId })
				// otherwise we're done - no next scene, return final state
			} else {
				announceDone({ nextSceneId: false, finalState: currentState })
			}
		}

		function handleEvent(event) {
			completedEventIds.push(event.id)
			console.log("event: ", event.type, event.id)
			if (event.type == EVENT_TYPES.action) {
				runActionCodeAndUpdateState(event.data)
			} else if ((event.type = EVENT_TYPES.choice)) {
				// TODO - choice handling
				console.log("Choice time!", event.data)
			}
		}

		function runActionCodeAndUpdateState(code) {
			const res = runActionCode(code)
			currentState = structuredClone(toRaw(res.newState))
		}

		function runActionCode(code) {
			return runCode(code, currentState, CMD_LIBRARY)
		}

		const handlers = {
			timeupdate() {
				// console.log('time updated:' + videoJS.currentTime())
				const time = videoJS.currentTime()

				// check to see if scene end time has passed (if it has one)
				if (scene.endTime !== -1 && time >= scene.endTime) {
					handleSceneEnd()
				}

				// check to see if it is time for an event
				scene.events.forEach(event => {
					if (event.launchTime !== -1 && time >= event.launchTime && !completedEventIds.includes(event.id)) handleEvent(event)
				})
			},
			async ended() {
				videoJS.pause()
				await handleSceneEnd()
			},
			seeked() {
				if (videoJS.paused()) {
					if (videoJS.currentTime() == scene.startTime) videoJS.play()
					else videoJS.currentTime(scene.startTime)
				}
			},
		}

		setup()
	})
}

/**
 * Clean up and tear down when unmounted
 */
function teardown() {
	stopWatchingWindowResize()
}
onUnmounted(teardown)

defineExpose({
	goFullscreen,
	playbackActive,
	start,
})
</script>

<style scoped>
.player_container {
	position: relative;
	--aspect: v-bind(playerAspect);
	--pwidth: v-bind(playerWidth + "px");
	--pheight: v-bind(playerHeight + "px");
	&.full_screen {
		position: fixed;
		inset: 0 0 0 0;
		& .video-js {
			width: 100%;
			height: 100%;
		}
	}
}

.overlay {
	position: absolute;
	box-sizing: border-box;
	inset: 0 0 0 0;
	.marker {
		position: absolute;
		left: 47.5%;
		top: calc(50% - 2.5% * var(--aspect));
		background: #f00;
		border-radius: 50%;
		width: 5%;
		height: calc(5% * var(--aspect));
	}
}

.full_screen .overlay {
	top: calc(50% - (100vw / var(--aspect) / 2));
	bottom: calc(50% - (100vw / var(--aspect) / 2));
	left: 0;
	right: 0;
}
</style>
