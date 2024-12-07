<!-- Full player for a project/story -->
<template>
	<div :class="{ player_container: true, full_screen: isFullscreen }">
		<player @ready="onPlayerReady" :options="playerOptions" />
		<div class="overlay">
			<div class="marker"></div>
		</div>
	</div>
</template>

<script>

import { EVENT_TYPES } from "@/stores/storyStore"
import { runCode } from "@/libs/actionCode"

</script>

<script setup>
import { ref, onMounted, onUnmounted, toRaw } from "vue"
import Player from "@/components/Player.vue"

import { useFullscreen } from "@/composables/fullscreen"
import { useWindowSize } from "@/composables/windowSize"

import { parser, runCode } from "@/libs/actionCode"


const props = defineProps({
	data: {
		type: Object,
		default: null,
	},
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

const onPlayerReady = vJS => {
	videoJS = window.videoJS = vJS
	setTimeout(getAllDimensions, 1000)
	resizePlayerToContainerWidth()
	emit("showable", { videoJS })
}

const getAllDimensions = (announce=true) => {
	videoJS.getDimensions().then(dimensions => {
		playerAspect.value = dimensions.width / dimensions.height
		playerWidth.value = dimensions.width
		playerHeight.value = dimensions.height
		announce && emit("ready", { videoJS })
	})
}

const resizePlayer = ({ width, height }) => {
	if (!videoJS) return
	if (width !== undefined && height !== undefined) videoJS.dimensions(width, height)
	else if (width !== undefined) videoJS.dimension("width", width)
	else if (height !== undefined) videoJS.dimensions("height", height)
}
const resizePlayerToContainerWidth = () => resizePlayer({ width: props.containerEl.clientWidth })

useWindowSize(resizePlayerToContainerWidth)

const goFullscreen = () => {
	document.querySelector("html").requestFullscreen()
}

const getSceneSourceObject = scene => getVideoSourceObject(getVideo(scene.videoId))
const getVideoSourceObject = ({ sourceType: type, url: src }) => ({ type: "video/" + type, src })
const getVideo = id => props.data.videos.find(v => v.id === id)
const getScene = id => structuredClone(toRaw(props.data.scenes.find(s => s.id === id)))

const getInitialPlayerOptions = () => ({
	sources: [getSceneSourceObject(getScene(props.data.initialSceneId))],
})
const playerOptions = getInitialPlayerOptions()

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

function handleAbort(err) {
	playbackActive.value = false
	videoJS.pause()
	return err
}

function playScene(scene, abortSignal) {
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
				announceDone({ nextSceneId: scene.nextSceneId })
				return null // bail on any more commands
			}
		}

		const abortHandler = () => {
			announceDone({ aborted: true, error: "Playback aborted" })
		}

		abortSignal?.addEventListener("abort", abortHandler)

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
		}

		function announceDone(result) {
			teardown()
			resolve(result)
		}

		function handleSceneEnd() {
			// TODO -- end of scene events (launchTime = -1)

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
			console.log('event: ', event.type, event.id)
			if (event.type == EVENT_TYPES.action) {
				runActionCode(event.data)
			} else if (event.type = EVENT_TYPES.choice) {
				// TODO - choice handling
				console.log('Choice time!', event.data)
			}
		}

		function runActionCode(code) {
			const res = runCode(code, currentState, CMD_LIBRARY)
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
					if (event.launchTime!== -1 && time >= event.launchTime && !completedEventIds.includes(event.id)) handleEvent(event)
				})

			},
			ended() {
				videoJS.pause()
				handleSceneEnd()
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
