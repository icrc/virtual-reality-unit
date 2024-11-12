<!-- Test Page -->
<template>
  <div class="s-container">
    <h1>Testing</h1>
    <div>
      <player @ready="onPlayerReady" :ref="player" :options="playerOptions" />
    </div>
    <button @click="full">Full screen</button>
    <button @click="play">Play</button>
    <button @click="pause">Pause</button>
  </div>
</template>

<script setup>
import { ref } from "vue"
import Player from "@/components/Player.vue"

const player = ref()
let videoJS

const onPlayerReady = vJS => videoJS = vJS

const playerOptions = {
  // sources: [{ type: "video/vimeo", src: "https://vimeo.com/541416221" }, { src: "/videos/05.mp4" }],
  sources: [
    { type: "video/vimeo", src: "https://player.vimeo.com/video/1025039220?h=1d3c27a454&badge=0&autopause=0&player_id=0&app_id=58479" },
    { src: "/videos/05.mp4" },
  ],
  // sources: [{ src: "/videos/05.mp4" }, { type: "video/vimeo", src: "https://player.vimeo.com/video/1025039220?h=1d3c27a454&badge=0&autopause=0&player_id=0&app_id=58479&background=1" }]
}


const full = () => document.querySelector("html").requestFullscreen()
const play = () => videoJS.play()
const pause = () => videoJS.pause()

</script>

<style scoped>
video {
  width: 800px;
}
button {
  width: 8em;
}
</style>
