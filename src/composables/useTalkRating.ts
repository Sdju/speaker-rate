import { useClipboard, useStorage } from '@vueuse/core'
import { computed, reactive, ref } from 'vue'

import { criteria } from '@/config/ratingCriteria'
import type { CriterionId, CriterionScore } from '@/types/rating'

const MAX_CRITERION_SCORE = 3
const WEIGHTS_STORAGE_KEY = 'speaker-rate:criterion-weights'

const defaultScores: Record<CriterionId, CriterionScore> = {
  relevance: 2,
  novelty: 2,
  practicality: 2,
  structure: 2,
  speaker: 2,
  trust: 2,
}

const defaultWeights = Object.fromEntries(
  criteria.map((criterion) => [criterion.id, criterion.defaultWeight]),
) as Record<CriterionId, number>

export const useTalkRating = () => {
  const copyError = ref(false)

  const scores = reactive<Record<CriterionId, CriterionScore>>({ ...defaultScores })

  const weights = useStorage<Record<CriterionId, number>>(
    WEIGHTS_STORAGE_KEY,
    defaultWeights,
    localStorage,
    {
      mergeDefaults: true,
    },
  )

  const totalScore = computed(() => {
    const totalWeight = criteria.reduce((total, criterion) => total + weights.value[criterion.id], 0)

    if (totalWeight === 0) return 0

    const weightedSum = criteria.reduce(
      (total, criterion) => total + scores[criterion.id] * weights.value[criterion.id],
      0,
    )

    return Math.round((weightedSum / totalWeight / MAX_CRITERION_SCORE) * 100) / 10
  })

  const scoreLabel = computed(() => {
    if (totalScore.value >= 8) return 'Сильная заявка'
    if (totalScore.value >= 6) return 'Перспективная заявка'
    if (totalScore.value >= 4) return 'Нужна доработка'

    return 'Слабое соответствие'
  })

  const getScoreDescription = (criterionId: CriterionId) => {
    const criterion = criteria.find((item) => item.id === criterionId)

    return criterion?.scoreDescriptions[scores[criterionId]] ?? 'Описание оценки не задано.'
  }

  const resultsText = computed(() => {
    const criteriaResults = criteria
      .map((criterion) => {
        const score = scores[criterion.id]
        const weight = weights.value[criterion.id].toFixed(1)

        return `${criterion.title}: ${score}/${MAX_CRITERION_SCORE}, вес ${weight}. ${getScoreDescription(criterion.id)}`
      })
      .join('\n')

    return [
      `Итоговая оценка: ${totalScore.value.toFixed(1)} из 10`,
      `Вердикт: ${scoreLabel.value}`,
      '',
      'Оценки по критериям:',
      criteriaResults,
    ].join('\n')
  })

  const { copy, copied, isSupported: isClipboardSupported } = useClipboard({
    source: resultsText,
    copiedDuring: 1800,
  })

  const copyStatus = computed(() => {
    if (copied.value) return 'Скопировано'
    if (copyError.value) return 'Не удалось скопировать'

    return ''
  })

  const copyResults = async () => {
    copyError.value = false

    try {
      if (!isClipboardSupported.value) throw new Error('Clipboard API is not supported')

      await copy()
    } catch {
      copyError.value = true
    }
  }

  return {
    copyResults,
    copyStatus,
    scores,
    scoreLabel,
    totalScore,
    weights,
  }
}
