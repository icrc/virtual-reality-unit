<!-- Scenes Component - for editing scene objects -->
<template>
  <article>
    <details ref="header" class="scenes_header">
      <summary role="button">Scenes ({{ story.scenes.length }})<button @click="addScene" class="add_button">+</button></summary>
      <div style="--span: 4" class="s-grid scenes-container">
        <template v-for="(scene, idx) in story.scenes" :key="scene.id">
          <div :id="`scene_${scene.id}`">
            <label style="--span: 5">Title<input class="scene_title" placeholder="(No title)" type="text" v-model="scene.title" /></label>
            <label style="--span: 3"
              >Next scene
              <select v-model="scene.nextSceneId">
                <option :value="-1">(n/a)</option>
                <option v-for="scene in story.scenes" idx="scene.id" :value="scene.id">{{ scene.title || '(No title)' }}</option>
              </select>
            </label>
          </div>
          <div>
            <label style="--span: 1">Start time (s)<input placeholder="n/a" type="number" min="-1" v-model="scene.startTime" /></label>
            <label style="--span: 1">End time (-1: end)<input placeholder="n/a" type="number" min="-1" v-model="scene.endTime" /></label>
            <label style="--span: 3"
              >Video
              <select v-model="scene.videoId">
                <option v-if="story.videos.length" v-for="video in story.videos" idx="video.id" :value="video.id">{{ video.title || '(Untitled video)' }}</option>
                <option v-else :value="-1">No videos available. Please add one</option>
              </select>
            </label>
          </div>
          <div style="justify-items: end">
            <button @click="deleteScene(scene.id)" class="s-outline" style="width: fit-content">Delete</button>
          </div>
          <hr v-if="idx < story.scenes.length - 1" />
        </template>
      </div>
    </details>
  </article>
</template>

<script>
const NEW_SCENE_DEFAULTS = {
  videoId: undefined,
  title: "",
  startTime: 0,
  endTime: -1,
  nextSceneId: -1,
  events: [],
}
</script>

<script setup>
import { ref, computed, nextTick } from "vue"

const header = ref(null)

const props = defineProps({
  store: {
    type: Object,
    default() {
      return {}
    },
  },
})

const story = computed(() => props.store.currentStory)

const deleteScene = sceneId => props.store.deleteScene(sceneId)

const addScene = () => {
  const id = props.store.addScene(structuredClone(NEW_SCENE_DEFAULTS))
  header.value.open = true
  nextTick(() => document.querySelector(`#scene_${id} .scene_title`).focus())
}
</script>

<style scoped>
.scenes-container {
  font-size: 90%;
}

.scenes_header {
  position: relative;
}

.add_button {
  width: fit-content;
  right: 3.25em;
  position: absolute;
  height: 1em;
  font-weight: bold;
  border: 1px solid #fff;
  &:hover {
    background: #fff;
    color: var(--s-color-primary-80-fg);
  }
}
</style>
