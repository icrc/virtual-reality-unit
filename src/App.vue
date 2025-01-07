<template>
  <header v-if="!showContentOnly" :class="{ main_nav: true, full_screen: isFullscreen }">
    <nav class="s-container">
      <div>ICRC VideoPath</div>
      <menu>
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/view">View</RouterLink></li>
        <li><RouterLink to="/edit">Edit</RouterLink></li>
        <!-- <li><RouterLink to="/test">Test</RouterLink></li> -->
        <li><RouterLink to="/help">Help</RouterLink></li>
      </menu>
    </nav>
  </header>
  <div v-if="showContentOnly" class="content-only">
    <RouterView />
  </div>
  <RouterView v-else />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFullscreen } from "@/composables/fullscreen"

const { isFullscreen } = useFullscreen()
const route = useRoute()
const showContentOnly = computed(() => route.name === 'play')

</script>

<style>
@media screen and (min-width: 1280px) {
  :where(html) {
    font-size: calc(100% + 2px + 0.0054 * (80vw - 1280px));
  }
}

.main_nav.full_screen {
  display: none;
}

.content-only {
  padding-top: 1.5em;
}
</style>
