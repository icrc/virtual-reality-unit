<!-- Layout Settings Editor Popup - for editing layout settings -->
<template>
  <popup-dialog ref="dialog" v-slot="popupControl" :heading="title" class="layout-settings-s-container">
    <div style="--span: 4">
      <h6>Layout is '{{ layout.name }}':</h6>
      <span>Leave individual settings blank for layout default.</span>
      <hr />
    </div>
    <div style="--span: 4; max-height: 22rem; overflow-y: scroll">
      <div v-for="(val, key) in currentSettings" style="--span: 4">
        <label style="--span: 3">
          {{ layout.options[key]?.name }}
          <span v-if="layout.options[key].type === 'number'" class="button_input_fix">
            <input v-model="currentSettings[key]" placeholder="Default" type="number" />
            <button
              @click="
                () => {
                  currentSettings[key] = ''
                }
              ">
              <icon title="Remove and use default" type="trash-2" class="icon button-icon" />
            </button>
          </span>

          <colour-input
            class="button_input_fix"
            v-else-if="layout.options[key].type === 'colour'"
            v-model="currentSettings[key]"
            placeholder="Default"
            button-title="Remove and use default" />

          <select v-else-if="typeof layout.options[key].type === 'object'" v-model="currentSettings[key]">
            <option value="">(Default)</option>
            <option v-for="(v, k) in layout.options[key].type" :value="k">{{ v }}</option>
          </select>
        </label>
      </div>
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

<script>
import { LAYOUTS } from "@/layouts"
</script>

<script setup>
import { useTemplateRef, toRaw, ref, computed, reactive } from "vue"

import PopupDialog from "@/components/PopupDialog.vue"
import ColourInput from "@/components/ColourInput.vue"
import Icon from "vue-feather"

const dialog = useTemplateRef("dialog")

const title = ref("")
const id = ref("")
const layout = computed(() => LAYOUTS[id.value] || {})
const currentSettings = ref({})

/**
 * Set up and display the editor
 *
 * @param      {string}                  layoutId        The layout id
 * @param      {object}                  layoutSettings  The layout settings
 * @param      {string}                  [heading="Edit  Layout Settings"]  The heading
 * @return     {Promise<(null|object)>}  Promise resolving to the edited object or null if we exited
 */
const edit = (layoutId, layoutSettings, heading = "Edit Layout Settings") => {
  const settingsToEdit = toRaw(layoutSettings)
  const id = toRaw(layoutId)
  title.value = heading
  setupUI(id, settingsToEdit)
  const promise = dialog.value.launchPopup()
  return promise
}

/**
 * Set up the UI for the passed layout settings
 *
 * @param      {string}  layoutId        The layout id
 * @param      {object}  layoutSettings  The layout settings
 */
const setupUI = (layoutId, layoutSettings) => {
  id.value = layoutId
  const emptySettings = Object.fromEntries(Object.keys(LAYOUTS[layoutId].options).map(key => [key, ""]))
  currentSettings.value = { ...emptySettings, ...layoutSettings }
}

/**
 * Gets the edited settings.
 */
const getEditedSettings = () => {
  const ret = sanitiseSettings(toRaw(currentSettings.value))
  console.log(ret)
  return ret
}

/**
 * Sanitise the passed settings (based on the layout setup)
 *
 * @param      {object}  settings  The settings to sanitise
 */
const sanitiseSettings = settings => {
  const sanitised = { ...settings }
  for (const key in sanitised) {
    let val = sanitised[key]
    if (typeof val === "string") val = val.trim()
    if (["", undefined].includes(val)) {
      delete sanitised[key]
      continue
    }
    if (layout.value.options[key].type === "number") sanitised[key] = +val
  }
  return sanitised
}

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

.button_input_fix {
  & input,
  & button,
  :deep(& input),
  :deep(& button) {
    margin-top: 0.25rem;
  }
}
</style>
