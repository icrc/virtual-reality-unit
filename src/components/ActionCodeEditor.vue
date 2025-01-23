<!-- Action Editor Popup - for editing action code -->
<template>
  <popup-dialog ref="dialog" v-slot="popupControl" :heading="title" class="action-code-s-container">

    <div>
      <label style="--span: 6" :title="!isCurrentCodeSimple && 'This code cannot be edited in simple mode'"><input type="checkbox" v-model="isAdvanced" :disabled="!isCurrentCodeSimple" />Advanced editor? </label>
      <label style="--span: 6">{{ isAdvanced ? "Advanced" : "Simple" }} Editor<textarea rows="12" placeholder="n/a" type="text" v-model="actionCodeAdv"></textarea></label>
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

<script>
import { parser } from "@/libs/actionCode"

const SIMPLE_COMMANDS = {
  gotoScene: { requiresScene: true },
  setNextScene: { requiresScene: true },
  gotoNextScene: {},
}

const isSimpleCode = actionCode => {
  const commands = [...parser(actionCode, {})]
  console.log(commands)
  if (commands.length > 1) return false
  if (!commands.length) return true
  const command = commands[0].command
  const arg = commands[0].args[0]
  const isSimpleCommand = command in SIMPLE_COMMANDS
  if (!isSimpleCommand) return false
  if (isSimpleCommand && SIMPLE_COMMANDS[command].requiresScene && typeof arg !=="number") return false
  return true
}
</script>

<script setup>
import { useTemplateRef, toRaw, ref, computed } from "vue"

import PopupDialog from "@/components/PopupDialog.vue"

const dialog = useTemplateRef("dialog")

const title = ref("")
const actionCodeAdv = ref("")
const isAdvanced = ref(false)

const isCurrentCodeSimple = computed(() => {
  return isSimpleCode(getEditedActionCode())
})

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
  const code = toRaw(actionCodeToEdit)
  actionCodeAdv.value = code
  isAdvanced.value = !isSimpleCode(code)
}

/**
 * Gets the edited action code.
 */
const getEditedActionCode = () => {
  return actionCodeAdv.value
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
