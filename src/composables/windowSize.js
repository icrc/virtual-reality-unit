// window size composable
import { ref, onMounted, onUnmounted } from 'vue'

export function useWindowSize(resizeHandler = undefined) {

  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)

  function update() {
    width.value = window.innerWidth
    height.value = window.innerHeight
    resizeHandler && resizeHandler({width: width.value, height: height.value })
  }

  function stopWatching() {
  	window.removeEventListener('resize', update)
  }

  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(stopWatching)

  return { width, height, stopWatching }

}