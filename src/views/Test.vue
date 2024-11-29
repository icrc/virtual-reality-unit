<!-- Test Page -->
<template>
  <div class="s-container">
    <h1>Testing</h1>
    <div :class="{ player_container: true, full_screen: isFullscreen }">
      <player width="800px" @ready="onPlayerReady" @error="onPlayerError" :ref="myPlayer" :options="playerOptions" />
      <div @click="floater" class="floating_test"></div>
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
      <button @click="vimeoChapters">Chapters Info</button>
      <button @click="testActionCode">Test ActionCode parser</button>
    </div>
  </div>
</template>

<script>
import { VIDEO_SOURCE_TYPES } from "@/config"
</script>

<script setup>
import { ref } from "vue"
import Player from "@/components/Player.vue"
import { useFullscreen } from "@/composables/fullscreen"

import { parser } from "@/libs/actionCode"

const testActionCode = () => {
  const code = `setStateValue: 'myVal',1
gotoScene: 8
gotoScene: @jonScene
gotoScene: @myVal
setStateValue: 'keyName', 'myKey'
setStateValue: 'myVal', @myVal+36
setStateValue: 'myVal', 'Hello' + @myVal
setStateValue: @keyName, 'String test'`
  const state = { jonScene: 48 }
  parser(code, state).forEach(({ action, args }) => {
    console.log({ action, args })
    if (action == "setStateValue") state[args[0]] = args[1]
  })
  console.log()
}

// TODO - alt code if we have to a safeEval for passing args
// const testActionCode = async () => {
//   const code = `setStateValue: myVal,1
// gotoScene: 8
// gotoScene: @myVal
// setStateValue: keyName, 'myKey'
// setStateValue: myVal, @myVal+36
// setStateValue: myVal, 'Hello' + @myVal
// setStateValue: @keyName, 'String test'`
//   const state = {}
//   for await (const action of parser(code, state)) {
//     console.log(action)
//   }
// }

const myPlayer = ref()
let videoJS

const { isFullscreen } = useFullscreen()

const onPlayerReady = vJS => {
  videoJS = window.videoJS = vJS
  videoJS.getDimensions().then(dimensions => console.log(dimensions))
}

const onPlayerError = error => console.error("Player error:", error)

const playerOptions = {
  // sources: [{ type: "video/vimeo", src: "https://vimeo.com/541416221" }, { src: "/videos/05.mp4" }],
  sources: [
    // { type: "video/vimeo", src: "https://plasyer.vimeo.com/video/1025039220?h=1d3c27a454&badge=0&autopause=0&player_id=0&app_id=58479" },
    // { type: "video/mp4", src: "/visdeos/05.mp4" },
    // { type: "video/mp4", src: "https://www.google.com" },
    { type: "video/vimeo", src: "https://player.vimeo.com/video/1025039220?h=1d3c27a454&badge=0&autopause=0&player_id=0&app_id=58479" },
    //{ type: "video/mp4", src: "/videos/05.mp4" },
  ],
  vimeo: {
    // controls: true,
  },
  // sources: [{ src: "/videos/05.mp4" }, { type: "video/vimeo", src: "https://player.vimeo.com/video/1025039220?h=1d3c27a454&badge=0&autopause=0&player_id=0&app_id=58479&background=1" }]
}

const full = () => document.querySelector("html").requestFullscreen()
const play = () => videoJS.play()
const pause = () => videoJS.pause()
const jump = () => videoJS.currentTime(43)
const floater = () => alert("Clicked a floating button over video")

const vimeoChapters = () => VIDEO_SOURCE_TYPES.vimeo.features.getChapters(videoJS.tech()).then(cp => alert(JSON.stringify(cp, null, " ")))

// const vimeoChapters = () =>
//   videoJS
//     .tech()
//     .getChapters()
//     .then(cp => alert(JSON.stringify(cp, null, " ")))

const dbxChoose = () => {
  Dropbox.choose({
    success: function (files) {
      alert("Here's the file link: " + files[0].link)
      alert("Here's the file name: " + files[0].name)
      alert("Here's the file id: " + files[0].id)
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
.player_container {
  position: relative;
  display: inline-block;
  width: 100%;
  &.full_screen {
    position: fixed;
    inset: 0 0 0 0;
    & .video-js {
      width: 100%;
      height: 100%;
    }
  }
}
.floating_test {
  position: absolute;
  top: 20%;
  left: 10%;
  width: calc(10% / (16 / 9));
  height: 10%;
  border-radius: 50%;
  background: #f00;
  cursor: pointer;
}
</style>
