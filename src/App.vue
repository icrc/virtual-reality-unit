<template>
  <header v-if="!showContentOnly" :class="{ main_nav: true, full_screen: isFullscreen }">
    <nav class="s-container">
      <div class="app_home_link" @click="goHome"><icon type="video" class="icon heading_icon"/> Video Pathway</div>
      <menu>
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/view">View</RouterLink></li>
        <li><RouterLink to="/edit">Edit</RouterLink></li>
        <!-- <li><RouterLink to="/test">Test</RouterLink></li> -->
        <li><a target="_blank" :href="DOCS_URL">Help</a></li>
      </menu>
    </nav>
  </header>
  <div v-if="showContentOnly" class="content-only">
    <RouterView />
  </div>
  <RouterView v-else />
  <alert-box ref="alertbox" />
</template>

<script>
  
const APP_NAME = "Video Pathway"

</script>

<script setup>
import Icon from "vue-feather"
import { computed, provide, useTemplateRef, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useFullscreen } from "@/composables/fullscreen"

import AlertBox from "@/components/AlertBox.vue"
import AlertBoxManager from "@/libs/alertBox"
const alertBox = useTemplateRef('alertbox')
onMounted(() => {
  AlertBoxManager.setComponent(alertBox.value)
})

const { isFullscreen } = useFullscreen()
const route = useRoute()
const router = useRouter()
const showContentOnly = computed(() => route.name === "play")

const goHome = () => router.push('/')

const DOCS_URL = import.meta.env.VITE_DOCS_URL

// globally available function for changing window title
provide("setWindowTitle", (title='', prefix = APP_NAME) => {
  const titleElement = document.querySelector("title")
  let titleFinal = prefix ? `${prefix}` : ''
  if (prefix && title) titleFinal += ' - '
  titleFinal += title
  titleElement.innerHTML = titleFinal
})

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
