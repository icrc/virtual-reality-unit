<!-- Event Editor Component - for editing event details -->
<template>
  <popup-dialog ref="dialog" v-slot="popupControl" :heading="title" class="event-editor-s-container">
    <div>
      <label style="--span: 2">
        Type
        <select autofocus v-model="eventType" @change="popupControl.fixScroll">
          <option v-for="ctype in EVENT_TYPES" :value="ctype">{{ EVENT_TYPE_NAMES[ctype] }}</option>
        </select>
      </label>
      <label style="--span: 2"
        >Launch time (s) - Use -1 for end <input class="show_end_time" :data-val="launchTime" placeholder="n/a" type="number" min="-1" v-model="launchTime"
      /></label>
      <label style="--span: 2" v-if="eventType == EVENT_TYPES.choice">
        <span>Choice layout<icon style="float: right" type="settings" class="icon" title="Layout settings" @click="editLayoutSettings"/></span>
        <select v-model="layout" @change="popupControl.fixScroll">
          <option value="">Project default ({{ LAYOUTS[store.currentStory.defaultChoiceLayout]?.name }})</option>
          <option v-for="layout in LAYOUT_NAMES" :key="layout.id" :value="layout.id">
            {{ layout.name }}
          </option>
        </select>
      </label>
    </div>
    <div><hr /></div>
    <template v-if="eventType == EVENT_TYPES.choice">
      <div>
        <label style="--span: 4.5">Main text<input placeholder="n/a" type="text" v-model="mainChoiceText" /></label>
        <span style="--span: 1.5" class="timed_switch">
          <label>
            <input type="checkbox" role="switch" v-model="isTimedChoice" />
            Timed choice?
          </label>
        </span>
      </div>
      <div v-if="isTimedChoice">
        <label style="--span: 2">Time limit (s)<input placeholder="1" type="number" min="1" v-model="timeLimit" /></label>
        <label style="--span: 4">
          Timeout action
          <action-code-input style="padding-top: 0.25rem; height: 2.9rem" v-model="timeoutActionCode" />
        </label>
      </div>
      <div v-else>
        <label style="--span: 3">
          Background
          <select v-model="backgroundType" @change="popupControl.fixScroll">
            <option :value="bgType" v-for="(bgTypeName, bgType) in BACKGROUND_TYPE_NAMES">{{ bgTypeName }}</option>
          </select>
        </label>
        <label style="--span: 3" v-if="backgroundType === 'block'"> </label>
        <label style="--span: 3" v-if="backgroundType === 'blockFrame'">
          Frame time (s)
          <input placeholder="0" type="number" min="0" v-model="blockFrameTime" />
        </label>
        <span style="--span: 3" v-if="backgroundType === 'blockLoop'">
          Range (s) - Use -1 for end of scene
          <span style="display: flex; gap: 0.5rem; padding-top: 0.25rem">
            <input style="width: 7rem" type="number" min="0" v-model="loopStartTime" /><span style="padding-top: 0.75rem">to</span>
            <span><input style="width: 7rem" class="show_end_time" :data-val="loopEndTime" type="number" min="-1" v-model="loopEndTime" /></span>
          </span>
        </span>
      </div>
      <div><hr /></div>

      <div class="choices_container">
        <table style="margin-bottom: 0.5em">
          <caption style="text-align: left">
            <span>Choices</span>
          </caption>
          <thead>
            <tr>
              <th>Text</th>
              <th>Action</th>
              <th style="text-align: center">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(choice, index) in buttons" :key="index">
              <td><input placeholder="n/a" type="text" v-model="choice.text" /></td>
              <td><action-code-input style="height: 2.6rem" v-model="choice.action" /></td>
              <td style="position: relative">
                <span class="choice_options">
                  <icon :class="{ disabled_icon: index == 0, icon: true }" type="arrow-up" title="Move up" @click="moveChoiceUp(index)" />
                  <icon :class="{ disabled_icon: index == 3, icon: true }" type="arrow-down" title="Move down" @click="moveChoiceDown(index)" />
                  <icon type="trash-2" class="icon" title="Delete" @click="clearChoice(index)" />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="eventType == EVENT_TYPES.action">
      <div>
        <span><action-code-input class="action_event_editor" resize="vertical" v-model="eventActionCode" /></span>
      </div>
    </template>

    <div><hr /></div>

    <div>
      <span class="edit_event_actions">
        <button class="s-outline" @click="popupControl.setVisible(false)">Cancel</button>
        <button @click="() => popupControl.returnResult(makeEventObject())">Accept</button>
      </span>
    </div>

  </popup-dialog>
</template>

<script>
import { LAYOUTS, LAYOUT_NAMES } from "@/layouts"

