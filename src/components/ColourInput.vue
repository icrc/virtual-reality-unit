<!-- Colour Input Component -->
<template>
  <span class="col_container">
    <input class="col_selector" ref="selector" :placeholder="placeholder" type="color" v-model="hexColour" />
    <span @click="pick" title="Choose colour" :class="{sample: true, unset: !hexColour}"><span></span></span>
    <span class="controls">
      <input v-model="hexColour" :placeholder="placeholder" type="text" />
      <button @click="clear">
        <icon :title="buttonTitle" type="trash-2" class="icon button-icon" />
      </button>
    </span>
  </span>
</template>

<script></script>

<script setup>
import { useTemplateRef } from "vue"
import Icon from "vue-feather"

const hexColour = defineModel()
const props = defineProps({
  placeholder: String,
  buttonTitle: String,
})
const selector = useTemplateRef('selector')

const pick = () => selector.value.click()
const clear = () => hexColour.value = ''

</script>

<style scoped>
.col_container {
  display: flex;
  align-items: center;
  gap:0.25rem;
}

.controls {
  flex-grow: 1;
}

.col_selector {
  display: none;
}

.sample {
  cursor: pointer;
  position: relative;
  height: 2rem;
  aspect-ratio: 1;
  border-radius: calc(var(--s-input-border-radius) * 0.9);
  margin: 0.25em;
  border: 1px solid #555;
  background: repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 1rem 1rem;
  & span {
    display: inline-block;
    border-radius: calc(var(--s-input-border-radius) * 0.7);
    inset: 0 0 0 0;
    height: 100%;
    aspect-ratio: 1;
    background: v-bind(hexColour);
  }
  &.unset {
    opacity: 0.2;
    border:none;
  }
  &:hover {
    border:3px solid #555;
  }
}
</style>
