<!-- Event Editor Component - for editing event details -->
<template>
  <dialog ref="dialog" class="s-container modified-s-container dialog" @click="handleModalClick">
    <div>
      <div>
        <main>
          <article>
            <header>
              <h3>Event<icon type="x" size="36" class="icon btn_close" title="Close (lose changes)" @click="show(false)" /></h3>
            </header>
            <form class="s-grid">
              <div>
                <label style="--span: 3">
                  Type
                  <select v-model="eventType" @change="fixScroll">
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
                    <span class="action_edit" style="padding-top: 0.25rem">
                      <input placeholder="None" type="text" />
                      <button>
                        <icon type="edit" size="36" class="icon btn_close" title="Close (lose changes)" @click="show(false)" />
                      </button>
                    </span>
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
                        <td><input placeholder="Sample action" type="text" /><button>s</button></td>
                        <td style="position: relative">
                          <span class="choice_options">
                          <icon type="arrow-up" size="36" class="icon" title="Move up" />
                          <icon type="arrow-down" size="36" class="icon" title="Move down" />
                          <icon type="trash-2" size="36" class="icon" title="Delete" />
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
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
</script>

<script setup>
import { ref, useTemplateRef, nextTick } from "vue"
import Icon from "vue-feather"

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

const show = (state = true) => {
  if (state) {
    dialog.value.showModal()
    setScrollAvailable(false)
  } else {
    dialog.value.close()
    setScrollAvailable(true)
  }
}

const fixScroll = () => {
  nextTick(() => setScrollAvailable(false))
}

const setScrollAvailable = (state=true) => {
  document.body.style.overflow = state? "auto" : "hidden";
}

const handleModalClick = event => {
  if (event.target === dialog.value) {
    show(false)
  }
}

defineExpose({
  show,
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
    padding:0.5rem;
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

</style>
