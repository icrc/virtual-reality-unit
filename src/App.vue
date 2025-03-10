<template>
  <header v-if="!showContentOnly" :class="{ main_nav: true, full_screen: isFullscreen }">
    <nav class="s-container">
      <div class="app_home_link" @click="goHome"><icon type="video" class="icon heading_icon"/> Video Pathway</div>
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
import Icon from "vue-feather"

import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useFullscreen } from "@/composables/fullscreen"

const { isFullscreen } = useFullscreen()
const route = useRoute()
const router = useRouter()
const showContentOnly = computed(() => route.name === "play")

const goHome = () => router.push('/')
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

.icon {
  height: 1.25em;
  aspect-ratio: 1;
  vertical-align: text-top;
}
button .button-icon svg {
  stroke: #fff !important;
}
label:has(> input.show_end_time[data-val="-1"]),
span:has(> input.show_end_time[data-val="-1"]) {
  position: relative;
}
label:has(> input.show_end_time[data-val="-1"])::before,
span:has(> input.show_end_time[data-val="-1"])::before {
  content: "END";
  position: absolute;
  left: 0;
  height: 0.5rem;
  line-height: 0.5em;
  right: 0;
  text-align: center;
  font-size: 0.75rem;
  bottom: 0;
  margin-bottom: -0.75rem;
  color: blue;
}

.heading_icon {
  height: 2em;
  vertical-align: middle;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
}

.app_home_link {
  cursor: pointer;
}
</style>
