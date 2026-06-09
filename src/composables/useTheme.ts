import { usePreferredDark, useStorage } from '@vueuse/core'
import { computed, watchEffect } from 'vue'

const THEME_STORAGE_KEY = 'speaker-rate:theme'

export type Theme = 'light' | 'dark'

export const useTheme = () => {
  const prefersDark = usePreferredDark()
  const storedTheme = useStorage<Theme | null>(THEME_STORAGE_KEY, null)

  const isDark = computed({
    get: () => {
      if (storedTheme.value === 'dark') return true
      if (storedTheme.value === 'light') return false

      return prefersDark.value
    },
    set: (value: boolean) => {
      storedTheme.value = value ? 'dark' : 'light'
    },
  })

  watchEffect(() => {
    document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light'
  })

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleTheme,
  }
}
