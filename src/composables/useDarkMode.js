import { ref, watch, onMounted } from 'vue'

const isDarkMode = ref(false)

export const useDarkMode = () => {
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('darkMode', isDarkMode.value ? 'true' : 'false')
    applyDarkMode(isDarkMode.value)
  }

  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }

  onMounted(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      isDarkMode.value = saved === 'true'
    } else {
      // Check system preference
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyDarkMode(isDarkMode.value)
  })

  return {
    isDarkMode,
    toggleDarkMode
  }
}
