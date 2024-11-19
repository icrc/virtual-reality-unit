<!-- Scenes Component - for editing scene objects -->
<template>
  <article>
    <details>
      <summary role="button">Scenes ({{ story.scenes.length }})</summary>
      <div style="--span: 4" class="s-grid">

        <template v-for="(scene, idx) in story.scenes" :key="scene.id">
          <form>
          <label style="--span: 5">Title<input placeholder="n/a" type="text" v-model="scene.title" /></label>
          <label style="--span: 3">Video
              <select v-model="scene.videoId">
                <option v-for="video in story.videos" idx="video.id" :value="video.id">{{ video.title }}</option>
              </select>
          </label>
          </form>
          <hr v-if="idx < story.scenes.length - 1" />


        </template>

      </div>
    </details>
  </article>
</template>

<script></script>

<script setup>
import { computed } from "vue"

const props = defineProps({
  store: {
    type: Object,
    default() {
      return {}
    },
  },
})

const story = computed(() => props.store.currentStory)


</script>

<style scoped></style>
