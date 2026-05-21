<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

import RatingCriterion from '@/components/RatingCriterion.vue'
import { criteria } from '@/config/ratingCriteria'
import type { CriterionId } from '@/types/rating'

const WEIGHTS_STORAGE_KEY = 'speaker-rate:criterion-weights'

const scores = reactive<Record<CriterionId, number>>({
  relevance: 5,
  novelty: 5,
  practicality: 5,
  structure: 5,
  speaker: 5,
  trust: 5,
})

const weights = reactive<Record<CriterionId, number>>({
  relevance: 2,
  novelty: 1.25,
  practicality: 2,
  structure: 1,
  speaker: 1.25,
  trust: 1.5,
})

const isCriterionId = (id: string): id is CriterionId =>
  criteria.some((criterion) => criterion.id === id)

const restoreWeights = () => {
  const savedWeights = localStorage.getItem(WEIGHTS_STORAGE_KEY)

  if (!savedWeights) return

  try {
    const parsedWeights = JSON.parse(savedWeights) as Partial<Record<CriterionId, unknown>>

    Object.entries(parsedWeights).forEach(([id, weight]) => {
      if (isCriterionId(id) && typeof weight === 'number' && weight >= 0 && weight <= 5) {
        weights[id] = weight
      }
    })
  } catch {
    localStorage.removeItem(WEIGHTS_STORAGE_KEY)
  }
}

restoreWeights()

watch(
  weights,
  (currentWeights) => {
    localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify(currentWeights))
  },
  { deep: true },
)

const totalScore = computed(() => {
  const totalWeight = criteria.reduce((total, criterion) => total + weights[criterion.id], 0)

  if (totalWeight === 0) return 0

  const weightedSum = criteria.reduce(
    (total, criterion) => total + scores[criterion.id] * weights[criterion.id],
    0,
  )

  return Math.round((weightedSum / totalWeight) * 10) / 10
})

const scoreLabel = computed(() => {
  if (totalScore.value >= 8) return 'Сильная заявка'
  if (totalScore.value >= 6) return 'Перспективная заявка'
  if (totalScore.value >= 4) return 'Нужна доработка'

  return 'Слабое соответствие'
})
</script>

<template>
  <main class="page-shell">
    <section class="rating-panel" aria-labelledby="rating-title">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Оценка заявки</p>
          <h1 id="rating-title">Панель оценки доклада</h1>
        </div>
        <div class="total-card" aria-live="polite">
          <span class="total-label">Итог</span>
          <strong>{{ totalScore.toFixed(1) }}</strong>
          <span class="total-scale">из 10</span>
        </div>
      </div>

      <div class="criteria-list">
        <RatingCriterion
          v-for="criterion in criteria"
          :key="criterion.id"
          v-model="scores[criterion.id]"
          v-model:weight="weights[criterion.id]"
          :criterion="criterion"
        />
      </div>

      <footer class="result">
        <div class="result-summary">
          <span>{{ scoreLabel }}</span>
          <strong>{{ totalScore.toFixed(1) }} из 10</strong>
        </div>
        <p>
          Общая оценка рассчитывается как взвешенное среднее: оценка критерия умножается на его вес.
        </p>
      </footer>
    </section>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  min-width: 320px;
  color: #172026;
  background:
    radial-gradient(circle at top left, rgba(70, 130, 180, 0.2), transparent 32rem),
    linear-gradient(135deg, #f7f3ec 0%, #edf5f1 44%, #f6f8fb 100%);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

button,
input {
  font: inherit;
}

.page-shell {
  display: grid;
  min-height: 100vh;
  padding: 40px 20px;
  place-items: center;
}

.rating-panel {
  width: min(960px, 100%);
  padding: 32px;
  border: 1px solid rgba(23, 32, 38, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 24px 70px rgba(38, 54, 72, 0.14);
}

.panel-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(23, 32, 38, 0.1);
}

.eyebrow {
  margin: 0 0 8px;
  color: #2f6f67;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  max-width: 620px;
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1;
}

.total-card {
  display: grid;
  min-width: 148px;
  padding: 18px;
  border-radius: 8px;
  color: #fff;
  background: #244c67;
  place-items: center;
}

.total-label,
.total-scale {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.82rem;
  font-weight: 700;
}

.total-card strong {
  font-size: 3.2rem;
  line-height: 1;
}

.criteria-list {
  display: grid;
  gap: 14px;
  margin-top: 28px;
}

.result {
  position: sticky;
  bottom: 16px;
  z-index: 1;
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  margin-top: 28px;
  padding: 18px 20px;
  border: 1px solid rgba(47, 111, 103, 0.16);
  border-radius: 8px;
  background: rgba(238, 245, 242, 0.96);
  box-shadow: 0 16px 36px rgba(38, 54, 72, 0.14);
  backdrop-filter: blur(12px);
}

.result-summary {
  display: grid;
  gap: 4px;
}

.result-summary span {
  color: #214e49;
  font-size: 1.08rem;
  font-weight: 800;
}

.result-summary strong {
  color: #172026;
  font-size: 1.35rem;
  line-height: 1;
}

.result p {
  max-width: 520px;
  margin: 0;
  color: #4e5d62;
  line-height: 1.45;
}

@media (max-width: 720px) {
  .page-shell {
    padding: 16px;
  }

  .rating-panel {
    padding: 22px;
  }

  .panel-header,
  .result {
    flex-direction: column;
    align-items: stretch;
  }

  .total-card {
    width: 100%;
  }
}
</style>
