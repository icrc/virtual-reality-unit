<!-- Test Page -->
<template>
  <div class="s-container">
    <h1>Testing</h1>
    <div>
      <video ref="videoPlayer" class="video-js" width="650px"></video>
    </div>
    <button @click="full">Full screen</button>  
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import "video.js/dist/video-js.min.css"
import videojs from "video.js"
// import '@devmobiliza/videojs-vimeo/dist/videojs-vimeo.esm'
import '../vim'

const videoPlayer = ref()

let player

onMounted(() => {
  player = videojs(
    videoPlayer.value,
    {
      autoplay: true,
      controls: true,
      techOrder: ["html5", "vimeo"],
      // sources: [{ type: "video/vimeo", src: "https://vimeo.com/541416221" }, { src: "/videos/05.mp4" }],
      sources: [{ type: "video/vimeo", src: "https://player.vimeo.com/video/1025039220?h=1d3c27a454&badge=0&autopause=0&player_id=0&app_id=58479" }, { src: "/videos/05.mp4" }],
      // sources: [{ src: "/videos/05.mp4" }, { type: "video/vimeo", src: "https://player.vimeo.com/video/1025039220?h=1d3c27a454&badge=0&autopause=0&player_id=0&app_id=58479&background=1" }],

      // TODO - this is not doing anything - FIX
      vimeo: {
        loop:false,
      },
    },
    () => player.log("onPlayerReady", "123")
  )
  window.player = player
})

onBeforeUnmount(() => {
  player && player.dispose()
})


const full = () => document.querySelector('html').requestFullscreen()
</script>

<style scoped>
  
  video {
    width:800px;
  }
  button {
    width: 8em;
  }
</style>
