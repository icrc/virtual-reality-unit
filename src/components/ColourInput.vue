<!-- Colour Input Component -->
<template>
  <span>
    <span>
      <input v-model="hexColour" :placeholder="placeholder" type="color" />
      <button>
        <icon :title="buttonTitle" type="trash-2" class="icon button-icon" />
      </button>
    </span>
  </span>
</template>

<script></script>

<script setup>
import Icon from "vue-feather"

const hexColour = defineModel()
const props = defineProps({
  placeholder: String,
  buttonTitle: String,
})
</script>

<style scoped></style>
