<template>
  <span class="controls">
    <input
      type="text"
      v-model="formattedValue"
      @input="handleInput"
      @blur="formatOnBlur"
      @focus="handleFocus"
      @keydown="handleKeydown"
      :placeholder="placeholderText"
      aria-label="Duration in minutes and seconds" />
      <button v-if="allowEnd" @click="setToEnd">
        <icon title="Set to end" type="skip-forward" class="icon button-icon" />
      </button>
  </span>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue"
import Icon from "vue-feather"

const props = defineProps({
  allowEnd: Boolean,
  endText: {
    type: String,
    default: "END",
  }
})

const setToEnd = () => model.value = -1

const placeholderText = computed(() => {
  if (props.allowEnd) {
    return (model.value == -1) ? props.endText : "00:00"
  } else {
    return "00:00"
  }
})

// Define the model using the Composition API's defineModel
const model = defineModel({
  default: null,
})

// Local state for the formatted value
const formattedValue = ref("")
const isEditing = ref(false)

// Convert seconds to mm:ss format
const secondsToFormatted = totalSeconds => {
  // Handle null or undefined value
  if (totalSeconds === null || totalSeconds === undefined || (totalSeconds == -1 && props.allowEnd)) {
    return ""
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

// Convert formatted mm:ss to seconds
const formattedToSeconds = formatted => {
  // Handle empty string as null
  if (!formatted || formatted.trim() === "") {
    return null
  }

  const parts = formatted.split(":")
  let minutes = 0
  let seconds = 0

  if (parts.length === 2) {
    minutes = parseInt(parts[0]) || 0
    seconds = parseInt(parts[1]) || 0
  } else if (parts.length === 1) {
    // Handle case where only one number is entered (treat as seconds)
    seconds = parseInt(parts[0]) || 0
  }

  // Ensure seconds is within valid range
  if (seconds >= 60) {
    minutes += Math.floor(seconds / 60)
    seconds = seconds % 60
  }

  return minutes * 60 + seconds
}

// Handle user input
const handleInput = event => {
  let value = event.target.value

  // Check for empty value
  if (!value) {
    formattedValue.value = ""
    model.value = null
    return
  }

  // Only allow digits and colon
  value = value.replace(/[^\d:]/g, "")

  // Enforce format
  if (isEditing.value) {
    if (value.length > 5) {
      value = value.substring(0, 5)
    }

    // If we have a colon, make sure it's in the right place
    if (value.includes(":")) {
      const parts = value.split(":")
      if (parts.length > 2) {
        // Keep only first colon
        value = parts[0] + ":" + parts.slice(1).join("")
      }
    } else if (value.length > 2) {
      // Automatically insert colon after 2 digits if not present
      value = value.substring(0, 2) + ":" + value.substring(2)
    }

    formattedValue.value = value

    // Update the model with the new seconds value
    model.value = formattedToSeconds(value)
  }
}

// Format value when leaving the input
const formatOnBlur = () => {
  isEditing.value = false

  // If the value is empty, set model to null
  if (!formattedValue.value || formattedValue.value.trim() === "") {
    model.value = null
    formattedValue.value = ""
    return
  }

  // Otherwise format properly
  formattedValue.value = secondsToFormatted(model.value)
}

// Handle focus to prepare for editing
const handleFocus = () => {
  isEditing.value = true
}

// Handle keydown events for special cases
const handleKeydown = event => {
  // Allow navigation keys and backspace/delete for clearing
  if (["ArrowLeft", "ArrowRight", "Backspace", "Delete", "Tab"].includes(event.key)) {
    return
  }

  // Restrict input to digits and colon
  if (!/[\d:]/.test(event.key)) {
    event.preventDefault()
  }

  // Prevent multiple colons
  if (event.key === ":" && formattedValue.value.includes(":")) {
    event.preventDefault()
  }
}

// Update formatted value when model changes externally
watch(model, newVal => {
  if (!isEditing.value) {
    formattedValue.value = secondsToFormatted(newVal)
  }
})

// Initialize component with the formatted value based on initial model value
onMounted(() => {
  formattedValue.value = secondsToFormatted(model.value)
})
</script>

<style scoped>
  
input {
  font-family: monospace;
  text-transform: uppercase;
}
</style>
