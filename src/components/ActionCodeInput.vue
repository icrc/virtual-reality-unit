<!-- Action Code Editor Component -->
<template>
  <span>
    <textarea title="Click button to edit" readonly disabled autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="No action" v-model="actionCodeView"></textarea>
    <button @click="getCodeFromEditor" title="Use Action Code Editor"><icon type="edit-3" class="icon button-icon" /></button>
    <input type="hidden" v-model="actionCode">
  </span>
</template>

<script>

import { isSimpleCode } from "@/components/ActionCodeEditor.vue"
import { getSceneLabel } from "@/stores/storyStore"

export const readableActionCode = (simpleAction, str) => {
  let ret = simpleAction.command
  if (simpleAction?.arg && simpleAction?.arg !== '') {
    ret += ': '
    if (simpleAction?.requiresScene) {
      const scene = str.getSceneById(simpleAction.arg)
      ret += `"${getSceneLabel(scene)}"`
    } else {
      ret += simpleAction?.arg
    }
  }
  return ret
}


</script>

<script setup>
import { useStoryStore } from "@/stores/storyStore"
import { inject, computed } from "vue"
import Icon from "vue-feather"

const store = useStoryStore()

const editor = inject("actionCodeEditor")
const actionCode = defineModel()
const actionCodeView = computed(() => {
  const simpleAction = isSimpleCode(actionCode.value)
  return simpleAction ? readableActionCode(simpleAction, store) : actionCode.value
})
const props = defineProps({
  resize: String,
})



/**
 * Invoke the popup editor for action code, and return the result
 */
const getCodeFromEditor = async () => {
  const newCode = await editor.value.edit(actionCode.value)
  if (newCode !== null) actionCode.value = newCode
}
</script>

<style scoped>
span {
  display: flex;
  gap: 0.25rem;
  height: fit-content;
}

button {
  width: fit-content;
  max-height: 2.6rem;
}

textarea {
  font-family: monospace;
  font-size: 0.7rem;
  padding: 0.5rem;
  height: 100%;
  min-height: 2.6rem;
  resize: v-bind(props.resize || "none");
  cursor: default;
}
</style>
