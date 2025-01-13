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
                    <option :value="EVENT_TYPES.choice">{{ EVENT_TYPE_NAMES[EVENT_TYPES.choice] }}</option>
                    <option :value="EVENT_TYPES.action">{{ EVENT_TYPE_NAMES[EVENT_TYPES.action] }}</option>
                  </select>
                </label>
                <label style="--span: 3">Launch time (s)<input placeholder="n/a" type="number" min="-1" /></label>
              </div>
              <div><hr /></div>
              <template v-if="eventType == EVENT_TYPES.choice">
                <div>
                  <span style="--span: 8">
                    <label>
                      <input type="checkbox" role="switch" v-model="isTimedChoice" />
                      Timed choice?
                    </label>
                  </span>
                </div>
                <div v-if="isTimedChoice">
                  <label style="--span: 2">Time limit (s)<input placeholder="1" type="number" min="1" /></label>
                  <label style="--span: 4">
                    Timeout action
                    <action-code-editor style="padding-top: 0.25rem" />
                  </label>
                </div>
                <div v-else>
                  <label style="--span: 3">
                    Background
                    <select v-model="backgroundType">
                      <option value="block">Current frame</option>
                      <option value="blockFrame">Specific frame</option>
                      <option value="blockLoop">Video loop</option>
                    </select>
                  </label>
                  <label style="--span: 3" v-if="backgroundType === 'block'"> </label>
                  <label style="--span: 3" v-if="backgroundType === 'blockFrame'">
                    Frame time
                    <input placeholder="0" type="number" min="0" />
                  </label>
                  <span style="--span: 3" v-if="backgroundType === 'blockLoop'">
                    Range
                    <span style="display: flex; gap: 0.5rem; padding-top: 0.25rem">
                      <input placeholder="Start" type="number" min="0" /><span style="padding-top: 0.75rem">to</span>
                      <input placeholder="End" type="number" min="0" />
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
                      <tr v-for="choice in [1, 2, 3, 4]" :key="choice">
                        <td><input placeholder="Sample text" type="text" /></td>
                        <td><action-code-editor /></td>
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
                  <span><action-code-editor /></span>
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
const BLANK_NEW_EVENT = {}
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
const backgroundType = ref("block")
const eventType = ref(EVENT_TYPES.choice)

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

const editEvent = (event, windowTitle) => {
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
  return await editEvent(event, "Add Event")
}

const edit = async event => {
  const eventToEdit = structuredClone(toRaw(event))
  console.log("Editing event: ", eventToEdit)
  return await editEvent(eventToEdit, "Edit Event")
}

const setupUI = event => {}

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
</style>
