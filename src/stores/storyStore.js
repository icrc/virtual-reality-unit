import { defineStore } from "pinia"
import { ref, computed, reactive } from "vue"

import { VERSION, storage } from "@/config"

const EMPTY_STORY = {}

export const useStoryStore = defineStore("story", () => {
  // In returned items:
  //  ref()s become state properties (can get actual refs by using pina.storeToRefs)
  //  computed()s become getters
  //  function()s become actions

  const currentStory = ref(null)
  const isSaved = ref(null)
  const currentFilename = ref(null)

  // replace the current story with a new, blank story
  function createStory() {
    currentStory.value = { ...EMPTY_STORY }
    currentFilename.value = null
    isSaved.value = false
    currentHighestVideoId = 0
  }

  // load a previously saved story
  async function loadStory(filename) {
    const story = await storage.load(filename)
    if (story) {
      currentStory.value = story
      isSaved.value = true
      currentFilename.value = filename
      currentHighestVideoId = getHighestVideoId(story)
      return true
    }
    return false
  }

  // save the current story (optionally changing name)
  async function saveStory(newFilename = false) {
    const saved = await storage.save(newFilename || currentFilename, currentStory.value)
    if (saved) {
      currentFilename.value = newFilename
    }
    return saved
  }

  // add a video to the current story
  function addVideo(data) {
    currentStory.value.videos.push({ ...data, id: nextVideoId() })
  }

  // delete a video from the current story
  function deleteVideo(id) {
    currenyStory.value.videos = currentStory.value.videos.filter(video => video.id!== id)
    currentHighestVideoId = getHighestVideoId(story)
  }

  // update a video in the current story
  function updateVideo(id, data) {
    currentStory.value.videos = currentStory.value.videos.map(video => id === id? {...video,...data } : video)
  }

  // add a scene to the current story
  function addScene(data) {}

  // delete a scene from the current story
  function deleteScene(id) {}

  // update a scene in the current story
  function updateScene(id, data) {}

  // add an event to a scene in the current story
  function addEvent(sceneId, data) {}

  // delete an event from a scene in the current story
  function deleteEvent(sceneId, eventId) {}

  // update an event in a scene in the current story
  function updateEvent(sceneId, eventId, data) {}

  let currentHighestVideoId = 0
  const nextVideoId = () => ++currentHighestVideoId
  const getHighestVideoId = story => Math.max(...story.videos.map(({ id }) => id))

  createStory()

  return {
    currentStory,
    isSaved,
    get currentFilename() {
      return currentFilename
    },

    createStory,
    loadStory,
    saveStory,

    addVideo,
    deleteVideo,
    updateVideo,

    addScene,
    deleteScene,
    updateScene,

    addEvent,
    deleteEvent,
    updateEvent,
  }
})
