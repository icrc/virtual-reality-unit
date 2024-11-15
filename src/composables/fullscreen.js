// fullscreen composable
import { ref, onMounted, onUnmounted } from 'vue'

export function useFullscreen(el = window.document.querySelector('html')) {

  const checkIsFullscreen = element => window.document.fullscreenElement === element
  const isFullscreen = ref(checkIsFullscreen(el))

  function update() {
    isFullscreen.value = checkIsFullscreen(el)
    console.log(checkIsFullscreen(el) ? "Yes" : "No")
  }

  function stopWatching() {
  	window.document.removeEventListener('fullscreenchange', update)
  }

  onMounted(() => window.document.addEventListener('fullscreenchange', update))
  onUnmounted(stopWatching)

  return { isFullscreen, stopWatching }

}