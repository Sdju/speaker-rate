<script setup lang="ts">
import { computed } from 'vue'

import RatingPanel from '@/components/RatingPanel.vue'

const compact = computed(() => {
  const view = new URLSearchParams(window.location.search).get('view')

  return view !== 'full'
})
</script>

<template>
  <main class="page-shell" :class="{ 'page-shell--compact': compact }">
    <RatingPanel :compact="compact" />
  </main>
</template>

<style scoped>
.page-shell {
  display: grid;
  min-height: 100vh;
  padding: 40px 20px;
  place-items: center;
}

.page-shell--compact {
  min-height: auto;
  padding: 0;
  place-items: stretch;
}
</style>
