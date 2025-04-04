import { defineStore } from "pinia"
import { ref, computed, watch, toRaw } from "vue"
import LZString from "lz-string"

import { VERSION, storage } from "@/config"
import { DEFAULT_LAYOUT } from "@/layouts"

const STORAGE_KEY = "videopath_story"
const LAST_SAVED_JSON_KEY = "videopath_last_saved_json"
const CURRENT_FILENAME_KEY = "videopath_current_filename"

/** empty, blank story/project */
export const EMPTY_STORY = {
  version: VERSION,
  title: "",
  author: "",
  info: "",
  initialSceneId: -1,
  locales: ["en"],

  defaultChoiceLayout: DEFAULT_LAYOUT,
  defaultChoiceLayoutSettings: {},

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

/**
 * Determines whether the specified story is valid story.
 *
 * @param      {Object}   story   The story
 * @return     {Boolean}  True if the specified story is valid story, False otherwise.
 */
export const isValidStory = story => {
  return ["version", "title", "author", "info", "locales", "defaultChoiceLayout"].every(key => key in story)
}

/**
 * Converts a semver version string to an integer for easier checking
 *
 * @param      {String}  versionStr  The version string
 * @return     {Number}  { description_of_the_return_value }
 */
const intVersion = versionStr => versionStr.split(".").reduce((total, part, index) => total + parseInt(part) * Math.pow(100, 2 - index), 0)

/**
 * Determines whether the specified version is an old version.
 *
 * @param      {String}   version  The version (semver)
 * @return     {boolean}  True if the specified version is an old version, False otherwise.
 */
export const isOldVersion = version => intVersion(VERSION) > intVersion(version)

/**
 * Gets the scene label.
 *
 * @param      {object}  scene   The scene
 * @return     {string}  The scene label.
 */
export const getSceneLabel = scene => (scene.ref ? `[${scene.ref}] - ` : '') + (scene.title || "(No title)")

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

  /**
   * set everything up
   */
  function setup() {
    const persistedStory = JSON.parse(localStorage.getItem(STORAGE_KEY))
    mostRecentSavedJSON = localStorage.getItem(LAST_SAVED_JSON_KEY) || ""
    currentFilename.value = localStorage.getItem(CURRENT_FILENAME_KEY) || null
    newStory(persistedStory || undefined)
  }

  
  /**
   * persist the story to local storage
   *
   * @param      {Object}  story   The story
   */
  function persistStory(story) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(story))
  }

  
  /**
   * persist most recently saved json to local storage
   *
   * @param      {String}  json    The json
   */
  function persistMostRecentJSON(json) {
    mostRecentSavedJSON = json
    localStorage.setItem(LAST_SAVED_JSON_KEY, mostRecentSavedJSON)
  }

  
  /**
   * persist current filename to local storage
   *
   * @param      {String}  filename  The filename
   */
  function persistCurrentFilename(filename) {
    currentFilename.value = filename
    localStorage.setItem(CURRENT_FILENAME_KEY, filename)
  }

  
  /**
   * replace the current story with a new story
   *
   * @param      {Object}  [data=EMPTY_STORY]  The story data
   */
  function newStory(data = EMPTY_STORY) {
    currentStory.value = structuredClone(data)
    persistMostRecentJSON(JSON.stringify(currentStory.value))
    if (data === EMPTY_STORY) persistCurrentFilename("")
    currentHighestVideoId = getHighestVideoId(data)
    currentHighestSceneId = getHighestSceneId(data)
  }

  
  /**
   * pick a filename to load
   *
   * @return     {Promise}  { description_of_the_return_value }
   */
  async function pickStory() {
    const filename = await storage.pick()
    return filename
  }

  
  /**
   * load a previously saved story
   *
   * @param      {String}   filename  The filename
   * @return     {Promise}  { description_of_the_return_value }
   */
  async function loadStory(filename) {
    const story = await storage.load(filename)
    if (story) {
      currentStory.value = story
      persistMostRecentJSON(JSON.stringify(currentStory.value))
      persistCurrentFilename(filename)
      currentHighestVideoId = getHighestVideoId(story) ?? 0
      currentHighestSceneId = getHighestSceneId(story) ?? 0
      return true
    }
    return false
  }

  
  /**
   * Choose a save filename
   *
   * @return     {Promise<String>}  Filename
   */
  async function chooseStoryFilename() {
    return await storage.chooseSaveFilename(currentFilename.value)
  }

  
  /**
   * save the current story (optionally changing name)
   *
   * @param      {String|Boolean}   [newFilename=false]  The new filename
   * @return     {Promise<String>}  Filename the story was saved as
   */
  async function saveStory(newFilename = false) {
    const savedFilename = await storage.save(newFilename || currentFilename.value, toRaw(currentStory.value))
    if (savedFilename) {
      persistCurrentFilename(savedFilename)
      persistMostRecentJSON(JSON.stringify(currentStory.value))
      isSaved.value = true
    }
    return savedFilename
  }

  
  /**
   * compress the current story (for use in URL)
   *
   * @return     {String}  Compressed story
   */
  function compressedStoryForURL() {
    const str = JSON.stringify(toRaw(currentStory.value))
    return LZString.compressToEncodedURIComponent(str)
  }

  
  /**
   * uncompress compressed story data
   *
   * @param      {String}       data    The data
   * @return     {Object|null}  Story object or null if error
   */
  function uncompressStoryData(data) {
    try {
      const str = LZString.decompressFromEncodedURIComponent(data)
      return JSON.parse(str)
    } catch (error) {
      return null
    }
  }

  
  /**
   * Gets a sharing url for the current story
   *
   * @param      {Object}  router  The router
   * @return     {String}  The sharing url.
   */
  function getSharingURL(router) {
    const data = compressedStoryForURL()
    return router ? window.location.origin + window.location.pathname + router.resolve({ name: "play", params: { data } }).href : ''
  }

  
  /**
   * add a video to the current story
   *
   * @param      {Object}  data    The video data
   * @return     {Number}  ID of the added video
   */
  function addVideo(data) {
    const video = { ...data, id: nextVideoId() }
    currentStory.value.videos.push(video)
    return video.id
  }

  
  /**
   * delete a video from the current story
   *
   * @param      {Number}   id                            The video id
   * @param      {boolean}  [includeRelatedScenes=false]  Also include related scenes in deletion?
   */
  function deleteVideo(id, includeRelatedScenes = false) {
    if (includeRelatedScenes) getScenesByVideoId(id).forEach(scene => deleteScene(scene.id))
    currentStory.value.videos = currentStory.value.videos.filter(video => video.id !== id).map(video => toRaw(video))
    currentHighestVideoId = getHighestVideoId(currentStory.value) ?? 0
  }

  
  /**
   * update a video in the current story
   *
   * @param      {Number}  id      The video id
   * @param      {Object}  data    The new video data
   */
  function updateVideo(id, data) {
    currentStory.value.videos = currentStory.value.videos.map(video => (video.id === id ? { ...video, ...data } : video))
  }

  
  /**
   * add a scene to the current story
   *
   * @param      {Object}  data    The scene data
   * @return     {Number}  ID of the new scene
   */
  function addScene(data) {
    const scene = { ...data, id: nextSceneId() }
    currentStory.value.scenes.push(scene)
    return scene.id
  }

  
  /**
   * delete a scene from the current story
   *
   * @param      {Number}  id      The scene id
   */
  function deleteScene(id) {
    currentStory.value.scenes = currentStory.value.scenes.filter(scene => scene.id !== id).map(scene => toRaw(scene))
    currentHighestSceneId = getHighestSceneId(currentStory.value) ?? 0
  }

  
  /**
   * update a scene in the current story
   *
   * @param      {Number}  id      The scene id
   * @param      {Object}  data    The scene data
   */
  function updateScene(id, data) {
    currentStory.value.scenes = currentStory.value.scenes.map(scene => (scene.id === id) ? { ...scene, ...data } : scene)
  }

  
  /**
   * add an event to a scene in the current story
   *
   * @param      {Number}        sceneId  The scene id
   * @param      {Object}        data     The event data
   * @return     {Number|false}  ID of the added event or false if no scene data
   */
  function addEvent(sceneId, data) {
    const scene = getSceneById(sceneId)
    if (!scene) return false
    const event = { ...data, id: nextEventIdForScene(scene) }
    scene.events.push(event)
    return event.id
  }

  
  /**
   * delete an event from a scene in the current story
   *
   * @param      {Number}        sceneId  The scene id
   * @param      {Number}        eventId  The event id
   * @return     {boolean|void}  False if scene with id not found
   */
  function deleteEvent(sceneId, eventId) {
    const scene = getSceneById(sceneId)
    if (!scene) return false
    scene.events = scene.events.filter(({ id }) => id !== eventId)
  }

  
  /**
   * update an event in a scene in the current story
   *
   * @param      {Number}        sceneId  The scene id
   * @param      {Number}        eventId  The event id
   * @param      {Object}        data     The new event data
   * @return     {boolean|void}  False if scene with id not found
   */
  function updateEvent(sceneId, eventId, data) {
    const scene = getSceneById(sceneId)
    if (!scene) return false
    scene.events = scene.events.map(event => (event.id === eventId ? { ...event, ...data } : event))
  }

  
  /**
   * Gets the scenes by video id.
   *
   * @param      {Number}  videoId  The video identifier
   * @return     {Array<Object>}  The scenes by video identifier.
   */
  function getScenesByVideoId(videoId) {
    return currentStory.value.scenes.filter(scene => scene.videoId === videoId)
  }

  const getSceneById = (sceneId, storyData = currentStory.value) => storyData.scenes.find(({ id }) => id === sceneId)
  const getVideoById = (videoId, storyData = currentStory.value) => storyData.videos.find(({ id }) => id === videoId)

  const nextVideoId = () => ++currentHighestVideoId
  const getHighestVideoId = story => (story.videos.length ? Math.max(...story.videos.map(({ id }) => id)) : null)

  const nextSceneId = () => ++currentHighestSceneId
  const getHighestSceneId = story => (story.scenes.length ? Math.max(...story.scenes.map(({ id }) => id)) : null)

  const getHighestEventIdForScene = scene => (scene.events.length ? Math.max(...scene.events.map(({ id }) => id)) : 0)
  const nextEventIdForScene = scene => getHighestEventIdForScene(scene) + 1

  const isCurrentStoryPlayable = computed(() => isStoryPlayable(currentStory.value))

  const isStoryPlayable = storyData => {
    // Initial scene set?
    const sceneId = storyData.initialSceneId
    if ([undefined, -1].includes(sceneId)) return false
    // Initial scene exists
    const scene = getSceneById(sceneId, storyData)
    if (!scene) return false
    // Initial scene has video
    const video = getVideoById(scene.videoId, storyData)
    if (!video) return false
    // Video has sourceType and url
    if (!video.sourceType || !video.url) return false
    // probably playable (although we're not checking for valid URL)
    return true
  }

  setup()

  return {
    currentStory,
    isSaved,
    currentFilename,

    newStory,
    pickStory,
    loadStory,
    saveStory,
    chooseStoryFilename,
    get compressedStoryForURL() {
      return compressedStoryForURL()
    },
    uncompressStoryData,
    getSharingURL,

    addVideo,
    deleteVideo,
    updateVideo,

    addScene,
    deleteScene,
    updateScene,

    addEvent,
    deleteEvent,
    updateEvent,

    getSceneById,
    getScenesByVideoId,

    isStoryPlayable,
    isCurrentStoryPlayable,
  }
})
