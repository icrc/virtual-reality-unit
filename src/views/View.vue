<!-- View Page -->
<template>
  <div class="s-container">
    <main ref="mainViewContainer" style="--span: 12" class="main_view_container" :style="{ visibility: (isShowable || !isPlayable) ? 'visible' : 'hidden' }">
      <story-player v-if="alive && isPlayable" @ready="handlePlayerReady" @showable="handlePlayerShowable" :data="storyData" ref="player" :containerEl="mainViewContainer" />
      <div class="unplayable_message" v-if="!isPlayable">Current project is not playable.<br>Please check for a valid start scene and video.</div>
    </main>
    <div class="buttons">
      <button :disabled="!isVideoReady" @click="() => (player?.playbackActive ? handleReset() : handleStart())">
        {{ player?.playbackActive ? "Reset" : "Start" }}
      </button>
      <button :disabled="!isPlayable" style="width: 30%" @click="player.goFullscreen">Full Screen</button>
    </div>
  </div>
</template>

<script>
import { alert } from "@/libs/popups"
</script>

<script setup>
import { ref, nextTick, toRaw } from "vue"
import StoryPlayer from "@/components/StoryPlayer.vue"

import { useStoryStore } from "@/stores/storyStore"
const store = useStoryStore()
const storyData = ref()
const isPlayable = ref()

const player = ref()

const isVideoReady = ref(false)
const isShowable = ref(false)
const mainViewContainer = ref(null)
const alive = ref(true)

const handlePlayerReady = () => (isVideoReady.value = true)
const handlePlayerShowable = () => (isShowable.value = true)

let abortController

/**
 * Start the playback
 */
const handleStart = async () => {
  abortController = new AbortController()
  const res = await player.value.start(abortController.signal)
  if (!res.aborted) {
    console.log(res.finalState)
    await alert("Finished! (check console for final state)")
    handleReset()
  }
}

/**
 * Gets the current story data.
 *
 * @return     {Object>}  The story data.
 */
const getStoryData = () => structuredClone(toRaw(store.currentStory))

/**
 * Handle resetting playback (teardown player, then reinstantiate on next tick)
 */
const handleReset = () => {
  abortController.abort()
  alive.value = false
  storyData.value = getStoryData()
  nextTick(() => (alive.value = true))
}

storyData.value = getStoryData()
isPlayable.value = store.isCurrentStoryPlayable
</script>

<style scoped>
.buttons {
  padding-top: 1em;
  display: flex;
  gap: 1em;
}

.unplayable_message {
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
  font-size: 2.5vw;
  text-align: center;
}
</style>
