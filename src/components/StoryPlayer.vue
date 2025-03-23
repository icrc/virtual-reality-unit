<!-- Full player for a project/story -->
<template>
	<div :class="{ player_container: true, [superWide ? 'full_screen_superwide' : 'full_screen']: isFullscreen }">
		<player @ready="onPlayerReady" :options="playerOptions" />
		<div class="overlay">
			<div
				:title="playbackActive ? 'Reset' : 'Start'"
				v-if="doStart && doAbort"
				:class="{ playback_button: true, playing: playbackActive }"
				@click="handlePlaybackButtonClick">
				<svg
					v-if="playbackActive"
					height="100%"
					width="100%"
					version="1.1"
					id="btn_abort"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					viewBox="0 0 60 60"
					xml:space="preserve">
					<g>
						<path d="M16,44h28V16H16V44z M18,18h24v24H18V18z" />
						<path
							d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30
		S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z" />
					</g>
				</svg>
				<svg
					v-else
					height="100%"
					width="100%"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					viewBox="0 0 60 60"
					xml:space="preserve">
					<g>
						<path
							d="M45.563,29.174l-22-15c-0.307-0.208-0.703-0.231-1.031-0.058C22.205,14.289,22,14.629,22,15v30
		c0,0.371,0.205,0.711,0.533,0.884C22.679,45.962,22.84,46,23,46c0.197,0,0.394-0.059,0.563-0.174l22-15
		C45.836,30.64,46,30.331,46,30S45.836,29.36,45.563,29.174z M24,43.107V16.893L43.225,30L24,43.107z" />
						<path
							d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30
		S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z" />
					</g>
				</svg>
			</div>
			<choices
				v-if="currentChoiceData"
				:timeLimit="currentChoiceData.timeLimit"
				:message="currentChoiceData.text"
				:buttons="currentChoiceData.buttons"
				:layout="computedLayoutName"
				:layout-settings="computedLayoutSettings"
				@choice-made="choiceMadeHandler" />
		</div>
		<div v-if="props?.data?.scenes?.length">
			<video-service-provider v-for="(scene, index) in props.data.scenes" ref="serviceProviders" />
		</div>
	</div>
</template>

<script>
import { EVENT_TYPES, CHOICE_TYPES } from "@/stores/storyStore"
import { runCode } from "@/libs/actionCode"
import { DEFAULT_LAYOUT } from "@/layouts"

const noop = () => {}
</script>

<script setup>
import { ref, toRaw, onMounted, onUnmounted, useTemplateRef, nextTick, computed } from "vue"
import Player from "@/components/Player.vue"
import VideoServiceProvider from "@/components/VideoServiceProvider.vue"
import Choices from "@/components/Choices.vue"

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
	// start function
	doStart: {
		type: Function,
		default: null,
	},
	// abort function
	doAbort: {
		type: Function,
		default: null,
	},
})
const emit = defineEmits(["ready", "error", "showable"])

const { isFullscreen } = useFullscreen()

const playerAspect = ref(1)
const playerWidth = ref(1)
const playerHeight = ref(1)
const playerFullHeight = ref(1)
const playbackActive = ref(false)
const superWide = ref(false)

let videoJS
let currentState

const currentChoiceData = ref()
let inBlockChoice
/** @type {any} */
let activeLoop = false
let choiceMadeHandler = noop
let timerTimeoutId = 0

// preloading videos
const serviceProviderRefs = useTemplateRef("serviceProviders")
onMounted(() => {
	if (props.data.scenes && props.data.scenes.length) {
		nextTick(() => {
			props.data.scenes.forEach((scene, index) => {
				const { type, src } = getSceneSourceObject(scene)
				serviceProviderRefs.value[index].preload(type.replace("video/", ""), src, scene.startTime)
			})
		})
	}
})

// layout name
const computedLayoutName = computed(() => {
	if (!currentChoiceData.value) return undefined
	return currentChoiceData.value.layout || props.data.defaultChoiceLayout || DEFAULT_LAYOUT
})
// layout settings
const computedLayoutSettings = computed(() => {
	if (!currentChoiceData) return {}
	// if we are using the default layout, start with the default settings
	const settings = !currentChoiceData.value.layout && props.data.defaultChoiceLayout ? props.data.defaultChoiceLayoutSettings : {}
	// merge in the current choice's settings
	return { ...settings, ...currentChoiceData.value.layoutSettings }
})

/**
 * Handle our internal play/abort button (full screen)
 */
const handlePlaybackButtonClick = () => {
	if (playbackActive.value) {
		props.doAbort && props.doAbort()
	} else {
		props.doStart && props.doStart()
	}
	setTimeout(() => resizePlayerToContainerWidth({ width: window.innerWidth, height: window.innerHeight }), 250)
}

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

/**
 * Make sure player sizes appropriately with window resizes
 *
 * @param      {Object}        [arg1={}]    The argument 1
 * @param      {number}   arg1.width   The width
 * @param      {number}  arg1.height  The height
 */
