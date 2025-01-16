<!-- Choices Component - for displaying choices during playback -->
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

  --text_colour_button1: #fff;
  --text_colour_button2: #fff;
  --text_colour_button3: #fff;
  --text_colour_button4: #fff;

  display: flex;
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
      color: var(--text_colour_button1);
    }
    & .button:nth-child(2) {
      background: var(--colour_button2);
      color: var(--text_colour_button2);
    }
    & .button:nth-child(3) {
      background: var(--colour_button3);
      color: var(--text_colour_button3);
    }
    & .button:nth-child(4) {
      background: var(--colour_button4);
      color: var(--text_colour_button4);
    }
  }
}

/* 4 buttons horizontal layout ---------------------------------------------------------------------------------- */
.btn_4_horiz {
  --colour_timer: #fff;
  --colour_message: #fff;
  --colour_background: transparent;

  --colour_button1: #008;
  --colour_button2: #008;
  --colour_button3: #008;
  --colour_button4: #008;

  --text_colour_button1: #fff;
  --text_colour_button2: #fff;
  --text_colour_button3: #fff;
  --text_colour_button4: #fff;

  --button_height: 30;
  --button_align: center /* or felx-start, flex-end */;

  display: flex;
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
    padding: calc(var(--unit) * 4) calc(var(--unit) * 4);
    height: calc(var(--unit) * var(--button_height));
    justify-content: space-evenly;

    & .button {
      width: 23%;
      border-radius: calc(var(--unit) * 2);
      padding: calc(var(--unit) * 2.5);
      display: flex;
      justify-content: center;
      align-items: var(--button_align);
      cursor: pointer;
      &:hover {
        filter: brightness(1.25);
      }
    }

    & .button:nth-child(1) {
      background: var(--colour_button1);
      color: var(--text_colour_button1);
    }
    & .button:nth-child(2) {
      background: var(--colour_button2);
      color: var(--text_colour_button2);
    }
    & .button:nth-child(3) {
      background: var(--colour_button3);
      color: var(--text_colour_button3);
    }
    & .button:nth-child(4) {
      background: var(--colour_button4);
      color: var(--text_colour_button4);
    }
  }
}

/* Full layout ---------------------------------------------------------------------------------- */
.full {
  --colour_timer: #fff;
  --colour_message: #fff;
  --colour_background: transparent;

  --colour_button1: #008;
  --colour_button2: #008;
  --colour_button3: #008;
  --colour_button4: #008;

  --text_colour_button1: #fff;
  --text_colour_button2: #fff;
  --text_colour_button3: #fff;
  --text_colour_button4: #fff;

  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  & .timer {
    background-color: var(--colour_background);
    font-size: 0;
    display: flex;
    justify-content: center;
    padding-bottom: calc(var(--unit) * 0);
    padding-top: calc(var(--unit) * 4);
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
    flex-direction: column;
    padding: calc(var(--unit) * 4) calc(var(--unit) * 4);
    gap: calc(var(--unit) * 3.3);
    justify-content: center;

    & .button {
      flex-grow: 1;
      border-radius: calc(var(--unit) * 2);
      padding: calc(var(--unit) * 2.5);
      height: calc(var(--unit) * 17);
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        filter: brightness(1.25);
      }
    }

    & .button:nth-child(1) {
      background: var(--colour_button1);
      color: var(--text_colour_button1);
    }
    & .button:nth-child(2) {
      background: var(--colour_button2);
      color: var(--text_colour_button2);
    }
    & .button:nth-child(3) {
      background: var(--colour_button3);
      color: var(--text_colour_button3);
    }
    & .button:nth-child(4) {
      background: var(--colour_button4);
      color: var(--text_colour_button4);
    }
  }
}

