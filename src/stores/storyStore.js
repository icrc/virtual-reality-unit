import { defineStore } from "pinia"
import { ref, watch, toRaw } from "vue"

import { VERSION, storage } from "@/config"

// ** TODO ** make a watcher on main story state change for setting 'isSaved'

// empty, blank story/project
const EMPTY_STORY = {
  version: VERSION,
  title: "New Project",
  author: "",
  info: "",
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

  let currentHighestVideoId = -1
  let currentHighestSceneId = -1

  let mostRecentSavedJSON = ""

  // watch the main story for changes to set isSaved
  watch(
    () => JSON.stringify(currentStory.value),
    (newStoryJSON, oldStoryJSON) => {
      isSaved.value = newStoryJSON === mostRecentSavedJSON
    }
  )

  // replace the current story with a new, blank story
  function newStory() {
    currentStory.value = structuredClone(EMPTY_STORY)
    mostRecentSavedJSON = JSON.stringify(currentStory.value)
    currentFilename.value = ""
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
      currentHighestVideoId = getHighestVideoId(story) ?? -1
      currentHighestSceneId = getHighestSceneId(story) ?? -1
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
    currentStory.value.videos = currentStory.value.videos.filter(video => video.id !== id)
    currentHighestVideoId = getHighestVideoId(currentStory.value) ?? -1
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
    currentStory.value.scenes = currentStory.value.scenes.filter(scene => scene.id !== id)
    currentHighestSceneId = getHighestSceneId(currentStory.value) ?? -1
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

  const nextVideoId = () => ++currentHighestVideoId
  const getHighestVideoId = story => story.videos.length ? Math.max(...story.videos.map(({ id }) => id)) : null

  const nextSceneId = () => ++currentHighestSceneId
  const getHighestSceneId = story => story.scenes.length ? Math.max(...story.scenes.map(({ id }) => id)) : null

  const getHighestEventIdForScene = scene => (scene.events.length ? Math.max(...scene.events.map(({ id }) => id)) : -1)

  newStory()

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
  }
})