export const EVENT_TYPES = {
  action: "action",
  choice: "choice",
}
export const EVENT_TYPE_NAMES = {
  [EVENT_TYPES.action]: "Action",
  [EVENT_TYPES.choice]: "Choice",
}
export const CHOICE_TYPES = {
  block: "block",
  timed: "timed",
}
export const BACKGROUND_TYPES = {
  blockPause: "blockPause",
  blockFrame: "blockFrame",
  blockLoop: "blockLoop",
}
export const BACKGROUND_TYPE_NAMES = {
  [BACKGROUND_TYPES.blockPause]: "Current frame",
  [BACKGROUND_TYPES.blockFrame]: "Specific frame",
  [BACKGROUND_TYPES.blockLoop]: "Video loop",
}
const BLANK_NEW_EVENT = {
  type: EVENT_TYPES.choice,
  launchTime: 0,
  data: {
    text: "",
    type: "block",
    options: {},
    layout: "",
    layoutSettings: {},
    buttons: [
      {
        text: "Option 1",
        action: "",
      },
    ],
  },
}
</script>

<script setup>
import { ref, useTemplateRef, toRaw, inject } from "vue"
import Icon from "vue-feather"

import { useStoryStore } from "@/stores/storyStore"

import PopupDialog from "@/components/PopupDialog.vue"
import ActionCodeInput from "@/components/ActionCodeInput.vue"

const store = useStoryStore()

const dialog = useTemplateRef("dialog")

const isTimedChoice = ref(false)
const backgroundType = ref(BACKGROUND_TYPES.blockPause)
const eventType = ref(EVENT_TYPES.choice)
const layout = ref("")
const layoutSettings = ref({})
const launchTime = ref(-1)
const eventActionCode = ref("")
const mainChoiceText = ref("")
const timeLimit = ref(1)
const timeoutActionCode = ref("")
const loopStartTime = ref(0)
const loopEndTime = ref(-1)
const blockFrameTime = ref(0)
const buttons = ref(Array.from({ length: 4 }, () => ({ text: "", action: "" })))

const title = ref("")


const layoutSettingsEditor = inject("layoutSettingsEditor")

/**
 * Edit the default layout settings
 *
 * @param      {Function}  launchEditFunc  The function to launch the editor
 */
const editLayoutSettings = async (launchEditFunc) => {
  const newSettings = await layoutSettingsEditor.value.edit(layoutSettings.value)
  // ** TODO ** if (newSettings) layoutSettings.value = newSettings
}


/**
 * 'Empty' the content of a choice button (text and action)
 *
 * @param      {number}  index   The index in the button array
 */
const clearChoice = index => {
  buttons.value[index] = { text: "", action: "" }
}

/**
 * Move the choice button with the given index down one spot (exchange with the one below)
 *
 * @param      {number}  index   The index in the button array
 */
const moveChoiceDown = index => {
  const arr = buttons.value
  ;[arr[index + 1], arr[index]] = [arr[index], arr[index + 1]]
}

/**
 * Move the choice button with the given index up one spot (exchange with the one above)
 *
 * @param      {number}  index   The index
 */
const moveChoiceUp = index => {
  const arr = buttons.value
  ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
}


/**
 * Set up and display the editor
 *
 * @param      {object}                  event        The event we are editing
 * @param      {string}                  windowTitle  The window title
 * @return     {Promise<(null|object)>}  Promise resolving to the edited object or null if we exited
 */
const useEditor = (event, windowTitle) => {
  setupUI(event)
  title.value = windowTitle
  const promise = dialog.value.launchPopup()
  return promise
}

/**
 * Makes an event object from our internal values.
 *
 * @return     {object}  Event object built from the form values
 */
const makeEventObject = () => {
  if (eventType.value === EVENT_TYPES.choice) {
    return makeChoiceEventObject()
  } else if (eventType.value === EVENT_TYPES.action) {
    return makeActionEventObject()
  }
}

/**
 * Makes an action event object.
 *
 * @return     {Object}  The 'action' event object
 */
const makeActionEventObject = () => {
  return {
    type: EVENT_TYPES.action,
    launchTime: launchTime.value,
    data: eventActionCode.value,
  }
}

/**
 * Makes a choice event object.
 *
 * @return     {Object}  The 'choice' event object
 */
