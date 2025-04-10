<template>
  <popup-dialog ref="dialog" v-slot="popupControl" :heading="title" class="action-code-s-container">
    <div>
      <label style="--span: 6" :title="!isCurrentCodeSimple && 'This code cannot be edited in simple mode'">
        <input type="checkbox" v-model="isAdvanced" :disabled="!isCurrentCodeSimple" @change="handleSwapMode" />
        Advanced editor?
      </label>
      <template v-if="isAdvanced">
        <label style="--span: 6">
          Action Code
          <textarea
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            rows="12"
            placeholder="(No action)"
            type="text"
            v-model="actionCodeAdv"></textarea>
        </label>
        <label style="--span: 6" v-if="isAdvanced">
          Scenes (with system IDs) - for reference
          <span style="display: flex; gap: 0.5rem">
            <select style="flex-grow: 1" v-model="sceneRef" :title="'System ID - ' + sceneRef">
              <option v-for="scene in story.scenes" :key="scene.id" :value="scene.id" :title="'System ID - ' + scene.id">{{ `${scene.id}:      ` + getSceneLabel(scene) }}</option>
            </select>
            <button style="width: auto; white-space: nowrap" @click="copySceneIdToClipboard">Copy ID to clipboard</button>
          </span>
        </label>
      </template>
      <template v-else>
        <label :style="{ '--span': commandRequiresScene ? 3 : 6 }">
          Command
          <select v-model="simpleCommand" @change="fixScene">
            <option value="">(No Action)</option>
            <option v-for="(_, cmd) in SIMPLE_COMMANDS" :value="cmd">{{ cmd }}</option>
          </select>
        </label>
        <label style="--span: 3" v-if="commandRequiresScene">
          Scene
          <select v-model="simpleArg" :title="'System ID - ' + simpleArg">
            <option v-for="scene in story.scenes" :key="scene.id" :value="scene.id" :title="'System ID - ' + scene.id">{{ getSceneLabel(scene) }}</option>
          </select>
        </label>
      </template>
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
import { getSceneLabel } from "@/stores/storyStore"

const SIMPLE_COMMANDS = {
  gotoNextScene: {},
  gotoScene: { requiresScene: true },
  setNextScene: { requiresScene: true },
}

/**
 * Determines whether the specified action code is 'simple' code (can be edited in simple mode).
 *
 * @param      {string}   actionCode  The action code
 * @return     {object}   Object with info about the code if the specified action code is simple code, False otherwise.
 */
export const isSimpleCode = actionCode => {
  const commands = [...parser(actionCode, {})]
  if (commands.length > 1) return false
  if (!commands.length) return {}
  const command = commands[0].command
  const arg = commands[0].args[0]
  const isSimpleCommand = command in SIMPLE_COMMANDS
  if (!isSimpleCommand) return false
  if (isSimpleCommand && SIMPLE_COMMANDS[command].requiresScene && typeof arg !== "number") return false
  return { command, arg, requiresScene: SIMPLE_COMMANDS[command].requiresScene }
}
</script>

<script setup>
import { useTemplateRef, toRaw, ref, computed } from "vue"

import PopupDialog from "@/components/PopupDialog.vue"

import { useStoryStore } from "@/stores/storyStore"
const store = useStoryStore()
const story = computed(() => store.currentStory)

const dialog = useTemplateRef("dialog")

const title = ref("")
const actionCodeAdv = ref("")
const isAdvanced = ref(false)

const simpleCommand = ref("")
const simpleArg = ref()
const sceneRef = ref(store.getLowestSceneId())
const commandRequiresScene = computed(() => {
  return SIMPLE_COMMANDS[simpleCommand.value]?.requiresScene
})

const isCurrentCodeSimple = computed(() => {
  return isSimpleCode(getEditedActionCode())
})

/**
 * Copy Scene ID to Clipboard
 */
const copySceneIdToClipboard = () => {
  navigator.clipboard.writeText(sceneRef.value)
}

/**
 * Set up and display the editor
 *
 * @param      {object}                  actionCodeToEdit  The layout settings
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
  if ((isAdvanced.value = !isSimpleCode(code))) {
    setupAdvancedMode(code)
  } else {
    setupSimpleMode(code)
  }
}

/**
 * Handle swapping between adv/simple modes
 */
const handleSwapMode = () => {
  let code = getEditedActionCode(!isAdvanced.value)
  if (isAdvanced.value) {
    setupAdvancedMode(code)
  } else {
    setupSimpleMode(code)
  }
}

/**
 * Set up advanced mode
 *
 * @param      {string}  code    The code
 */
const setupAdvancedMode = code => {
  actionCodeAdv.value = code
}

/**
 * Fix the scene dropdown if it has no value
 */
const fixScene = () => {
  const cmd = simpleCommand.value
  if (SIMPLE_COMMANDS[cmd]?.requiresScene && !simpleArg.value) simpleArg.value = store.getLowestSceneId()
}

/**
 * Set up simple mode
 *
 * @param      {string}  code    The code
 */
const setupSimpleMode = code => {
  let { command, args } = [...parser(code, {})][0] || { command: "", args: [] }
  simpleCommand.value = command
  simpleArg.value = args[0]
}

/**
 * Gets the edited action code.
 *
 * @param      {boolean}  [advancedMode=isAdvanced.value]  Whether we want the code from advanced mode
 * @return     {string}  The edited action code.
 */
const getEditedActionCode = (advancedMode = isAdvanced.value) => {
  if (advancedMode) {
    return actionCodeAdv.value
  } else {
    let ret = simpleCommand.value
    if (SIMPLE_COMMANDS[simpleCommand.value]?.requiresScene) ret += ":" + simpleArg.value
    return ret
  }
}

defineExpose({
  edit,
})
</script>

<style scoped>
.action-code-s-container {
  width: 42%;
  max-width: 680px;
  min-width: 350px;
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

textarea {
  font-family: monospace;
  font-size: 0.7rem;
}
</style>
