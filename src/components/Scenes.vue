<!-- Scenes Component - for editing scene objects -->
<template>
  <article>
    <details ref="header" class="scenes_header">
      <summary role="button">Scenes ({{ story.scenes.length }})<button title="Add scene" @click="addScene" class="add_button">+</button></summary>
      <div style="--span: 4" class="s-grid scenes-container" v-for="(scene, idx) in story.scenes" :key="scene.id">
        <div :id="`scene_${scene.id}`">
          <label style="--span: 5"
            ><strong>{{ scene.id }}</strong> - Title<input
              style="font-weight: bold"
              class="scene_title"
              placeholder="(No title)"
              type="text"
              v-model="scene.title"
          /></label>
          <label style="--span: 3"
            >Next scene
            <select v-model="scene.nextSceneId">
              <option :value="-1">(n/a)</option>
              <option v-for="scene in story.scenes" :key="scene.id" :value="scene.id">{{ scene.id }} - {{ scene.title || "(No title)" }}</option>
            </select>
          </label>
        </div>
        <div>
          <label style="--span: 1">Start time (s)<input placeholder="n/a" type="number" min="-1" v-model="scene.startTime" /></label>
          <label style="--span: 1">End time (-1: end)<input class="show_end_time" :data-val="scene.endTime" placeholder="n/a" type="number" min="-1" v-model="scene.endTime" /></label>
          <label style="--span: 3"
            >Video
            <select v-model="scene.videoId">
              <template v-if="story.videos.length">
                <option :value="-1">(n/a)</option>
                <option v-for="video in story.videos" idx="video.id" :value="video.id">{{ video.id }} - {{ video.title || "(Untitled video)" }}</option>
              </template>
              <option v-else :value="-1">No videos available. Please add one</option>
            </select>
          </label>
        </div>
        <div class="events_container">
          <table :style="{ marginBottom: scene.events.length ? '0.5em' : '0' }">
            <caption style="text-align: left">
              <span>Events</span>
              <button class="btn_addevent" @click="addEventToScene(scene)">Add new</button>
            </caption>
            <thead v-if="scene.events.length">
              <tr>
                <th>Type</th>
                <th>Description/Info</th>
                <th style="text-align: center">Launch time (s)</th>
                <th style="text-align: center"></th>
              </tr>
            </thead>
            <tbody v-if="scene.events.length">
              <tr v-for="event in sortedEvents(scene.events)" :key="event.id">
                <td>{{ eventTypeLabel(event) }}</td>
                <td v-html="event.type === EVENT_TYPES.choice ? event.data.text : (event.data.replaceAll(/\n/g, '<br/>') )"></td>
                <td style="text-align: center">{{ event.launchTime==-1 ? 'END' : event.launchTime }}</td>
                <td style="display:flex; justify-content: center; gap: 0.65rem;">
                  <icon type="edit" class="icon" title="Edit" @click="editEventForScene(scene, event)" /><icon type="trash-2" class="icon" title="Delete" @click="deleteEventFromScene(scene, event)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="justify-items: end">
          <button @click="deleteScene(scene.id)" style="width: fit-content">Delete</button>
        </div>
        <hr v-if="idx < story.scenes.length - 1" />
      </div>
    </details>
  </article>

  <event-editor ref="eventEditor" />
</template>

<script>
import { EVENT_TYPES, EVENT_TYPE_NAMES, CHOICE_TYPES } from "@/components/EventEditor.vue"
const NEW_SCENE_DEFAULTS = {
  videoId: -1,
  title: "",
  startTime: 0,
  endTime: -1,
  nextSceneId: -1,
  events: [],
}
</script>

<script setup>
import { computed, nextTick, useTemplateRef, toRaw } from "vue"
import Icon from "vue-feather"

import EventEditor from "@/components/EventEditor.vue"

const header = useTemplateRef("header")
const eventEditor = useTemplateRef("eventEditor")

const props = defineProps({
  store: {
    type: Object,
    default() {
      return {}
    },
  },
})

const story = computed(() => props.store.currentStory)
const deleteScene = props.store.deleteScene

/**
 * Sort an array of event objects (by launch time)
 *
 * @param      {Array<object>}  events  The events
 * @return     {Array<object>}  Sorted array of events
 */
const sortedEvents = events =>
  events.sort(({ launchTime: a }, { launchTime: b }) => {
    // -1 is end of video
    if (a == -1) a = Infinity
    if (b == -1) b = Infinity
    return a - b
  })

/**
 * Adds a scene. Also makes sure first field on new scene is focused when it appears
 */
const addScene = () => {
  const id = props.store.addScene(structuredClone(NEW_SCENE_DEFAULTS))
  header.value.open = true
  nextTick(() => document.querySelector(`#scene_${id} .scene_title`).focus())
}

/**
 * Adds an event to scene with popup editor.
 *
 * @param      {object}  scene   The scene
 */
const addEventToScene = async scene => {
  const newEvent = await eventEditor.value.createNew()
  if (newEvent) props.store.addEvent(scene.id, newEvent)
}

/**
 * Edit an existing event in scene with popup editor.
 *
 * @param      {object}  scene   The scene
 * @param      {object}  event   The event to edit
 */
const editEventForScene = async (scene, event) => {
  const toEdit = toRaw(event)
  const editedEvent = await eventEditor.value.edit(toEdit)
  if (editedEvent) props.store.updateEvent(scene.id, event.id, editedEvent)
}

/**
 * Delete an event from a scene.
 *
 * @param      {object}  scene   The scene
 * @param      {object}  event   The event
 */
const deleteEventFromScene = (scene, event) => {
  props.store.deleteEvent(scene.id, event.id)
}

/**
 * Make a label for the type of the passed event.
 *
 * @param      {object}  event   The event
 * @return     {string}  { description_of_the_return_value }
 */
const eventTypeLabel = event => {
  let label = EVENT_TYPE_NAMES[event.type]
  // add the time limit if it is a timed choice
  if (event?.data?.type == CHOICE_TYPES.timed) {
    label += ` (${event.data.options.timeLimit}s)`
  }
  return label
}

</script>

<style scoped>
.scenes-container {
  font-size: 90%;
  &:has(*:focus) {
    margin: -0.75em;
    background-color: #f3f3f3;
    border: 1px solid #888;
    border-radius: 0.5em;
    & .events_container {
      background-color: #e3e3e3;
    }
    box-shadow: 0 0 0.5em #0004;
  }
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

.btn_addevent {
  display: inline-block;
  font-size: 80%;
  width: fit-content;
  height: auto;
  padding: 0.5em 0.75em;
  opacity: 0.8;
  margin-left: 0.75em;
}

.events_container {
  border-radius: 0.5em;
  background-color: #eee;
  margin: 1em 0;
  padding: 0.5em 0.5em 0.5em 0.5em;
}

.icon {
  cursor: pointer;
  :deep(& svg) {
    stroke: #555;
  }
  :deep(& svg):hover {
    stroke: var(--s-color-primary);
  }
}
</style>
