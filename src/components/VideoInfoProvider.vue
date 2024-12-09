<!-- Video Info Provider Component - for loading a video (hidden) and using functions (exposed) to retrieve info about the video -->
<template>
  <div v-if="usePlayer" class="player_wraapper">
    <player @ready="onPlayerReady" @error="onPlayerError" :options="playerOptions" />
  </div>
</template>

<script>
import { VIDEO_SOURCE_TYPES } from "@/config"
</script>

<script setup>
import { ref, onUnmounted } from "vue"

import Player from "@/components/Player.vue"

const usePlayer = ref(false)
const playerOptions = ref(null)
const onPlayerReady = ref(null)
const onPlayerError = ref(null)

const getChapters = functionWithVideoJS(async (vjs, sourceType) =>
  await VIDEO_SOURCE_TYPES[sourceType].features.getChapters(vjs.tech()))

// TODO - add a preload/cache function that we will expose 

/**
 * Turns a function that expects a videoJS instance into one that will expect a sourceType and a URL that will be used
 * to create the videoJS instance to pass into the original function
 *
 * @param      {Function}  fn                         The function expecting args in the form (vjs, [sourceType], [url])
 * @param      {Boolean}   [destroyVJSWhenDone=true]  Flag to determine if player should be destroyed when function is
 *                                                    complete
 * @return     {Function}  Function expecting args (sourceType, url)
 */
function functionWithVideoJS(fn, destroyVJSWhenDone = true) {
  return async (sourceType, URL) => {
    let videoJS,
      result = null,
      error
    try {
      if ((videoJS = await getVideoJS(sourceType, URL))) {
        result = await fn(videoJS, sourceType, URL)
      } else {
        error = true
      }
    } catch (err) {
      error = err
    }
    destroyVJSWhenDone && teardownVideoJS()
    return [result, error]
  }
}

/**
 * Gets a video js instance.
 *
 * @param      {String}   sourceType  The source type ('vimeo', 'mp4', etc.)
 * @param      {String}   URL         The url
 * @return     {Promise}  Resolves to the videojs instance
 */
function getVideoJS(sourceType, URL) {
  return new Promise((resolve, reject) => {
    playerOptions.value = {
      sources: [{ type: `video/${sourceType}`, src: URL }],
    }
    onPlayerReady.value = videoJS => {
      onPlayerError.value = undefined
      resolve(videoJS)
    }
    onPlayerError.value = reject
    usePlayer.value = true
    setTimeout(reject, 5000)
  })
}

/**
 * Destroy the player
 */
function teardownVideoJS() {
  usePlayer.value = false
}

onUnmounted(teardownVideoJS)

defineExpose({
  getChapters,
})
</script>

<style scoped>
.player_wraapper {
  display: none;
}
</style>
