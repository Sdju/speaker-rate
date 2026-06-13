<script setup lang="ts">
import RatingCriterion from '@/components/RatingCriterion.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useJugruSync } from '@/composables/useJugruSync'
import { useTalkRating } from '@/composables/useTalkRating'
import { criteria } from '@/config/ratingCriteria'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    jugru?: boolean
  }>(),
  {
    compact: true,
    jugru: false,
  },
)

const { copyResults, copyStatus, scores, scoreLabel, totalScore, resultsText } = useTalkRating()

if (props.jugru) {
  useJugruSync(totalScore, resultsText)
}
</script>

<template>
  <section
    class="rating-panel"
    :class="{
      'rating-panel--compact': compact,
      'rating-panel--jugru': jugru,
    }"
    aria-labelledby="rating-title"
  >
    <header class="panel-header">
      <div class="panel-heading">
        <p v-if="!compact" class="eyebrow">Оценка заявки</p>
        <h1 id="rating-title">{{ compact ? 'Оценка' : 'Панель оценки доклада' }}</h1>
        <p v-if="compact" class="panel-verdict">{{ scoreLabel }}</p>
      </div>
      <div class="panel-actions">
        <ThemeToggle v-if="!jugru" :compact="compact" />
        <div
          class="total-card"
          :style="{ background: `var(--color-total-${totalScore}-bg)` }"
          aria-live="polite"
        >
          <span v-if="!compact" class="total-label">Итог</span>
          <strong>{{ totalScore }}</strong>
          <span class="total-scale">/10</span>
        </div>
      </div>
    </header>

    <div class="criteria-list">
      <RatingCriterion
        v-for="criterion in criteria"
        :key="criterion.id"
        v-model="scores[criterion.id]"
        :compact="compact"
        :criterion="criterion"
      />
    </div>

    <footer v-if="!jugru" class="result">
      <template v-if="compact">
        <button class="copy-button" type="button" @click="copyResults">Копировать</button>
        <span aria-live="polite">{{ copyStatus }}</span>
      </template>
      <template v-else>
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
      </template>
    </footer>
  </section>
</template>

<style scoped>
.rating-panel {
  position: relative;
  container-type: inline-size;
  width: min(960px, 100%);
  padding: 32px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  box-shadow: var(--shadow);
}

.rating-panel--compact {
  position: relative;
  container-type: inline-size;
  width: min(360px, 100%);
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(23, 32, 38, 0.12);
}

.rating-panel--compact.rating-panel--jugru {
  width: 100%;
  max-width: none;
  border-color: var(--color-border);
  background: transparent;
  box-shadow: none;
}

.panel-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-border);
}

.rating-panel--compact .panel-header {
  gap: 10px;
  align-items: center;
  padding-bottom: 10px;
}

.panel-heading {
  min-width: 0;
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
  color: var(--color-text);
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1;
}

.rating-panel--compact h1 {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.2;
}

.panel-verdict {
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  line-height: 1.2;
}

.panel-actions {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.rating-panel--compact .panel-actions {
  gap: 6px;
  flex-shrink: 0;
}

.total-card {
  display: grid;
  min-width: 148px;
  padding: 18px;
  border-radius: 8px;
  color: var(--color-on-accent);
  place-items: center;
  transition: background-color 0.2s ease;
}

.rating-panel--compact .total-card {
  display: flex;
  gap: 2px;
  align-items: baseline;
  min-width: auto;
  padding: 6px 10px;
  border-radius: 6px;
}

.total-label,
.total-scale {
  color: color-mix(in srgb, var(--color-on-accent) 78%, transparent);
  font-size: 0.82rem;
  font-weight: 700;
}

.rating-panel--compact .total-scale {
  font-size: 0.72rem;
}

.total-card strong {
  font-size: 3.2rem;
  line-height: 1;
}

.rating-panel--compact .total-card strong {
  font-size: 1.25rem;
}

.criteria-list {
  display: grid;
  gap: 6px;
  margin-top: 18px;
}

.rating-panel--compact .criteria-list {
  gap: 0;
  margin-top: 6px;
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
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-muted);
  box-shadow: var(--shadow);
  backdrop-filter: blur(12px);
}

.rating-panel--compact .result {
  position: static;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.result-summary {
  display: grid;
  gap: 4px;
}

.result-summary span {
  color: var(--color-accent);
  font-size: 1.08rem;
  font-weight: 700;
}

.result-summary strong {
  color: var(--color-text);
  font-size: 1.35rem;
  line-height: 1;
}

.result p {
  max-width: 520px;
  margin: 0;
  color: var(--color-text-muted);
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
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  color: var(--color-on-accent);
  background: var(--color-accent);
  cursor: pointer;
  font-weight: 700;
}

.rating-panel--compact .copy-button {
  min-height: 28px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.copy-button:hover {
  background: var(--color-accent-hover);
}

.copy-results span,
.rating-panel--compact .result > span {
  min-height: 1.2em;
  color: var(--color-accent);
  font-size: 0.72rem;
  font-weight: 700;
}

@media (max-width: 720px) {
  .panel-header,
  .result:not(.rating-panel--compact .result) {
    flex-direction: column;
    align-items: stretch;
  }

  .panel-actions {
    width: 100%;
    justify-content: space-between;
  }

  .total-card:not(.rating-panel--compact .total-card) {
    flex: 1;
  }

  .copy-results {
    justify-items: stretch;
  }
}
</style>
