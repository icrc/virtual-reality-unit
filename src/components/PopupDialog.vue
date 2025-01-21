<template>
  <dialog ref="dialog" class="s-container dialog modified-s-container" @click="handleModalClick">
    <div>
      <div>
        <main>
          <article>
            <header v-if="header">
              <h3>{{ header }}<icon type="x" class="icon btn_close" title="Close" @click="show(false)" /></h3>
            </header>
            <form class="s-grid">
              <slot :setVisible="show" :fixScroll="fixScroll" :exit="exit" :returnResult="returnResult"></slot>
            </form>
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
  header: String,
})

const dialog = useTemplateRef("dialog")
let activePromiseControl = null

/**
 * Show/hide the editor
 *
 * @param      {boolean}  [state=true]  The 'visible' state
 */
const show = (state = true) => {
  if (state) {
    dialog.value.showModal()
    setScrollAvailable(false)
  } else {
    dialog.value.close()
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
  if (event.target === dialog.value) show(false)
}

/**
 * Exit the popup without anything changed (cancel/exit)
 */
const exit = () => {
  setScrollAvailable(true)
  activePromiseControl?.resolve(null)
}

/**
 * Close popup and return the edited event object
 */
const returnResult = result => {
  show(false)
  activePromiseControl.resolve(result)
}

/**
 * Display the popup and return a promise that resolves when popup is done
 *
 * @return     {Promise<(null|any)>}  Promise resolving to the result or null if we exited
 */
const launchPopup = () => {
  const promise = new Promise((resolve, reject) => {
    activePromiseControl = {
      resolve,
      reject,
    }
  })
  show()
  return promise
}

onMounted(() => {
  dialog.value.addEventListener("close", exit)
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
