<script setup lang="ts">
import RatingCriterion from '@/components/RatingCriterion.vue'
import { useTalkRating } from '@/composables/useTalkRating'
import { criteria } from '@/config/ratingCriteria'

const { copyResults, copyStatus, scores, scoreLabel, totalScore, weights } = useTalkRating()
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
        <div class="copy-results">
          <button class="copy-button" type="button" @click="copyResults">Скопировать результаты</button>
          <span aria-live="polite">{{ copyStatus }}</span>
        </div>
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
  gap: 6px;
  margin-top: 18px;
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

.copy-results {
  display: grid;
  gap: 6px;
  justify-items: end;
}

.copy-button {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid rgba(47, 111, 103, 0.24);
  border-radius: 8px;
  color: #fff;
  background: #2f6f67;
  cursor: pointer;
  font-weight: 800;
}

.copy-button:hover {
  background: #285f58;
}

.copy-results span {
  min-height: 1.2em;
  color: #2f6f67;
  font-size: 0.82rem;
  font-weight: 800;
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

  .copy-results {
    justify-items: stretch;
  }
}
</style>
