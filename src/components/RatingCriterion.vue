<script setup lang="ts">
import { computed } from 'vue'

import InfoTooltip from '@/components/InfoTooltip.vue'
import type { Criterion } from '@/types/rating'

const score = defineModel<number>({ required: true })

const props = withDefaults(
  defineProps<{
    criterion: Criterion
    compact?: boolean
  }>(),
  {
    compact: true,
  },
)

const scoreDescription = computed(
  () => props.criterion.scoreDescriptions[score.value] ?? 'Описание для этой оценки не задано.',
)

const criterionTooltipContent = computed(
  () => `${props.criterion.description}\n\nВес критерия: ×${props.criterion.weight}`,
)

const scoreToneClass = computed(() => `score-value--${score.value}`)
</script>

<template>
  <div class="criterion" :class="{ 'criterion--compact': compact }">
    <template v-if="compact">
      <div class="criterion-row">
        <span class="criterion-label">
          <span class="criterion-title">{{ criterion.title }}</span>
          <InfoTooltip
            :label="`Описание критерия «${criterion.title}»`"
            :content="criterionTooltipContent"
          />
        </span>
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
          <span class="score-badge">
            <output :class="['score-value', scoreToneClass]">{{ score }}</output>
            <InfoTooltip
              :label="`Пояснение оценки «${criterion.title}»`"
              :content="scoreDescription"
              align="end"
            />
          </span>
        </span>
      </div>
    </template>

    <template v-else>
      <div class="criterion-label">
        <span class="criterion-title">{{ criterion.title }}</span>
        <span class="criterion-weight" :title="`Вес критерия: ${criterion.weight}`">×{{ criterion.weight }}</span>
        <span class="criterion-description">{{ criterion.description }}</span>
      </div>

      <div class="slider-control">
        <div class="score-toolbar">
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
        </div>
        <span class="score-hint">
          {{ scoreDescription }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.criterion {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(280px, 420px);
  gap: 22px;
  align-items: start;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.criterion--compact {
  display: block;
  padding: 5px 0;
}

.criterion--compact:last-child {
  border-bottom: 0;
}

.criterion-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(120px, 148px);
  gap: 8px;
  align-items: center;
}

.criterion-label {
  display: grid;
  gap: 4px;
}

.criterion--compact .criterion-label {
  display: flex;
  gap: 4px;
  align-items: center;
  min-width: 0;
}

.criterion-title {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 700;
}

.criterion--compact .criterion-title {
  overflow: hidden;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.criterion-weight {
  display: grid;
  min-width: 32px;
  min-height: 24px;
  padding: 0 6px;
  border-radius: 6px;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  font-size: 0.78rem;
  font-weight: 700;
  place-items: center;
}

.criterion--compact .criterion-weight {
  min-width: 24px;
  min-height: 18px;
  padding: 0 4px;
  font-size: 0.65rem;
}

.criterion-description {
  color: var(--color-text-muted);
  line-height: 1.45;
}

.slider-control {
  display: grid;
  gap: 6px;
}

.criterion--compact .slider-control {
  gap: 0;
}

.score-toolbar {
  display: grid;
  grid-template-columns: 1fr 48px;
  gap: 12px;
  align-items: center;
}

.criterion--compact .score-toolbar {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
}

.criterion--compact .score-slider {
  flex: 1;
  min-width: 56px;
  height: 18px;
}

.score-badge {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.score-slider {
  width: 100%;
  accent-color: var(--color-accent);
}

.score-value {
  display: grid;
  min-height: 40px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 700;
  place-items: center;
}

.criterion--compact .score-value {
  min-width: 28px;
  min-height: 24px;
  border-radius: 6px;
  font-size: 0.82rem;
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
  color: var(--color-text-muted);
  font-size: 0.94rem;
  line-height: 1.35;
}

@media (max-width: 720px) {
  .criterion:not(.criterion--compact) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
