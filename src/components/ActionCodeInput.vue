<!-- Action Code Editor Component -->
<template>
  <span>
    <textarea placeholder="No action" v-model="actionCode"></textarea>
    <button @click="getCodeFromEditor" title="Use Action Code Editor"><icon type="edit-3" class="icon button-icon" /></button>
  </span>
</template>

<script></script>

<script setup>
// TODO - flesh this out!

import { inject } from "vue"

import Icon from "vue-feather"

const editor = inject("actionCodeEditor")

const actionCode = defineModel()

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
  padding: 0.5rem;
  height: 100%;
  min-height: 2.6rem;
  resize: v-bind(props.resize || "none");
}
</style>
