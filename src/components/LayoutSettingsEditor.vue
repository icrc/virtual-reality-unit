<!-- Layout Settings Editor Popup - for editing layout settings -->
<template>
  <popup-dialog ref="dialog" v-slot="popupControl" :heading="title" class="layout-settings-s-container">
    <div>
      <label style="--span: 2">
        Test
        <input placeholder="Testing" type="text" />
      </label>
    </div>

    <div><hr /></div>

    <div>
      <span class="edit_actions">
        <button class="s-outline" @click="popupControl.setVisible(false)">Cancel</button>
        <button @click="() => popupControl.returnResult(getEditedSettings())">Accept</button>
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

/**
 * Set up and display the editor
 *
 * @param      {object}                  layoutSettings                    The layout settings
 * @param      {string}                  [heading="Edit Layout Settings"]  The heading
 * @return     {Promise<(null|object)>}  Promise resolving to the edited object or null if we exited
 */
const edit = (layoutSettings, heading = "Edit Layout Settings") => {
  const settingsToEdit = toRaw(layoutSettings)
  title.value = heading
  setupUI(settingsToEdit)
  const promise = dialog.value.launchPopup()
  return promise
}

/**
 * Set up the UI for the passed layout settings
 *
 * @param      {object}  layoutSettings  The layout settings
 */
const setupUI = layoutSettings => {}

/**
 * Gets the edited settings.
 */
const getEditedSettings = () => ({})

defineExpose({
  edit,
})
</script>

<style scoped>
.layout-settings-s-container {
  width: 32%;
  max-width: 750px;
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
