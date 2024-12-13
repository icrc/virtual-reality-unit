<!-- Choices Component -->
<template>
  <div class="choice_container">
    <div class="message" v-if="message">{{ message }}</div>
    <div class="buttons">
      <div
        :class="{ button: true, [`choice_${index + 1}`]: true }"
        v-for="(choiceButton, index) in buttons"
        :key="`${index}-${choiceButton.text}`"
        @click="emit('choiceMade', choiceButton)">
        {{ choiceButton.text }}
      </div>
    </div>
  </div>
</template>

<script></script>

<script setup>

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

<style scoped>
.choice_container {
  --unit: calc(var(--playerfullheight) / 100);
  color: white;
  font-size: calc(var(--unit) * 4.5);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: 0.9;
  height: 100%;
  & .message {
    align-content: end;
    padding: 0 calc(var(--unit) * 5);
    text-shadow:
      0 0 5px #000,
      0 0 2px #000,
      0 0 10px #000;
  }
  & .buttons {
    font-size: calc(var(--unit) * 3.5);
    display: flex;
    flex-wrap: wrap;
    padding: calc(var(--unit) * 5);
    gap: calc(var(--unit) * 3.3);

    & .button {
      width: 49%;
      background: #008;
      border-radius: calc(var(--unit) * 2);
      padding: calc(var(--unit) * 2.5);
      cursor: pointer;
      &:hover {
        background: #00b;
      }
    }
  }
}
</style>
