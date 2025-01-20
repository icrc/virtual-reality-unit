<template>
  <div>
    <slot></slot>
  </div>
</template>

<script></script>

<script setup>
  import { provide } from 'vue'

 const done = event => {
  console.log('Test click:', event);
 }
 provide('done', done)

</script>

<style scoped>

</style>
