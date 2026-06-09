<script setup lang="ts">
import { computed } from 'vue'

import type { Criterion } from '@/types/rating'

const score = defineModel<number>({ required: true })

const props = defineProps<{
  criterion: Criterion
}>()

const scoreDescription = computed(
  () => props.criterion.scoreDescriptions[score.value] ?? 'Описание для этой оценки не задано.',
)

const scoreToneClass = computed(() => `score-value--${score.value}`)
</script>

<template>
  <div class="criterion">
    <span class="criterion-copy">
      <span class="criterion-header">
        <span class="criterion-title">{{ criterion.title }}</span>
        <span class="criterion-weight" :title="`Вес критерия: ${criterion.weight}`">×{{ criterion.weight }}</span>
      </span>
      <span class="criterion-description">{{ criterion.description }}</span>
    </span>
    <span class="slider-control">
      <span class="score-toolbar">
        <input
          v-model.number="score"
          :aria-label="criterion.title"
          class="score-slider"
          type="range"
          min="0"
          max="3"
          step="1"
        />
        <output :class="['score-value', scoreToneClass]">{{ score }}</output>
      </span>
      <span class="score-hint">
        {{ scoreDescription }}
      </span>
    </span>
  </div>
</template>

<style scoped>
.criterion {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(280px, 420px);
  gap: 22px;
  align-items: start;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-divider);
}

.criterion-copy {
  display: grid;
  gap: 4px;
}

.criterion-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.criterion-title {
  color: var(--color-text-strong);
  font-size: 1rem;
  font-weight: 700;
}

.criterion-weight {
  display: grid;
  min-width: 32px;
  min-height: 24px;
  padding: 0 6px;
  border-radius: 6px;
  color: var(--color-weight-text);
  background: var(--color-weight-bg);
  font-size: 0.78rem;
  font-weight: 700;
  place-items: center;
}

.criterion-description {
  color: var(--color-text-muted);
  line-height: 1.45;
}

.slider-control {
  display: grid;
  gap: 6px;
}

.score-toolbar {
  display: grid;
  grid-template-columns: 1fr 48px;
  gap: 12px;
  align-items: center;
}

.score-slider {
  width: 100%;
  accent-color: var(--color-slider-accent);
}

.score-value {
  display: grid;
  min-height: 40px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 700;
  place-items: center;
}

.score-value--0 {
  color: var(--color-score-0-text);
  background: var(--color-score-0-bg);
}

.score-value--1 {
  color: var(--color-score-1-text);
  background: var(--color-score-1-bg);
}

.score-value--2 {
  color: var(--color-score-2-text);
  background: var(--color-score-2-bg);
}

.score-value--3 {
  color: var(--color-score-3-text);
  background: var(--color-score-3-bg);
}

.score-hint {
  display: block;
  min-height: 3lh;
  color: var(--color-text-hint);
  font-size: 0.94rem;
  line-height: 1.35;
}

@media (max-width: 720px) {
  .criterion {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
