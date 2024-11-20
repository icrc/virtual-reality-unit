<!-- Videos Component - for editing video objects -->
<template>
  <article>
    <details ref="header" class="videos_header">
      <summary role="button">Video Sources ({{ story.videos.length }})<button @click="addVideo" class="add_button">+</button></summary>
      <div style="--span: 4" class="s-grid videos-container">
        <template v-for="(video, idx) in story.videos" :key="idx">
          <div :id="`video_${video.id}`">
            <label style="--span: 1"
              >Type
              <select v-model="video.sourceType">
                <option value="vimeo">Vimeo</option>
                <option value="mp4">MP4</option>
              </select>
            </label>
            <label style="--span: 2">Title<input placeholder="n/a" type="text" v-model="video.title" /></label>
            <label>URL<input placeholder="n/a" type="text" v-model="video.url" /></label>
          </div>
          <div style="justify-items: end">
            <button @click="deleteVideo(video.id)" class="s-outline" style="width: fit-content">Delete</button>
          </div>
          <hr v-if="idx < story.videos.length - 1" />
        </template>
      </div>
    </details>
  </article>
</template>

<script></script>

<script setup>
import { ref, computed } from "vue"

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

const deleteVideo = videoId => {
  const relatedScenes = props.store.getScenesByVideoId(videoId)
  if (relatedScenes.length && !confirm(`This video has related scenes:\n\n${relatedScenes.map(scene => `'${scene.title}'`).join('\n')}\n\nAre you sure you want to delete?`)) return
  props.store.deleteVideo(videoId, true)
}

// TODO - maybe add some sensible defaults to newly added videos?
const addVideo = () => {
  props.store.addVideo({})
  header.value.open = true
}
// TODO - HERE - make store.addVideo return id, make first editable elephant of newly added video focus on add

</script>

<style scoped>


.videos-container {
  font-size: 90%;
}

.videos_header {
  position: relative;
}

.delete_btn {
  width: 0.5em;
  position: absolute;
  right: -1em;
  font-weight: bold;
  border: none;
  bottom: 0.65em;
  font-size: 1.25rem;
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