const makeChoiceEventObject = () => {
  let opts
  if (isTimedChoice.value) {
    opts = { timeLimit: timeLimit.value, defaultAction: timeoutActionCode.value }
  } else {
    opts = {
      [BACKGROUND_TYPES.blockPause]: {},
      [BACKGROUND_TYPES.blockFrame]: { frame: blockFrameTime.value },
      [BACKGROUND_TYPES.blockLoop]: { loop: [loopStartTime.value, loopEndTime.value] },
    }[backgroundType.value]
  }
  return {
    type: EVENT_TYPES.choice,
    launchTime: launchTime.value,
    data: {
      text: mainChoiceText.value,
      type: isTimedChoice.value ? CHOICE_TYPES.timed : CHOICE_TYPES.block,
      options: opts,
      layout: layout.value,
      layoutSettings: layoutSettings.value, 
      buttons: sanitisedButtons(),
    },
  }
}

/**
 * Sanitise the button array for addition to the final object (remove blanks, trim strings)
 *
 * @return     {Array<{text:string, action:string}  >}  Sanitised array of button objects
 */
const sanitisedButtons = () => {
  const btns = buttons.value.map(({ text, action }) => ({ text: text.trim(), action: action.trim() }))
  return btns.filter(btn => btn.text || btn.action)
}

/**
 * Use editor to creates a new event.
 *
 * @return     {promise}  Promise resolving to the new object (or null if cancelled)
 */
const createNew = async () => {
  const event = structuredClone(BLANK_NEW_EVENT)
  return await useEditor(event, "Add Event")
}

/**
 * Use editor to edit an existing event.
 *
 * @param      {object}   event   The event object to edit
 * @return     {promise}  Promise resolving to the edited object (or null if cancelled)
 */
const edit = async event => {
  const eventToEdit = toRaw(event)
  const edited = await useEditor(eventToEdit, "Edit Event")
  return edited
}

/**
 * Set up the UI for the passed event object
 *
 * @param      {object}  event   The event
 */
const setupUI = event => {
  // general set up for all event types
  eventType.value = event.type
  launchTime.value = event.launchTime
  // specifics
  if (event.type === EVENT_TYPES.choice) setupUIForChoice(event)
  if (event.type === EVENT_TYPES.action) setupUIForAction(event)
}

/**
 * Set up the UI for a 'Choice' event
 *
 * @param      {object}  event   The event
 */
const setupUIForChoice = event => {
  backgroundType.value = BACKGROUND_TYPES.blockPause
  isTimedChoice.value = event.data.type == CHOICE_TYPES.timed
  mainChoiceText.value = event.data.text
  layout.value = event.data.layout
  layoutSettings.value = event.data.layoutSettings
  loopStartTime.value = 0
  loopEndTime.value = -1
  blockFrameTime.value = 0
  eventActionCode.value = ""
  if (!isTimedChoice.value) {
    if (event.data.options.hasOwnProperty("frame")) {
      backgroundType.value = BACKGROUND_TYPES.blockFrame
      blockFrameTime.value = event.data.options.frame
    } else if (event.data.options.hasOwnProperty("loop")) {
      backgroundType.value = BACKGROUND_TYPES.blockLoop
      ;[loopStartTime.value, loopEndTime.value] = event.data.options.loop
    }
    timeLimit.value = 1
    timeoutActionCode.value = ""
  } else {
    timeLimit.value = event.data.options.timeLimit
    timeoutActionCode.value = event.data.options.defaultAction
  }
  let btnArr = (Array.isArray(event.data.buttons) ? event.data.buttons : []).map(btn => (btn.text || btn.action ? btn : undefined)).filter(x => x)
  if (btnArr.length < 4) btnArr = [...btnArr, ...Array.from({ length: 4 - btnArr.length }, () => ({ text: "", action: "" }))]
  buttons.value = btnArr
}

/**
 * Set up the UI for an 'Action' event
 *
 * @param      {object}  event   The event
 */
const setupUIForAction = event => {
  eventActionCode.value = event.data
}

defineExpose({
  createNew,
  edit,
})
</script>

<style scoped>

.event-editor-s-container {
  width: 80%;
  max-width: 750px;
  min-width: 350px;
}

.choices_container {
  border-radius: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  & td {
    padding: 0.5rem;
  }
}

.icon {
  cursor: pointer;
}

.choice_options {
  display: flex;
  align-items: center;
  position: absolute;
  inset: 0 0 0 0;
  justify-content: center;
  :deep(& i) {
    cursor: pointer;
  }
}

.edit_event_actions {
  flex-direction: row;
  display: flex;
  gap: 0.25rem;
  justify-content: end;
  & button {
    width: fit-content;
  }
}

.action_event_editor {
  :deep(& textarea) {
    height: 8rem;
  }
}

.timed_switch {
  --span: 2;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 0.75rem;
}

.disabled_icon {
  :deep(& svg) {
    stroke: #ccc !important;
  }
}
:deep(.disabled_icon) {
  cursor: default !important;
  pointer-events: none;
}
</style>
