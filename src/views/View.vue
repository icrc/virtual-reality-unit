<!-- View Page -->
<template>
  <div class="s-container">
    <main ref="mainViewContainer" style="--span: 12" class="main_view_container" :style="{ visibility: isVideoReady ? 'visible' : 'hidden' }">
      <story-player @ready="handlePlayerReady" :data="{}" ref="player" :containerEl="mainViewContainer" />
    </main>
    <div class="buttons">
      <button>Start</button>
      <button style="width: 30%" @click="player.goFullscreen">Full Screen</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import StoryPlayer from "@/components/StoryPlayer.vue"

const player = ref()

const isVideoReady = ref(false)
const mainViewContainer = ref(null)

const handlePlayerReady = () => {
  isVideoReady.value = true
}


</script>

<style scoped>
.buttons {
  padding-top: 1em;
  display: flex;
  gap: 1em;
}

</style>
