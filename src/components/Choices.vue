<!-- Choices Component -->
<template>

<div class="choices_container">
  <div :class="{ choice: true, [`choice_${index+1}`]: true }" v-for="(choice, index) in choices" :key="choice.id" @click="emit('choiceMade', choice)">
    Choice {{ index+1 }}
  </div>
</div>

</template>

<script>

</script>

<script setup>
import { ref } from "vue"

const props = defineProps({
  choices: {
    type: Array,
    default: []
  },
})

const emit = defineEmits(["choiceMade"])

</script>

<style scoped>

</style>
