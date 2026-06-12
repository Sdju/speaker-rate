import { usePreferredDark, useStorage } from '@vueuse/core'
import { computed, watchEffect } from 'vue'

import { getWidgetRoot, isWidgetMode } from '@/embed/mode'

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
    const theme = isDark.value ? 'dark' : 'light'
    const widgetRoot = getWidgetRoot()

    if (isWidgetMode() && widgetRoot) {
      widgetRoot.dataset.theme = theme
      return
    }

    document.documentElement.dataset.theme = theme
  })

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleTheme,
  }
}
