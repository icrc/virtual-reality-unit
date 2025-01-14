<!-- Event Editor Component - for editing event details -->
<template>
  <dialog ref="dialog" class="s-container modified-s-container dialog" @click="handleModalClick">
    <div>
      <div>
        <main>
          <article>
            <header>
              <h3>{{ title }}<icon type="x" class="icon btn_close" title="Close (lose changes)" @click="show(false)" /></h3>
            </header>
            <form class="s-grid">
              <div>
                <label style="--span: 3">
                  Type
                  <select autofocus v-model="eventType" @change="fixScroll">
                    <option v-for="ctype in EVENT_TYPES" :value="ctype">{{ EVENT_TYPE_NAMES[ctype] }}</option>
                  </select>
                </label>
                <label style="--span: 3">Launch time (s) - Use -1 for end<input class="show_end_time" :data-val="launchTime" placeholder="n/a" type="number" min="-1" v-model="launchTime" /></label>
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
                    <action-code-editor style="padding-top: 0.25rem; height: 2.9rem" v-model="timeoutActionCode" />
                  </label>
                </div>
                <div v-else>
                  <label style="--span: 3">
                    Background
                    <select v-model="backgroundType">
                      <option :value="bType" v-for="(bTypeName, bType) in BACKGROUND_TYPE_NAMES">{{ bTypeName }}</option>
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
                      <input style="width: 7rem;" type="number" min="0" v-model="loopStartTime" /><span style="padding-top: 0.75rem">to</span>
                      <span><input style="width: 7rem;" class="show_end_time" :data-val="loopEndTime" type="number" min="-1" v-model="loopEndTime" /></span>
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
                        <td><action-code-editor style="height: 2.6rem" v-model="choice.action" /></td>
                        <td style="position: relative">
                          <span class="choice_options">
                            <icon type="arrow-up" class="icon" title="Move up" />
                            <icon type="arrow-down" class="icon" title="Move down" />
                            <icon type="trash-2" class="icon" title="Delete" />
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>

              <template v-if="eventType == EVENT_TYPES.action">
                <div>
                  <span><action-code-editor class="action_event_editor" resize="vertical" v-model="eventActionCode" /></span>
                </div>
              </template>

              <div><hr /></div>

              <div>
                <span class="edit_event_actions">
                  <button class="s-outline" @click="show(false)">Cancel</button>
                  <button @click="returnEvent">Accept</button>
                </span>
              </div>
            </form>
          </article>
        </main>
      </div>
    </div>
  </dialog>
</template>

<script>
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
import { ref, useTemplateRef, nextTick, toRaw, onMounted } from "vue"
import Icon from "vue-feather"

import ActionCodeEditor from "@/components/ActionCodeEditor.vue"

const dialog = useTemplateRef("dialog")

const props = defineProps({
  // store: {
  //   type: Object,
  //   default() {
  //     return {}
  //   },
  // },
})

const isTimedChoice = ref(false)
const backgroundType = ref(BACKGROUND_TYPES.blockPause)
const eventType = ref(EVENT_TYPES.choice)
const launchTime = ref(-1)
const eventActionCode = ref("")
const mainChoiceText = ref("")
const timeLimit = ref(1)
const timeoutActionCode = ref("")
const loopStartTime = ref(0)
const loopEndTime = ref(-1)
const blockFrameTime = ref(0)
const buttons = ref([])

const title = ref("")

let activePromiseControl = null

const show = (state = true) => {
  if (state) {
    dialog.value.showModal()
    setScrollAvailable(false)
  } else {
    dialog.value.close()
  }
}

const fixScroll = () => {
  nextTick(() => setScrollAvailable(false))
}

const setScrollAvailable = (state = true) => {
  document.body.style.overflow = state ? "auto" : "hidden"
}

const handleModalClick = event => {
  if (event.target === dialog.value) show(false)
}

const exit = () => {
  setScrollAvailable(true)
  activePromiseControl?.resolve(null)
}

const returnEvent = () => {
  show(false)
  activePromiseControl.resolve(makeEventObject())
}

const useEditor = (event, windowTitle) => {
  setupUI(event)
  title.value = windowTitle
  const promise = new Promise((resolve, reject) => {
    activePromiseControl = {
      resolve,
      reject,
    }
  })
  show()
  return promise
}

const makeEventObject = () => {
  return {
    event: "Yes!",
  }
}

const createNew = async () => {
  const event = structuredClone(BLANK_NEW_EVENT)
  return await useEditor(event, "Add Event")
}

const edit = async event => {
  const eventToEdit = structuredClone(toRaw(event))
  console.log("Editing event: ", eventToEdit)
  return await useEditor(eventToEdit, "Edit Event")
}

const setupUI = event => {
  eventType.value = event.type
  launchTime.value = event.launchTime
  if (event.type === EVENT_TYPES.choice) setupUIForChoice(event)
  if (event.type === EVENT_TYPES.action) setupUIForAction(event)
}

const setupUIForChoice = event => {
  backgroundType.value = BACKGROUND_TYPES.blockPause
  isTimedChoice.value = event.data.type == CHOICE_TYPES.timed
  mainChoiceText.value = event.data.text
  loopStartTime.value = 0
  loopEndTime.value = -1
  blockFrameTime.value = 0
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
  let btnArr = (Array.isArray(event.data.buttons) ? event.data.buttons : []).map(btn => (btn.text || btn.action) ? btn : undefined).filter(x=>x)
  if (btnArr.length < 4) btnArr = [...btnArr, ...(Array.from({length: 4-btnArr.length}, () => ({ text: "", action: "" }) ))]
  buttons.value = btnArr
}

const setupUIForAction = event => {
  eventActionCode.value = event.data
}

onMounted(() => {
  dialog.value.addEventListener("close", exit)
})

defineExpose({
  createNew,
  edit,
})
</script>

<style scoped>
.dialog {
  font-size: 80% !important;
}

.modified-s-container {
  margin-inline: auto;
  width: 80%;
  max-width: 750px;
  min-width: 350px;
}

.btn_close {
  float: right;
}

.action_edit {
  :deep(& svg) {
    stroke: #fff !important;
  }
  :deep(& svg):hover {
    stroke: #fff !important;
  }
}

.choices_container {
  border-radius: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  & td {
    padding: 0.5rem;
  }
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

/*:has(> input.show_end_time[data-val="-1"]) {
  position: relative;
}
:has(> input.show_end_time[data-val="-1"])::before {
  content: 'END';
  position: absolute;
  left: 0;
  height: 0.5rem;
  line-height: 0.5em;
  right: 0;
  text-align: center;
  font-size: 0.75rem;
  bottom: 0;
  margin-bottom: -0.75rem;
  color: blue;
}*/
</style>
