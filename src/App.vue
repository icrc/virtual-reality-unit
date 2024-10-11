<script setup>
import { ref } from "vue"
const myVideo = ref()
let play = true
const announceDone = () => {
  if (play) {
    myVideo.value.src = "/videos/01.mp4"
    play = false
  }
}
</script>

<template>
  <!-- <video style="visibility: hidden; height:0;" src="/videos/01.mp4" autoplay></video> -->
  <video ref="myVideo" @ended="announceDone" autoplay controls width="1000" src="/videos/00.mp4" autopla></video>
</template>

<style scoped>

</style>
