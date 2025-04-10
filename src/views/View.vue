<!-- View Page -->
<template>
  <div class="s-container">
    <main ref="mainViewContainer" style="--span: 12" class="main_view_container" :style="{ visibility: isShowable || !isPlayable ? 'visible' : 'hidden' }">
      <story-player
        :do-start="handleStart"
        :do-abort="handleReset"
        v-if="alive && isPlayable"
        @ready="handlePlayerReady"
        @showable="handlePlayerShowable"
        :data="storyData"
        ref="player"
        :handle-double-click="toggleFullscreen"
        :containerEl="mainViewContainer" />
      <div class="unplayable_message" v-if="!isPlayable">Current project is not playable.<br />Please check for a valid start scene and video.</div>
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
import { ref, nextTick, toRaw, onMounted, inject } from "vue"
import { useRouter, useRoute } from "vue-router"
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

let uncompressStoryData = false

let abortController

const props = defineProps({
  data: String,
})

const toggleFullscreen = () => player.value.goFullscreen(!player.value.isFullscreen)

/**
 * Start the playback
 */
const handleStart = async () => {
  abortController = new AbortController()
  const res = await player.value.start(abortController.signal)
  if (!res.aborted) {
    if (Object.entries(res.finalState).length) {
      if (process.env.NODE_ENV === "development") console.log("Finished! Final state:\n\n" + JSON.stringify(res.finalState, null, 2))
    }
    if (document.fullscreen) document.exitFullscreen()
    handleReset()
  }
}

/**
 * Gets the current story data.
 *
 * @return     {Object}  The story data.
 */
const getStoryData = () => {
  const route = useRoute()
  if (uncompressStoryData || route?.name == "play") {
    const story = uncompressStoryData || store.uncompressStoryData(props.data)
    uncompressStoryData = structuredClone(story)
    if (!story) {
      useRouter().replace({ name: "unknown" })
      return null
    } else {
      return story
    }
  } else {
    return toRaw(store.currentStory)
  }
}

/**
 * Handle resetting playback (teardown player, then reinstantiate on next tick)
 */
const handleReset = () => {
  abortController.abort()
  alive.value = false
  storyData.value = getStoryData()
  nextTick(() => (alive.value = true))
}

onMounted(() => {
  storyData.value = getStoryData()
  inject('setWindowTitle')(storyData.value?.title)
  isPlayable.value = store.isStoryPlayable(storyData.value)
})
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
