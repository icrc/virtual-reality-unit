<!-- Player Component -->
<template>
  <video ref="videoPlayer" class="video-js"></video>
</template>

<script>
const DEFAULT_OPTIONS = {
  autoplay: false,
  controls: false,
  techOrder: ["html5", "vimeo"],
}

const DEFAULT_VIMEO_OPTIONS = {
  loop: false,
}

const vimeoOptionsFromVJSOptions = ({ autoplay, loop, controls }) => ({
  autoplay,
  loop,
  controls,
})
</script>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import "video.js/dist/video-js.min.css"
import videojs from "video.js"
import "../libs/vimeoVideoJS"

const videoPlayer = ref()
let videoJS

const props = defineProps({
  options: {
    type: Object,
    default() {
      return {}
    },
  },
})

const emit = defineEmits(["ready", "error"])

const getDimensions = async () => {
  if (videoJS.tech().getDimensions) {
    return await videoJS.tech().getDimensions()
  } else {
    return { width: videoJS.videoWidth(), height: videoJS.videoHeight() }
  }
}

onMounted(() => {
  const mainOpts = {
    ...DEFAULT_OPTIONS,
    ...props.options,
  }
  const opts = {
    ...mainOpts,
    vimeo: {
      ...DEFAULT_VIMEO_OPTIONS,
      ...vimeoOptionsFromVJSOptions(mainOpts),
      ...mainOpts.vimeo,
    },
  }

  videoJS = videojs(videoPlayer.value, opts, function() {
    emit("ready", videoJS)
  })

  // emit errors from VideoJS
  videoJS.on("error", event => emit("error", videoJS.error()))
  videoJS.getDimensions = getDimensions
})

onBeforeUnmount(() => {
  videoJS && videoJS.dispose()
})
</script>

<style scoped>
.video-js {
  width: 100%;
}
</style>
