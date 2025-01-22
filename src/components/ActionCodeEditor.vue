<!-- Action Editor Popup - for editing action code -->
<template>
  <popup-dialog ref="dialog" v-slot="popupControl" :heading="title" class="action-code-s-container">
    <div>
      <label style="--span: 2">
        Test
        <input placeholder="Testing" type="text" v-model="actionCode" />
      </label>
    </div>

    <div><hr /></div>

    <div>
      <span class="edit_actions">
        <button class="s-outline" @click="popupControl.setVisible(false)">Cancel</button>
        <button @click="() => popupControl.returnResult(getEditedActionCode())">Accept</button>
      </span>
    </div>
  </popup-dialog>
</template>

<script></script>

<script setup>
import { useTemplateRef, toRaw, ref } from "vue"

import PopupDialog from "@/components/PopupDialog.vue"

const dialog = useTemplateRef("dialog")

const title = ref("")
const actionCode = ref("")

/**
 * Set up and display the editor
 *
 * @param      {object}                  actionCodeToEdit                  The layout settings
 * @param      {string}                  [heading="Edit Action(s)"]  The heading
 * @return     {Promise<(null|object)>}  Promise resolving to the edited actions or null if we exited
 */
const edit = (actionCodeToEdit, heading = "Edit Action(s)") => {
  title.value = heading
  setupUI(actionCodeToEdit)
  const promise = dialog.value.launchPopup()
  return promise
}

/**
 * Set up the UI for the passed action code
 *
 * @param      {object}  actionCodeToEdit  The code to edit
 */
const setupUI = actionCodeToEdit => {
  actionCode.value = toRaw(actionCodeToEdit)
}

/**
 * Gets the edited action code.
 */
const getEditedActionCode = () => {
  return actionCode.value
}

defineExpose({
  edit,
})
</script>

<style scoped>
.action-code-s-container {
  width: 38%;
  max-width: 680px;
  min-width: 450px;
}

.icon {
  cursor: pointer;
}

.edit_actions {
  flex-direction: row;
  display: flex;
  gap: 0.25rem;
  justify-content: end;
  & button {
    width: fit-content;
  }
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
