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
                <option v-for="type in Object.values(VIDEO_SOURCE_TYPES)" :value="type.id" :key="type.id">{{ type.name }}</option>
              </select>
            </label>
            <label style="--span: 2">Title<input class="video_name" placeholder="(Untitled video)" type="text" v-model="video.title" /></label>
            <label>URL<input type="text" v-model="video.url" /></label>
          </div>
          <div class="action_buttons">
            <button @click="importChapters(video.sourceType)" v-if="chaptersAvailableForSourceType(video.sourceType)" class="s-outline">Import Chapters as Scenes</button>
            <button @click="deleteVideo(video.id)" class="s-outline">Delete</button>
          </div>
          <hr v-if="idx < story.videos.length - 1" />
        </template>
      </div>
    </details>
  </article>
</template>

<script>
import { VIDEO_SOURCE_TYPES, DEFAULT_VIDEO_SOURCE_TYPE } from "@/config"

const NEW_VIDEO_DEFAULTS = {
  title: "",
  sourceType: DEFAULT_VIDEO_SOURCE_TYPE,
  url: "",
  thumbnail: "",
  info: "",
  audiotracks: [],
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

const deleteVideo = videoId => {
  const relatedScenes = props.store.getScenesByVideoId(videoId)
  if (
    relatedScenes.length &&
    !confirm(
      `This video has related scenes:\n\n${relatedScenes.map(scene => `'${scene.title}'`).join("\n")}\n\nAre you sure you want to delete this video and related scenes?`
    )
  )
    return
  props.store.deleteVideo(videoId, true)
}

const addVideo = () => {
  const id = props.store.addVideo(structuredClone(NEW_VIDEO_DEFAULTS))
  header.value.open = true
  nextTick(() => document.querySelector(`#video_${id} .video_name`).focus())
}

const importChapters = async sourceType => {
  // need to instantiate a video player with the URL before the below will work
  const chapters = await VIDEO_SOURCE_TYPES.vimeo.features.getChapters(videoJS.tech())
}

const chaptersAvailableForSourceType = sourceType => VIDEO_SOURCE_TYPES[sourceType]?.features?.getChapters
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

.action_buttons {
  display:flex;
  justify-content: flex-end;
  gap: 0.5em;
  & > button {
    width: fit-content;
  }
}
</style>
