import { defineStore } from "pinia"
import { ref, computed, watch, toRaw } from "vue"

import { VERSION, storage } from "@/config"

const STORAGE_KEY = "videopath_story"

// empty, blank story/project
const EMPTY_STORY = {
  version: VERSION,
  title: "New Project",
  author: "",
  info: "",
  initialSceneId: -1,
  locales: ["en"],

  videos: [],
  scenes: [],
  initialState: {},
  translations: {},
}

export const EVENT_TYPES = {
  action: "action",
  choice: "choice",
}

export const CHOICE_TYPES = {
  block: "block",
  timed: "timed",
}

export const useStoryStore = defineStore("story", () => {
  // In returned items:
  //  ref()s become state properties (can get actual refs by using pina.storeToRefs)
  //  computed()s become getters
  //  function()s become actions

  const currentStory = ref(null)
  const isSaved = ref(false)
  const currentFilename = ref(null)

  let currentHighestVideoId = 0
  let currentHighestSceneId = 0

  let mostRecentSavedJSON = ""

  // watch the main story for changes to set isSaved and persist data
  watch(
    () => JSON.stringify(currentStory.value),
    (newStoryJSON, oldStoryJSON) => {
      isSaved.value = newStoryJSON === mostRecentSavedJSON
      persistStory(JSON.parse(newStoryJSON))
    }
  )

  // set everything up
  function setup() {
    const persistedStory = JSON.parse(localStorage.getItem(STORAGE_KEY))
    newStory(persistedStory || undefined)
  }

  // persist the story
  function persistStory(story) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(story))
  }

  // replace the current story with a new, blank story
  function newStory(data = EMPTY_STORY) {
    currentStory.value = structuredClone(data)
    mostRecentSavedJSON = data===EMPTY_STORY ? JSON.stringify(currentStory.value) : ''
    currentFilename.value = ""
    currentHighestVideoId = 0
    currentHighestSceneId = 0
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
      currentHighestVideoId = getHighestVideoId(story) ?? 0
      currentHighestSceneId = getHighestSceneId(story) ?? 0
      return true
    }
    return false
  }

  // choose save filename
  async function chooseStoryFilename() {
    return await storage.chooseSaveFilename(currentFilename.value)
  }

  // save the current story (optionally changing name)
  async function saveStory(newFilename = false) {
    const saved = await storage.save(newFilename || currentFilename.value, toRaw(currentStory.value))
    if (saved) {
      if (newFilename) currentFilename.value = newFilename
      mostRecentSavedJSON = JSON.stringify(currentStory.value)
      isSaved.value = true
    }
    return saved
  }

  // add a video to the current story
  function addVideo(data) {
    const video = { ...data, id: nextVideoId() }
    currentStory.value.videos.push(video)
    return video.id
  }

  // delete a video from the current story
  function deleteVideo(id, includeRelatedScenes = false) {
    if (includeRelatedScenes) getScenesByVideoId(id).forEach(scene => deleteScene(scene.id))
    currentStory.value.videos = currentStory.value.videos.filter(video => video.id !== id).map(video => toRaw(video))
    currentHighestVideoId = getHighestVideoId(currentStory.value) ?? 0
  }

  // update a video in the current story
  function updateVideo(id, data) {
    currentStory.value.videos = currentStory.value.videos.map(video => (video.id === id ? { ...video, ...data } : video))
  }

  // add a scene to the current story
  function addScene(data) {
    const scene = { ...data, id: nextSceneId() }
    currentStory.value.scenes.push(scene)
    return scene.id
  }

  // delete a scene from the current story
  function deleteScene(id) {
    currentStory.value.scenes = currentStory.value.scenes.filter(scene => scene.id !== id).map(scene => toRaw(scene))
    currentHighestSceneId = getHighestSceneId(currentStory.value) ?? 0
  }

  // update a scene in the current story
  function updateScene(id, data) {
    currentStory.value.scenes = currentStory.value.scenes.map(scene => (scene, id === id ? { ...scene, ...data } : scene))
  }

  // add an event to a scene in the current story
  function addEvent(sceneId, data) {
    const scene = getSceneById(sceneId)
    if (!scene) return false
    const event = { ...data, id: nextEventIdForScene(scene) }
    scene.events.push(event)
    return event.id
  }

  // delete an event from a scene in the current story
  function deleteEvent(sceneId, eventId) {
    const scene = getSceneById(sceneId)
    if (!scene) return false
    scene.events = scene.events.filter(({ id }) => id !== eventId)
  }

  // update an event in a scene in the current story
  function updateEvent(sceneId, eventId, data) {
    const scene = getSceneById(sceneId)
    if (!scene) return false
    scene.events = scene.events.map(event => (event.id === eventId ? { ...event, ...data } : event))
  }

  // check if we have scenes with given video
  function getScenesByVideoId(videoId) {
    return currentStory.value.scenes.filter(scene => scene.videoId === videoId)
  }

  const getSceneById = sceneId => currentStory.value.scenes.find(({ id }) => id === sceneId)
  const getVideoById = videoId => currentStory.value.videos.find(({ id }) => id === videoId)

  const nextVideoId = () => ++currentHighestVideoId
  const getHighestVideoId = story => (story.videos.length ? Math.max(...story.videos.map(({ id }) => id)) : null)

  const nextSceneId = () => ++currentHighestSceneId
  const getHighestSceneId = story => (story.scenes.length ? Math.max(...story.scenes.map(({ id }) => id)) : null)

  const getHighestEventIdForScene = scene => (scene.events.length ? Math.max(...scene.events.map(({ id }) => id)) : 0)
  const nextEventIdForScene = scene => getHighestEventIdForScene(scene) + 1


  const isCurrentStoryPlayable = computed(() => {
    // Initial scene set?
    const sceneId = currentStory.value.initialSceneId
    if ([undefined, -1].includes(sceneId)) return false
    // Initial scene exists
    const scene = getSceneById(sceneId)
    if (!scene) return false
    // Initial scene has video
    const video = getVideoById(scene.videoId)
    if (!video) return false
    // Video has sourceType and url
    if (!video.sourceType ||!video.url) return false
    // probably playable (although we're not checking for valid URL)
    return true
  })



  setup()

  return {
    currentStory,
    isSaved,
    get currentFilename() {
      return currentFilename
    },

    newStory,
    pickStory,
    loadStory,
    saveStory,
    chooseStoryFilename,

    addVideo,
    deleteVideo,
    updateVideo,

    addScene,
    deleteScene,
    updateScene,

    addEvent,
    deleteEvent,
    updateEvent,

    getScenesByVideoId,

    isCurrentStoryPlayable
  }
})
