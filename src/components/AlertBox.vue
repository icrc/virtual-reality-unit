<!-- Alert Box Popup - cuddly replacements for window.[alert, confirm, prompt] -->
<template>
  <popup-dialog ref="dialog" v-slot="popupControl" class="alertbox-container">
    <div>
      <div style="--span: 6; font-size: 1rem !important" v-html="msg"></div>
      <label style="--span: 6" v-if="showUserText">
        <input type="text" v-model="userText" ref="textbox" />
      </label>
    </div>
    <div>
      <span class="btn_actions">
        <button v-if="showCancel" class="s-outline" @click="cancelIsNull ? popupControl.setVisible(false) : popupControl.returnResult(false)">Cancel</button>
        <button @click="() => popupControl.returnResult(showUserText ? userText : true)">OK</button>
      </span>
    </div>
  </popup-dialog>
</template>

<script></script>

<script setup>
import { useTemplateRef, ref } from "vue"
import markdown from "snarkdown"

import PopupDialog from "@/components/PopupDialog.vue"

const dialog = useTemplateRef("dialog")

const msg = ref("")
const showCancel = ref(false)
const cancelIsNull = ref(false)
const userText = ref("")
const showUserText = ref(false)
const textbox = useTemplateRef("textbox") 

/**
 * Set up and display an alert popup
 *
 * @param      {string}              message  The message to show
 * @return     {Promise<(boolean)>}  Promise resolving to true/false
 */
const alert = message => {
  showCancel.value = false
  cancelIsNull.value = false
  showUserText.value = false
  msg.value = markdown('' + message)
  const promise = dialog.value.launchPopup()
  return promise
}

/**
 * Set up and display a confirm popup
 *
 * @param      {string}              message  The message
 * @return     {Promise<(boolean)>}  Promise resolving to true/false (OK/Cancel)
 */
const confirm = message => {
  showCancel.value = true
  cancelIsNull.value = false
  showUserText.value = false
  msg.value = markdown(message)
  const promise = dialog.value.launchPopup()
  return promise
}

/**
 * Set up and display a prompt popup
 *
 * @param      {string}                  message                   The message
 * @param      {(string|any)}            [defaultValue=undefined]  The default value (will be converted to string)
 * @return     {Promise<(string|null)>}  Promise resolving to user entered string (or null if cancelled)
 */
const prompt = (message, defaultValue = undefined) => {
  showCancel.value = true
  cancelIsNull.value = true
  msg.value = markdown(message)
  showUserText.value = true
  userText.value = defaultValue === undefined ? "" : defaultValue
  const promise = dialog.value.launchPopup(()=>textbox.value?.focus())
  return promise
}

defineExpose({
  alert,
  confirm,
  prompt,
})
</script>

<style scoped>
.alertbox-container {
  width: 42%;
  max-width: 680px;
  min-width: 350px;
}

.btn_actions {
  flex-direction: row;
  display: flex;
  gap: 0.25rem;
  justify-content: end;
  & button {
    width: fit-content;
  }
}
</style>