const resizePlayerToContainerWidth = ({ width: screenWidth, height: screenHeight } = {}) => {
	resizePlayer({ width: props.containerEl.clientWidth })
	// check if we're on a screen with a wider aspect than the player
	if (screenWidth && screenHeight) superWide.value = playerAspect.value <= screenWidth / screenHeight
	playerFullHeight.value = isFullscreen.value && superWide.value ? document.getElementsByClassName("video-js")[0].clientHeight : props.containerEl.clientHeight
}
let { stopWatching: stopWatchingWindowResize } = useWindowSize(resizePlayerToContainerWidth) // make sure player gets sized appropriately on window resize

/**
 * Go to full screen player
 */
const goFullscreen = () => {
	document
		.querySelector("html")
		.requestFullscreen()
		.then(setTimeout(() => resizePlayerToContainerWidth({ width: window.innerWidth, height: window.innerHeight }), 250))
}

// getting videos, scenes, source objects for videoJS
const getSceneSourceObject = scene => getVideoSourceObject(getVideo(scene.videoId))
const getVideoSourceObject = ({ sourceType: type, url: src }) => ({ type: "video/" + type, src })
const getVideo = id => props.data.videos.find(v => v.id === id)
const getScene = id => toRaw(props.data.scenes.find(s => s.id === id))

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

		/**
		 * 'Library' of functions available in ActionCode
		 *
		 * @type       {Object}
		 */
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

		/**
		 * Handler for the 'abort' event on the abortSignal (an outside request to stop)
		 *
		 * @return     {void}
		 */
		const abortHandler = () => announceDone({ aborted: true, error: "Playback aborted" })

		/**
		 * Set up the story player for playback
		 */
		function setup() {
			activateHandlers()
			clearChoices()
			const srcObj = getSceneSourceObject(scene)
			if (srcObj.type !== videoJS.currentType() || srcObj.src !== videoJS.currentSrc()) videoJS.src(srcObj)
			if (!scene.startTime && !videoJS.currentTime()) videoJS.play()
			else videoJS.currentTime(scene.startTime)
		}

		/**
		 * Clear out the current choice data (making the interface invisible)
		 */
		function clearChoices() {
			currentChoiceData.value = null
			timerTimeoutId && clearTimeout(timerTimeoutId)
			timerTimeoutId = 0
			choiceMadeHandler = noop
			inBlockChoice = false
			activeLoop = false
		}

		/**
		 * Clean up on exit/done
		 */
		function teardown() {
			clearChoices()
			activateHandlers(false)
		}

		/**
		 * Activate/deactivate our VideoJS event handlers
		 *
		 * @param      {boolean}  [state=true]  The state (on/off)
		 */
		const activateHandlers = (state = true) => {
			Object.entries(handlers).forEach(([event, handler]) => videoJS[state ? "on" : "off"](event, handler))
			abortSignal?.[state ? "addEventListener" : "removeEventListener"]("abort", abortHandler)
		}

		/**
		 * Announce we're finished and return a result
		 *
		 * @param      {any}  result  The result
		 */
		function announceDone(result) {
			teardown()
			resolve(result)
		}

		/**
		 * Handle reaching the end of a scene
		 *
		 * @return     {Promise}
		 */
		async function handleSceneEnd() {
			// check for 'end of scene' events
			for (const event of scene.events) {
				if (event.launchTime == -1 && !completedEventIds.includes(event.id)) {
					if (event.type == EVENT_TYPES.choice) {
						// wait for a choice
						await handleEvent(event)
					} else {
						handleEvent(event)
					}
				}
			}

			if (scene.nextSceneId !== -1) {
				// go to next scene if we have one
				announceDone({ nextSceneId: scene.nextSceneId })
			} else {
				// otherwise we're done - no next scene, return final state
				announceDone({ nextSceneId: false, finalState: currentState })
			}
		}

		/**
		 * Handle/run an event (action/choice)
		 *
		 * @param      {Object}   event   The event
		 * @return     {Promise}
		 */
		async function handleEvent(event) {
			completedEventIds.push(event.id)
			if (event.type == EVENT_TYPES.action) {
				runActionCodeAndUpdateState(event.data)
			} else if ((event.type = EVENT_TYPES.choice)) {
				return await handleChoice(event.data)
			}
		}

		/**
		 * Handle a choice event
		 *
		 * @param      {Object}   choiceData  The choice data
		 * @return     {Promise}  { description_of_the_return_value }
		 */
		async function handleChoice(choiceData) {
			if (choiceData.type == CHOICE_TYPES.block) {
				await handleBlockChoice(choiceData)
			} else {
				handleTimedChoice(choiceData)
			}
		}

		/**
		 * Handle a 'block' choice event - a choice that stops the video
		 *
		 * @param      {Object}   choiceData  The choice data
		 * @return     {Promise}  Will resolve when the choice is made/done
		 */
		function handleBlockChoice(choiceData) {
			const initiallyPlaying = !videoJS.paused()
			videoJS.pause()
			const initialTime = videoJS.currentTime()

			// show a frame if requested
			if (choiceData?.options?.frame !== undefined) videoJS.currentTime(choiceData.options.frame)

			// show a loop if requested
			if (choiceData?.options?.loop !== undefined) {
				videoJS.currentTime(choiceData.options.loop[0])
				activeLoop = choiceData.options.loop
				videoJS.play()
			}

			// return promise
			return new Promise(resolve => {
				inBlockChoice = true
				choiceMadeHandler = choiceButton => {
					let result
					choiceButton.action && (result = runActionCodeAndUpdateState(choiceButton.action))
					clearChoices()
					if (result?.bailed) {
						resolve()
						return
					}
					if (choiceData?.options?.frame !== undefined || choiceData?.options?.loop !== undefined) videoJS.currentTime(initialTime)
					if (initiallyPlaying) videoJS.play()
					resolve()
				}
				currentChoiceData.value = choiceData
			})
		}

		/**
		 * Handle a timed choice
		 *
		 * @param      {Object}  choiceData  The choice data
		 * @return     {void}  { description_of_the_return_value }
		 */
		function handleTimedChoice(choiceData) {
			const duration = choiceData?.options?.timeLimit
			if (!duration) return
			choiceMadeHandler = choiceButton => {
				let result
				choiceButton.action && (result = runActionCodeAndUpdateState(choiceButton.action))
				clearChoices()
			}
			currentChoiceData.value = { ...choiceData, timeLimit: duration }
			timerTimeoutId = setTimeout(
				() => {
					if (choiceData?.options?.defaultAction) runActionCodeAndUpdateState(choiceData.options.defaultAction)
					clearChoices()
				},
				100 + duration * 1000
			)
		}

		/**
		 * Run some action code and update the current state after
		 *
		 * @param      {String}  code    The code
		 * @return     {Object}  State after running the action code, with possible bailed out flag
		 */
		function runActionCodeAndUpdateState(code) {
			const res = runActionCode(code)
			currentState = structuredClone(toRaw(res.newState))
			return res
		}

		/**
		 * Run the action code on the current state
		 *
		 * @param      {String}  code    The code
		 * @return     {Object}  State after running the action code, with possible bailed out flag
		 */
		function runActionCode(code) {
			return runCode(code, currentState, CMD_LIBRARY)
		}

		/**
		 * Our VideoJS handlers
		 *
		 * @type       {Object}
		 */
		const handlers = {
			timeupdate() {
				const time = videoJS.currentTime()

				if (!inBlockChoice) {
					// check to see if scene end time has passed (if it has one)
					if (scene.endTime !== -1 && time >= scene.endTime) {
						videoJS.pause()
						handleSceneEnd()
					}

					// check to see if it is time for an event
					scene.events.forEach(event => {
						if (event.launchTime !== -1 && time >= event.launchTime && !completedEventIds.includes(event.id)) handleEvent(event)
					})
				}

				// looping? Possibly (probably in a blocked choice)
				const [startTime, endTime] = activeLoop || []
				if (startTime !== undefined && endTime !== undefined) {
					const realEndTime = endTime === -1 ? scene.endTime : endTime
					if (time >= realEndTime) videoJS.currentTime(startTime)
				}
			},
			async ended() {
				videoJS.pause()
				await handleSceneEnd()
			},
			seeked() {
				if (videoJS.paused()) {
					if (inBlockChoice) return
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
function teardownComponent() {
	stopWatchingWindowResize()
}
onUnmounted(teardownComponent)

defineExpose({
	goFullscreen,
	playbackActive,
	start,
})
</script>

<style scoped>
.player_container {
	position: relative;
	--playerfullheight: v-bind(playerFullHeight + "px");
	--aspect: v-bind(playerAspect);
	--pwidth: v-bind(playerWidth + "px");
	--pheight: v-bind(playerHeight + "px");
	&.full_screen,
	&.full_screen_superwide {
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
}

.playback_button {
	position: absolute;
	right: 2%;
	top: 5%;
	width: 5%;
	aspect-ratio: 1;
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.3s ease-out;
	visibility: hidden;
	cursor: default;
	& svg {
		fill: #fc0;
		filter: drop-shadow(0 0 3px rgb(0, 0, 0));
	}
	&:hover svg {
		fill: #fff;
	}
}

.full_screen .playback_button,
.full_screen_superwide .playback_button {
	opacity: 1;
	pointer-events: all;
	visibility: visible;
	cursor: pointer;
	&.playing {
		opacity: 0;
		z-index: 100000;
	}
	&:hover {
		opacity: 1;
	}
}

.full_screen .overlay {
	top: calc(50% - (100vw / var(--aspect) / 2));
	bottom: calc(50% - (100vw / var(--aspect) / 2));
	--playerfullheight: calc(100vw / var(--aspect));
	left: 0;
	right: 0;
}

.full_screen_superwide .overlay {
	top: calc(50% - (var(--playerfullheight) / 2));
	bottom: calc(50% - (var(--playerfullheight) / 2));
	left: calc(50% - ((var(--playerfullheight) * var(--aspect))) / 2);
	right: calc(50% - ((var(--playerfullheight) * var(--aspect))) / 2);
}
</style>
