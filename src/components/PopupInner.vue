<template>
  <button @click="done">Hello</button>
</template>

<script></script>

<script setup>

import { inject } from 'vue'

const done = inject('done')

</script>

<style scoped>

</style>
