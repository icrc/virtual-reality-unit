<!-- Choices Component -->
<template>
  <div class="choices_container">
    <div class="message" v-if="message">{{ message }}</div>
    <div class="buttons">
      <div :class="{ choice: true, [`choice_${index + 1}`]: true }" v-for="(button, index) in buttons" :key="choice.id" @click="emit('choiceMade', choice)">
        Choice {{ index + 1 }}
      </div>
    </div>
  </div>
</template>

<script></script>

<script setup>
import { ref } from "vue"

const props = defineProps({
  message: {
    type: String,
    default: "",
  },
  buttons: {
    type: Array,
    default: [],
  },
})

const emit = defineEmits(["choiceMade"])
</script>

<style scoped></style>
