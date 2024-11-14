<!-- Test Page -->
<template>
  <div class="s-container">
    <h1>Testing</h1>
    <div>
      <player @ready="onPlayerReady" :ref="player" :options="playerOptions" />
    </div>
    <div class="buttons">
      <button @click="full">Full screen</button>
      <button @click="play">Play</button>
      <button @click="pause">Pause</button>
      <button @click="jump">Jump to 43s</button>
    </div>
    <br />
    <div class="buttons">
      <button @click="dbxChoose">Dropbox choose...</button>
      <button @click="dbxSave">Dropbox save...</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import Player from "@/components/Player.vue"

const player = ref()
let videoJS

const onPlayerReady = vJS => (videoJS = window.videoJS = vJS)

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
const jump = () => videoJS.currentTime(43)
const dbxChoose = () => {
  Dropbox.choose({
    success: function (files) {
      alert("Here's the file link: " + files[0].link)
    },
    linkType: "direct",
  })
}
const dbxSave = () => {
  const msg = btoa("Hello world! " + new Date().toLocaleString())
  Dropbox.save("data:text/plain;charset=utf-8;base64," + msg, "hello.txt", {})
}
</script>

<style scoped>
div.buttons {
  display: flex;
  gap: 1em;
}
video {
  width: 800px;
}
button {
  width: 8em;
}
</style>
