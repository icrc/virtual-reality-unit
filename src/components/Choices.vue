<!-- Choices Component -->
<template>
  <div :class="{ choice_container: true, [layout]: true }" :style="styleSettings">
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
import { onMounted, ref, computed } from "vue"
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
  layout: {
    type: String,
    default: "",
  },
  layoutSettings: {
    type: Object,
    default() {
      return {}
    },
  },
})

const timerActive = ref(false)

const styleSettings = computed(() => {
  return Object.fromEntries(Object.entries(props.layoutSettings).map(([key, value]) => [`--${key}`, value]))
})

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
  opacity: 1;
  height: 100%;
}

/* Basic choice layout ---------------------------------------------------------------------------------- */
.basic {
  --colour_timer: #fff;
  --colour_message: #fff;
  --colour_background: transparent;

  --colour_button1: #008;
  --colour_button2: #008;
  --colour_button3: #008;
  --colour_button4: #008;

  flex-direction: column;
  justify-content: flex-end;

  & .timer {
    background-color: var(--colour_background);
    font-size: 0;
    display: flex;
    justify-content: center;
    padding-bottom: calc(var(--unit) * 2);
    & .time_indicator {
      background: var(--colour_timer);
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
    background-color: var(--colour_background);
    color: var(--colour_message);
    padding: calc(var(--unit) * 3) calc(var(--unit) * 5) 0 calc(var(--unit) * 5);
    text-shadow:
      0 0 5px #000,
      0 0 2px #000,
      0 0 10px #000;
  }

  & .buttons {
    background-color: var(--colour_background);
    font-size: calc(var(--unit) * 3.5);
    display: flex;
    flex-wrap: wrap;
    padding: calc(var(--unit) * 5);
    gap: calc(var(--unit) * 3.3);

    & .button {
      width: 49%;
      border-radius: calc(var(--unit) * 2);
      padding: calc(var(--unit) * 2.5);
      cursor: pointer;
      &:hover {
        filter: brightness(1.25);
      }
    }

    & .button:nth-child(1) {
      background: var(--colour_button1);
    }
    & .button:nth-child(2) {
      background: var(--colour_button2);
    }
    & .button:nth-child(3) {
      background: var(--colour_button3);
    }
    & .button:nth-child(4) {
      background: var(--colour_button4);
    }
  }
}
</style>
