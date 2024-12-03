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
const emit = defineEmits(['ready', 'error'])


const { isFullscreen } = useFullscreen()

const playerAspect = ref(1)
const playerWidth = ref(1)
const playerHeight = ref(1)

let videoJS

const onPlayerReady = vJS => {
	console.log("Player ready")
	videoJS = window.videoJS = vJS
	videoJS.getDimensions().then(dimensions => {
		playerAspect.value = dimensions.width / dimensions.height
		playerWidth.value = dimensions.width
		playerHeight.value = dimensions.height
	})
	resizePlayerToContainerWidth()
	emit('ready', { videoJS })
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

const getInitialPlayerOptions = () => ({
	// // sources: [{ type: "video/vimeo", src: "https://vimeo.com/541416221" }, { src: "/videos/05.mp4" }],
	sources: [
		{ type: "video/vimeo", src: "https://player.vimeo.com/video/1025039220?h=1d3c27a454" },
		// { type: "video/mp4", src: "/videos/05.mp4" },
	],
	// vimeo: {
	//   // controls: true,
	// },
	// // sources: [{ src: "/videos/05.mp4" }, { type: "video/vimeo", src: "https://player.vimeo.com/video/1025039220?h=1d3c27a454&badge=0&autopause=0&player_id=0&app_id=58479&background=1" }]
})
const playerOptions = getInitialPlayerOptions()

defineExpose({
	goFullscreen,
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
