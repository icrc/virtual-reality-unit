<!-- Choices Component -->
<template>
  <div class="choice_container">
    <div v-if="timeLimit" class="timer"><div :class="{ time_indicator: true, go: timerActive }">&nbsp;</div></div>
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
import { onMounted, nextTick, ref } from "vue"
const props = defineProps({
  message: {
    type: String,
    default: "",
  },
  buttons: {
    type: Array,
    default: [],
  },
  timeLimit: {
    type: Number,
    default: 0,
  },
})

const timerActive = ref(false)

onMounted(() => {
  if (props.timeLimit) {
    setTimeout(() => (timerActive.value = true), 100)
  }
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
  & .timer {
    font-size: 0;
    display: flex;
    justify-content: center;
    padding-bottom: calc(var(--unit) * 2);
    & .time_indicator {
      background: #fff;
      height: calc(var(--unit) * 4);
      transition-property: width;
      transition-timing-function: linear;
      transition-duration: v-bind(timeLimit + "s");
      width: 96%;
      &.go {
        width: 0 !important;
      }
    }
  }
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
