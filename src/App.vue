<script setup lang="ts">
import RatingPanel from '@/components/RatingPanel.vue'
import { isCompactMode, isEmbedMode } from '@/embed'
</script>

<template>
  <main
    class="page-shell"
    :class="{
      'page-shell--compact': isCompactMode,
      'page-shell--embed': isEmbedMode,
    }"
  >
    <RatingPanel :compact="isCompactMode" :embed="isEmbedMode" />
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

.page-shell--embed {
  min-height: auto;
  padding: 0;
}
</style>
