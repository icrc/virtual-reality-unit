<!-- View Page -->
<template>
  <div class="s-container">
    <main ref="mainViewContainer" style="--span: 12" class="main_view_container" :style="{ visibility: isShowable ? 'visible' : 'hidden' }">
      <story-player v-if="alive" @ready="handlePlayerReady" @showable="handlePlayerShowable" :data="storyData" ref="player" :containerEl="mainViewContainer" />
    </main>
    <div class="buttons">
      <button :disabled="!isVideoReady" @click="() => player?.playbackActive ? handleReset() : handleStart()">{{ player?.playbackActive ? "Reset" : "Start" }}</button>
      <button style="width: 30%" @click="player.goFullscreen">Full Screen</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, toRaw } from "vue"
import StoryPlayer from "@/components/StoryPlayer.vue"

import { useStoryStore } from "@/stores/storyStore"
const store = useStoryStore()
const storyData = toRaw(store.currentStory)

const player = ref()

const isVideoReady = ref(false)
const isShowable = ref(false)
const mainViewContainer = ref(null)
const alive = ref(true)

const handlePlayerReady = () => isVideoReady.value = true
const handlePlayerShowable = () => isShowable.value = true

let abortController

const handleStart = async () => {
  abortController = new AbortController()
  const res = await player.value.start(abortController.signal)
  console.log(res)
}

const handleReset = () => {
  abortController.abort()
  alive.value = false
  nextTick(() => alive.value = true)
}



</script>

<style scoped>
.buttons {
  padding-top: 1em;
  display: flex;
  gap: 1em;
}

</style>
