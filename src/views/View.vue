<!-- View Page -->
<template>
  <div class="s-container">
    <main ref="mainViewContainer" style="--span: 12" class="main_view_container" :style="{ visibility: isVideoReady ? 'visible' : 'hidden' }">
      <div :class="{ player_container: true, full_screen: isFullscreen }">
        <player @ready="onPlayerReady" :ref="player" :options="playerOptions" />
        <div class="overlay">
          <div class="marker"></div>
        </div>
      </div>
    </main>
    <div class="buttons">
      <button>Start</button>
      <button style="width: 30%" @click="goFullscreen">Full Screen</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import Player from "@/components/Player.vue"
import { useFullscreen } from "@/composables/fullscreen"
import { useWindowSize } from "@/composables/windowSize"

const player = ref()
let videoJS

const isVideoReady = ref(false)
const mainViewContainer = ref(null)

const { isFullscreen } = useFullscreen()

const playerAspect = ref(1)
const playerWidth = ref(1)
const playerHeight = ref(1)

const onPlayerReady = vJS => {
  console.log("Player ready")
  videoJS = window.videoJS = vJS
  videoJS.getDimensions().then(dimensions => {
    playerAspect.value = dimensions.width / dimensions.height
    playerWidth.value = dimensions.width
    playerHeight.value = dimensions.height
  })
  resizePlayer({ width: mainViewContainer.value.clientWidth })
  isVideoReady.value = true
}

const resizePlayer = ({ width, height }) => {
  if (width !== undefined && height !== undefined) videoJS.dimensions(width, height)
  else if (width !== undefined) videoJS.dimension("width", width)
  else if (height !== undefined) videoJS.dimensions("height", height)
}

useWindowSize(() => resizePlayer({ width: mainViewContainer.value.clientWidth }))

const goFullscreen = () => {
  document.querySelector("html").requestFullscreen()
}

const playerOptions = {
  // sources: [{ type: "video/vimeo", src: "https://vimeo.com/541416221" }, { src: "/videos/05.mp4" }],
  sources: [
    { type: "video/vimeo", src: "https://player.vimeo.com/video/1025039220?h=1d3c27a454&badge=0&autopause=0&player_id=0&app_id=58479" },
    { type: "video/mp4", src: "/videos/05.mp4" },
  ],
  vimeo: {
    // controls: true,
  },
  // sources: [{ src: "/videos/05.mp4" }, { type: "video/vimeo", src: "https://player.vimeo.com/video/1025039220?h=1d3c27a454&badge=0&autopause=0&player_id=0&app_id=58479&background=1" }]
}
</script>

<style scoped>
.buttons {
  padding-top: 1em;
  display: flex;
  gap: 1em;
}

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
