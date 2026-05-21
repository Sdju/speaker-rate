<script setup lang="ts">
import { computed, ref } from 'vue'

import type { Criterion } from '@/types/rating'

const score = defineModel<number>({ required: true })
const weight = defineModel<number>('weight', { required: true })

const props = defineProps<{
  criterion: Criterion
}>()

const isWeightOpen = ref(false)

const scoreDescription = computed(
  () => props.criterion.scoreDescriptions[score.value] ?? 'Описание для этой оценки не задано.',
)
</script>

<template>
  <div class="criterion">
    <span class="criterion-copy">
      <span class="criterion-title">{{ criterion.title }}</span>
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
          max="10"
          step="1"
        />
        <output class="score-value">{{ score }}</output>
        <button
          :aria-expanded="isWeightOpen"
          :aria-label="`Настроить вес: ${criterion.title}`"
          :title="`Вес критерия: ${weight.toFixed(1)}`"
          class="weight-toggle"
          type="button"
          @click="isWeightOpen = !isWeightOpen"
        >
          ⚖️
        </button>
      </span>
      <span class="score-hint">
        {{ scoreDescription }}
      </span>
      <span v-if="isWeightOpen" class="weight-control">
        <span class="weight-copy">
          <span class="weight-title">Вес критерия</span>
          <span class="weight-description">Влияние на итоговую оценку</span>
        </span>
        <span class="weight-inputs">
          <input
            v-model.number="weight"
            :aria-label="`Вес: ${criterion.title}`"
            class="weight-slider"
            type="range"
            min="0"
            max="5"
            step="0.5"
          />
          <output class="weight-value">{{ weight.toFixed(1) }}</output>
        </span>
      </span>
    </span>
  </div>
</template>

<style scoped>
.criterion {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(280px, 420px);
  gap: 28px;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(23, 32, 38, 0.09);
}

.criterion-copy {
  display: grid;
  gap: 6px;
}

.criterion-title {
  font-size: 1.05rem;
  font-weight: 800;
}

.criterion-description {
  color: #657076;
  line-height: 1.45;
}

.slider-control {
  display: grid;
  gap: 10px;
}

.score-toolbar {
  display: grid;
  grid-template-columns: 1fr 48px 48px;
  gap: 12px;
  align-items: center;
}

.score-slider {
  width: 100%;
  accent-color: #2f6f67;
}

.score-value {
  display: grid;
  min-height: 44px;
  border: 1px solid rgba(23, 32, 38, 0.14);
  border-radius: 8px;
  background: #f8faf9;
  font-weight: 800;
  place-items: center;
}

.weight-toggle {
  display: grid;
  width: 48px;
  min-height: 44px;
  border: 1px solid rgba(23, 32, 38, 0.14);
  border-radius: 8px;
  color: #34474f;
  background: #f8faf9;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1;
  place-items: center;
}

.weight-toggle:hover,
.weight-toggle[aria-expanded='true'] {
  border-color: rgba(47, 111, 103, 0.34);
  color: #214e49;
  background: #eef5f2;
}

.score-hint {
  min-height: 2.7em;
  color: #4f6563;
  font-size: 0.94rem;
  font-weight: 700;
  line-height: 1.35;
}

.weight-control {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(150px, 220px);
  gap: 14px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid rgba(23, 32, 38, 0.1);
  border-radius: 8px;
  background: rgba(248, 250, 249, 0.76);
}

.weight-copy {
  display: grid;
  gap: 2px;
}

.weight-title {
  color: #263640;
  font-size: 0.82rem;
  font-weight: 800;
}

.weight-description {
  color: #657076;
  font-size: 0.78rem;
  line-height: 1.25;
}

.weight-inputs {
  display: grid;
  grid-template-columns: 1fr 44px;
  gap: 10px;
  align-items: center;
}

.weight-slider {
  width: 100%;
  accent-color: #7a6b3f;
}

.weight-value {
  display: grid;
  min-height: 34px;
  border-radius: 8px;
  color: #3d3520;
  background: #f0eadc;
  font-size: 0.84rem;
  font-weight: 800;
  place-items: center;
}

@media (max-width: 720px) {
  .criterion {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .weight-control {
    grid-template-columns: 1fr;
  }
}
</style>
