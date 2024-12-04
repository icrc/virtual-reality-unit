<!-- Full player for a project/story -->
<template>
	<div :class="{ player_container: true, full_screen: isFullscreen }">
		<player @ready="onPlayerReady" :ref="videoPlayer" :options="playerOptions" />
		<div class="overlay">
			<div class="marker"></div>
		</div>
	</div>
</template>

<script></script>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import Player from "@/components/Player.vue"

import { useFullscreen } from "@/composables/fullscreen"
import { useWindowSize } from "@/composables/windowSize"

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

const onPlayerReady = vJS => {
	videoJS = window.videoJS = vJS
	setTimeout(getAllDimensions, 1000)
	resizePlayerToContainerWidth()
	emit("showable", { videoJS })
}

const getAllDimensions = () => {
	videoJS.getDimensions().then(dimensions => {
		playerAspect.value = dimensions.width / dimensions.height
		playerWidth.value = dimensions.width
		playerHeight.value = dimensions.height
		emit("ready", { videoJS })
	})
}

const resizePlayer = ({ width, height }) => {
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
const getScene = id => props.data.scenes.find(s => s.id === id)

const getInitialPlayerOptions = () => ({
	sources: [getSceneSourceObject(getScene(props.data.initialSceneId))],
})
const playerOptions = getInitialPlayerOptions()

async function start(abortSignal = undefined) {
	let currentScene = getScene(props.data.initialSceneId)
	let result
	if (abortSignal?.aborted) return handleAbort({ aborted: true, error: "Playback aborted" })
	playbackActive.value = true
	result = await playScene(currentScene, abortSignal)
	if (result?.aborted || result?.error) return handleAbort(result)

	// TODO - here, check for a number in result.nextSceneId. If it is === false then we're done (finalState will be in result.finalState) - if not, play next scene
	return result
}

function handleAbort(err) {
	playbackActive.value = false
	videoJS.pause()
	return err
}

function playScene(scene, abortSignal) {
	return new Promise(resolve => {
		let timeout
		const abortHandler = () => {
			clearTimeout(timeout)
			resolve({ aborted: true, error: "Playback aborted" })
		}
		videoJS.play()

		// TODO - on an event listener / timed routine in here, check to see if a next event or end of scene has occurred
		// deal with event (do actions or show choice), or return { nextSceneId } if we're going to next scene

		setTimeout(() => {
			resolve({ nextSceneId: false })
			abortSignal?.removeEventListener("abort", abortHandler)
			videoJS.pause()
		}, 10000)

		abortSignal?.addEventListener("abort", abortHandler)
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
