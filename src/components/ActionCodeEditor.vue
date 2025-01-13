<!-- Action Code Editor Component -->
<template>
  <span>
    <input placeholder="Action code" type="text" v-model="actionCode" />
    <button><icon type="edit-3" class="icon button-icon" title="Edit action code" /></button>
  </span>
</template>

<script></script>

<script setup>
import Icon from "vue-feather"

const actionCode = defineModel()
</script>

<style scoped></style>
