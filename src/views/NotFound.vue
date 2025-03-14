<!-- Not Found Page -->
<template>
  <div class="s-container">
    <h1>Page Not Found</h1>
  </div>
</template>

<script setup>
import { onMounted, inject } from "vue"

onMounted(() => {
  inject('setWindowTitle')('Not Found')
})
</script>
