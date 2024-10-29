<script setup>
import { ref, onMounted } from "vue"
import data from "./data.json"

const videos = Object.fromEntries(data.videos.map(video => [video.id, video]))
const locations = Object.fromEntries(data.locations.map(location => [location.id, location]))

const showChoices = ref(false)
let choices = ref([])

let currentLocationId = 1
let onEnded = () => (showChoices.value = true)

const myVideo = ref()

const getChoices = location => {
  const locChoices = location.nextLocations.map(next => ({ ...next, id: `${location.id}-${next.locationId}` }))
  if (location.canGoBack) locChoices.push({ locationId: currentLocationId, prompt: "Go back" })
  return locChoices
}

const playLocation = id => {
  const loc = locations[id]
  showChoices.value = false
  choices.value = getChoices(loc)
  currentLocationId = id
  myVideo.value.src = videos[loc.videoId].src
}

onMounted(() => playLocation(currentLocationId))
</script>

<template>
  <div class="s-container">
    <video ref="myVideo" @ended="onEnded" autoplay controls width="800" height="450"></video>
    <ul v-if="showChoices">
      <li @click="() => playLocation(choice.locationId)" v-for="choice in choices" :key="choice.id">{{ choice.prompt }}</li>
    </ul>
  </div>
</template>

<style scoped></style>
