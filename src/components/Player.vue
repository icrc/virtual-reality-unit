<!-- Player Component -->
<template>
  <video ref="videoPlayer" class="video-js" width="650px"></video>
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

const emit = defineEmits(["ready"])

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

  videoJS = videojs(videoPlayer.value, opts, () => emit("ready", videoJS))
})

onBeforeUnmount(() => {
  videoJS && videoJS.dispose()
})
</script>

<style scoped></style>
