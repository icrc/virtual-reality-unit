<!-- Home Page -->
<template>
  <div class="s-container">
    <h1>Main</h1>
  </div>
</template>

<script setup>
import { onMounted, inject } from "vue"

onMounted(() => {
  inject('setWindowTitle')()
})
</script>
