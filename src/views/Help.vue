<!-- Help Page -->
<template>
  <div class="s-container">
    <h1>Help</h1>
  </div>
</template>

<script setup>
import { onMounted, inject } from "vue"

onMounted(() => {
  inject('setWindowTitle')('Help')
})
</script>
