<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    :aria-label="isDark ? 'Включить светлую тему' : 'Включить тёмную тему'"
    :title="isDark ? 'Светлая тема' : 'Тёмная тема'"
    class="theme-toggle"
    type="button"
    @click="toggleTheme"
  >
    <span aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: grid;
  width: 44px;
  min-height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  background: var(--color-surface);
  cursor: pointer;
  font-size: 1.05rem;
  line-height: 1;
  place-items: center;
}

.theme-toggle:hover {
  background: var(--color-surface-muted);
}
</style>
