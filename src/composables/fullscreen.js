// fullscreen composable
import { ref, onMounted, onUnmounted } from "vue"

/**
 * composable for monitoring full-screen status of given element
 *
 * @param      {HTMLHtmlElement}  [el=window.document.querySelector('html')]  Optional HTMLElement to monitor (defaults
 *                                                                            to the main HTML element)
 * @return     {Object}           Object containing ref with fullscreen status, and a function to manually turn off
 *                                watching
 */
export function useFullscreen(el = window.document.querySelector("html")) {
  const checkIsFullscreen = element => window.document.fullscreenElement === element
  const isFullscreen = ref(checkIsFullscreen(el))

  function update() {
    isFullscreen.value = checkIsFullscreen(el)
  }

  function stopWatching() {
    window.document.removeEventListener("fullscreenchange", update)
  }

  onMounted(() => window.document.addEventListener("fullscreenchange", update))
  onUnmounted(stopWatching)

  return { isFullscreen, stopWatching }
}
