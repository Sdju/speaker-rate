<script setup lang="ts">
import RatingCriterion from '@/components/RatingCriterion.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useTalkRating } from '@/composables/useTalkRating'
import { criteria } from '@/config/ratingCriteria'

const { copyResults, copyStatus, scores, scoreLabel, totalScore } = useTalkRating()
</script>

<template>
  <main class="page-shell">
    <section class="rating-panel" aria-labelledby="rating-title">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Оценка заявки</p>
          <h1 id="rating-title">Панель оценки доклада</h1>
        </div>
        <div class="panel-actions">
          <ThemeToggle />
          <div class="total-card" aria-live="polite">
            <span class="total-label">Итог</span>
            <strong>{{ totalScore }}</strong>
            <span class="total-scale">из 10</span>
          </div>
        </div>
      </div>

      <div class="criteria-list">
        <RatingCriterion
          v-for="criterion in criteria"
          :key="criterion.id"
          v-model="scores[criterion.id]"
          :criterion="criterion"
        />
      </div>

      <footer class="result">
        <div class="result-summary">
          <span>{{ scoreLabel }}</span>
          <strong>{{ totalScore }} из 10</strong>
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
.page-shell {
  display: grid;
  min-height: 100vh;
  padding: 40px 20px;
  place-items: center;
}

.rating-panel {
  width: min(960px, 100%);
  padding: 32px;
  border: 1px solid var(--color-panel-border);
  border-radius: 8px;
  background: var(--color-panel-bg);
  box-shadow: var(--color-panel-shadow);
}

.panel-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-panel-border);
}

.panel-actions {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-accent);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  max-width: 620px;
  margin: 0;
  color: var(--color-text-strong);
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1;
}

.total-card {
  display: grid;
  min-width: 148px;
  padding: 18px;
  border-radius: 8px;
  color: #fff;
  background: var(--color-total-bg);
  place-items: center;
}

.total-label,
.total-scale {
  color: var(--color-total-text);
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
  border: 1px solid var(--color-result-border);
  border-radius: 8px;
  background: var(--color-result-bg);
  box-shadow: var(--color-result-shadow);
  backdrop-filter: blur(12px);
}

.result-summary {
  display: grid;
  gap: 4px;
}

.result-summary span {
  color: var(--color-accent-soft);
  font-size: 1.08rem;
  font-weight: 700;
}

.result-summary strong {
  color: var(--color-text-strong);
  font-size: 1.35rem;
  line-height: 1;
}

.result p {
  max-width: 520px;
  margin: 0;
  color: var(--color-text-subtle);
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
  border: 1px solid var(--color-accent-border);
  border-radius: 8px;
  color: #fff;
  background: var(--color-accent);
  cursor: pointer;
  font-weight: 700;
}

.copy-button:hover {
  background: var(--color-accent-hover);
}

.copy-results span {
  min-height: 1.2em;
  color: var(--color-accent);
  font-size: 0.82rem;
  font-weight: 700;
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

  .panel-actions {
    width: 100%;
    justify-content: space-between;
  }

  .total-card {
    flex: 1;
  }

  .copy-results {
    justify-items: stretch;
  }
}
</style>
