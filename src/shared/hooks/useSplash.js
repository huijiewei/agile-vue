import { onMounted, onUnmounted } from 'vue'

export function useSplash() {
  let timeoutId = null

  onMounted(() => {
    timeoutId = window.setTimeout(() => {
      const splash = document.getElementById('splash')

      if (splash) {
        splash.remove()
      }
    }, 600)
  })

  onUnmounted(() => {
    if (timeoutId) {
      window.clearTimeout(timeoutId)
    }
  })
}