/* Column layout ---------------------------------------------------------------------------------- */
.column {
  --colour_timer: #fff;
  --colour_message: #fff;
  --colour_background: transparent;

  --colour_button1: #008;
  --colour_button2: #008;
  --colour_button3: #008;
  --colour_button4: #008;

  --text_colour_button1: #fff;
  --text_colour_button2: #fff;
  --text_colour_button3: #fff;
  --text_colour_button4: #fff;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  margin-left: 20%;
  padding-bottom: calc(var(--unit) * 6);

  & .timer {
    font-size: 0;
    display: flex;
    justify-content: flex-start;
    padding-bottom: calc(var(--unit) * 0);
    padding-top: calc(var(--unit) * 4);
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
    align-content: flex-end;
    color: var(--colour_message);
    padding: calc(var(--unit) * 3) calc(var(--unit) * 5) 0 calc(var(--unit) * 2);
    text-shadow:
      0 0 5px #000,
      0 0 2px #000,
      0 0 10px #000;
  }

  & .buttons {
    position: absolute;
    inset: 0 80% 0 0;
    background-color: var(--colour_background);
    font-size: calc(var(--unit) * 3.5);
    display: flex;
    flex-direction: column;
    padding: calc(var(--unit) * 4) calc(var(--unit) * 4);
    gap: calc(var(--unit) * 3.3);
    justify-content: flex-end;

    & .button {
      flex-grow: 1;
      border-radius: calc(var(--unit) * 2);
      padding: calc(var(--unit) * 2.5);
      height: calc(var(--unit) * 17);
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      max-height: calc(var(--unit) * 32);
      &:hover {
        filter: brightness(1.25);
      }
    }

    & .button:nth-child(1) {
      background: var(--colour_button1);
      color: var(--text_colour_button1);
    }
    & .button:nth-child(2) {
      background: var(--colour_button2);
      color: var(--text_colour_button2);
    }
    & .button:nth-child(3) {
      background: var(--colour_button3);
      color: var(--text_colour_button3);
    }
    & .button:nth-child(4) {
      background: var(--colour_button4);
      color: var(--text_colour_button4);
    }
  }
}

/* Column right layout ---------------------------------------------------------------------------------- */
.column_r {
  --colour_timer: #fff;
  --colour_message: #fff;
  --colour_background: transparent;

  --colour_button1: #008;
  --colour_button2: #008;
  --colour_button3: #008;
  --colour_button4: #008;

  --text_colour_button1: #fff;
  --text_colour_button2: #fff;
  --text_colour_button3: #fff;
  --text_colour_button4: #fff;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  margin-right: 20%;
  padding-bottom: calc(var(--unit) * 6);

  & .timer {
    font-size: 0;
    display: flex;
    justify-content: flex-end;
    padding-bottom: calc(var(--unit) * 0);
    padding-top: calc(var(--unit) * 4);
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
    align-content: flex-end;
    text-align: right;
    color: var(--colour_message);
    padding: calc(var(--unit) * 3) calc(var(--unit) * 2) 0 calc(var(--unit) * 5);
    text-shadow:
      0 0 5px #000,
      0 0 2px #000,
      0 0 10px #000;
  }

  & .buttons {
    position: absolute;
    inset: 0 0 0 80%;
    background-color: var(--colour_background);
    font-size: calc(var(--unit) * 3.5);
    display: flex;
    flex-direction: column;
    padding: calc(var(--unit) * 4) calc(var(--unit) * 4);
    gap: calc(var(--unit) * 3.3);
    justify-content: flex-end;

    & .button {
      flex-grow: 1;
      border-radius: calc(var(--unit) * 2);
      padding: calc(var(--unit) * 2.5);
      height: calc(var(--unit) * 17);
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      max-height: calc(var(--unit) * 32);
      &:hover {
        filter: brightness(1.25);
      }
    }

    & .button:nth-child(1) {
      background: var(--colour_button1);
      color: var(--text_colour_button1);
    }
    & .button:nth-child(2) {
      background: var(--colour_button2);
      color: var(--text_colour_button2);
    }
    & .button:nth-child(3) {
      background: var(--colour_button3);
      color: var(--text_colour_button3);
    }
    & .button:nth-child(4) {
      background: var(--colour_button4);
      color: var(--text_colour_button4);
    }
  }
}
</style>
