<!-- Action Code Editor Component -->
<template>
  <span>
    <textarea placeholder="No action" v-model="actionCode"></textarea>
    <button><icon type="edit-3" class="icon button-icon" title="Edit action code" /></button>
  </span>
</template>

<script></script>

<script setup>
import Icon from "vue-feather"

const actionCode = defineModel()

const props = defineProps({
  resize: String
})

</script>

<style scoped>
span {
  display: flex;
  gap: 0.25rem;
  height:fit-content;
}

button {
  width: fit-content;
  max-height: 2.6rem;
}

textarea {
  padding: 0.5rem;
  height: 100%;
  min-height: 2.6rem;
  resize: v-bind(props.resize || 'none');
}
</style>
