<template>
  <dialog ref="dialog" class="s-container dialog modified-s-container" @click="handleModalClick">
    <div>
      <div>
        <main>
          <article>
            <header v-if="heading">
              <h3>{{ heading }}<icon type="x" class="icon btn_close" title="Close" @click="show(false)" /></h3>
            </header>
            <div class="s-grid">
              <slot v-bind="api"></slot>
            </div>
          </article>
        </main>
      </div>
    </div>
  </dialog>
</template>

<script></script>

<script setup>
import { useTemplateRef, nextTick, onMounted } from "vue"
import Icon from "vue-feather"

const props = defineProps({
  heading: String,
})

const dialog = useTemplateRef("dialog")
let activePromiseControl = null

/**
 * Show/hide the popup
 *
 * @param      {boolean}  [state=true]  The 'visible' state
 */
const show = (state = true) => {
  if (state) {
    dialog.value.showModal()
    setScrollAvailable(false)
  } else {
    setScrollAvailable()

    dialog.value.close("fromShow")
  }
}

/**
 * Fix the scrolling issue that happens on some browsers
 */
const fixScroll = () => {
  nextTick(() => setScrollAvailable(false))
}

/**
 * Makes scrolling available (or not) on the document
 *
 * @param      {boolean}  [state=true]  The state
 */
const setScrollAvailable = (state = true) => {
  document.body.style.overflow = state ? "auto" : "hidden"
}

/**
 * Handle clicking outside (off of) the modal dialog (for closing)
 *
 * @param      {Event}  event   The event
 */
const handleModalClick = event => {
  // the selection stuff is to mitigate a bug in chrome where click erroneously fires when mouseup occurs on a text selection
  if (event.target === dialog.value && document.getSelection().type !== "Range") show(false)
}

/**
 * Exit the popup without anything changed (cancel/exit)
 */
const exit = () => {
  setScrollAvailable(true)
  activePromiseControl?.resolve(null)
  activePromiseControl = null
}

/**
 * Close popup and return the edited event object
 */
const returnResult = result => {
  show(false)
  setScrollAvailable(true)
  const prm = activePromiseControl
  setTimeout(() => prm?.resolve(result), 10)
  activePromiseControl = null
}

/**
 * Display the popup and return a promise that resolves when popup is done
 *
 * @param      {Function}             [initAction=undefined]  The initialize action (if reqd)
 * @return     {Promise<(null|any)>}  Promise resolving to the result or null if we exited
 */
const launchPopup = (initAction = undefined) => {
  const promise = new Promise((resolve, reject) => {
    activePromiseControl = {
      resolve,
      reject,
    }
  })
  show()
  if (initAction) nextTick(initAction)
  return promise
}

const api = {
  setVisible: show,
  fixScroll,
  exit,
  returnResult,
}

onMounted(() => {
  dialog.value.addEventListener("close", e => {
    if (dialog.value.returnValue !== "fromShow") {
      exit()
    } else {
      activePromiseControl?.resolve(null)
      activePromiseControl = null
    }
  })
})

defineExpose({
  launchPopup,
})
</script>

<style scoped>
.modified-s-container {
  margin-inline: auto;
}

.dialog {
  font-size: 80% !important;
}

.btn_close {
  float: right;
}
</style>
