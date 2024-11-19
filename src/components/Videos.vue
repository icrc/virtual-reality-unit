<!-- Videos Component - for editing video objects -->
<template>
  <article>
    <details open>
      <summary role="button">Video Sources ({{ story.videos.length }})</summary>
      <div style="--span: 4" class="s-grid">

        <form v-for="(video, idx) in story.videos" :key="idx">
          <label style="--span: 1"
            >{{ idx ? '' : 'Type' }}
            <select v-model="video.sourceType">
              <option value="vimeo">Vimeo</option>
              <option value="mp4">MP4</option>
            </select>
          </label>
          <label style="--span: 2">{{ idx ? '' : 'Title' }}<input placeholder="n/a" type="text" v-model="video.title" /></label>
          <label style="--span: 4">{{ idx ? '' : 'URL' }}<input placeholder="n/a" type="text" v-model="video.url" /></label>
        </form>

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

const story = computed(()=>props.store.currentStory)

</script>

<style scoped></style>
