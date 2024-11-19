import { defineStore } from "pinia"
import { ref, computed, reactive, watch } from "vue"

import { VERSION, storage } from "@/config"

// ** TODO ** make a watcher on main story state change for setting 'isSaved'


// empty, blank story/project
const EMPTY_STORY = {
  version: VERSION,
  title: "New Project",
  author: "Unknown author",
  info: "Test\ninfo\ndata",
  locales: ["en"],

  videos: [],
  scenes: [],
  initialState: {},
  translations: {},
}

export const useStoryStore = defineStore("story", () => {
  // In returned items:
  //  ref()s become state properties (can get actual refs by using pina.storeToRefs)
  //  computed()s become getters
  //  function()s become actions

  const currentStory = ref(null)
  const isSaved = ref(false)
  const currentFilename = ref(null)

  let mostRecentSavedJSON = ""

  // watch the main story for changes to set isSaved
  watch(() => JSON.stringify(currentStory.value), (newStoryJSON, oldStoryJSON) => {
    isSaved.value = newStoryJSON === mostRecentSavedJSON
  })

  // replace the current story with a new, blank story
  function createStory() {
    currentStory.value = { ...EMPTY_STORY }
    mostRecentSavedJSON = JSON.stringify(currentStory.value)
    currentFilename.value = null
    currentHighestVideoId = -1
    currentHighestSceneId = -1
  }

  // pick a filename to load
  async function pickStory() {
    const filename = await storage.pick()
    return filename
  }

  // load a previously saved story
  async function loadStory(filename) {
    const story = await storage.load(filename)
    if (story) {
      currentStory.value = story
      mostRecentSavedJSON = JSON.stringify(currentStory.value)
      currentFilename.value = filename
      currentHighestVideoId = getHighestVideoId(story)
      currentHighestSceneId = getHighestSceneId(story)
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
    currenyStory.value.videos = currentStory.value.videos.filter(video => video.id !== id)
    currentHighestVideoId = getHighestVideoId(currentStory.value)
  }

  // update a video in the current story
  function updateVideo(id, data) {
    currentStory.value.videos = currentStory.value.videos.map(video => (video.id === id ? { ...video, ...data } : video))
  }

  // add a scene to the current story
  function addScene(data) {
    currentStory.value.scenes.push({ ...data, id: nextSceneId() })
  }

  // delete a scene from the current story
  function deleteScene(id) {
    currentStory.value.scenes = currentStory.value.scenes.filter(scene => scene.id !== id)
    currentHighestSceneId = getHighestSceneId(currentStory.value)
  }

  // update a scene in the current story
  function updateScene(id, data) {
    currentStory.value.scenes = currentStory.value.scenes.map(scene => (scene,id === id ? {...scene,...data } : scene))
  }

  // add an event to a scene in the current story
  function addEvent(sceneId, data) {
    const scene = getSceneById(sceneId)
    if (!scene) return false
    scene.events.push({...data, id: nextEventIdForScene(scene) })
  }

  // delete an event from a scene in the current story
  function deleteEvent(sceneId, eventId) {
    const scene = getSceneById(sceneId)
    if (!scene) return false
    scene.events = scene.events.filter(({ id }) => id!== eventId)
  }

  // update an event in a scene in the current story
  function updateEvent(sceneId, eventId, data) {
    const scene = getSceneById(sceneId)
    if (!scene) return false
    scene.events = scene.events.map(event => (event.id === eventId ? {...event,...data } : event))
  }


  const getSceneById = sceneId => currentStory.value.scenes.find(({id}) => id === sceneId)

  let currentHighestVideoId = 0
  const nextVideoId = () => ++currentHighestVideoId
  const getHighestVideoId = story => Math.max(...story.videos.map(({ id }) => id))

  let currentHighestSceneId = 0
  const nextSceneId = () => ++currentHighestSceneId
  const getHighestSceneId = story => Math.max(...story.scenes.map(({ id }) => id))

  const getHighestEventIdForScene = scene => scene.events.length ? Math.max(...scene.events.map(({ id }) => id)) : -1

  createStory()

  return {
    currentStory,
    isSaved,
    get currentFilename() {
      return currentFilename
    },

    createStory,
    pickStory,
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
