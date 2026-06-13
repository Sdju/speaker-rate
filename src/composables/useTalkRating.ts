import { useClipboard } from '@vueuse/core'
import { computed, reactive, ref } from 'vue'

import { criteria } from '@/config/ratingCriteria'
import type { CriterionId, CriterionScore } from '@/types/rating'

const MAX_CRITERION_SCORE = 3

export const SCORE_LABELS = [
  'Не подходит',
  'Критически слабая',
  'Очень слабая',
  'Слабое соответствие',
  'Существенные пробелы',
  'Нужна доработка',
  'Есть потенциал',
  'Перспективная заявка',
  'Хорошая заявка',
  'Сильная заявка',
  'Выдающаяся заявка',
] as const

const defaultScores: Record<CriterionId, CriterionScore> = {
  audienceValue: 2,
  contentDepth: 2,
  uniqueness: 2,
  speakerConfidence: 2,
  applicationQuality: 2,
}

const totalWeight = criteria.reduce((total, criterion) => total + criterion.weight, 0)

export const formatResultsText = (
  scores: Record<CriterionId, CriterionScore>,
  totalScore: number,
  scoreLabel: string,
) => {
  const criteriaResults = criteria
    .map((criterion) => `${criterion.title}: ${scores[criterion.id]}/${MAX_CRITERION_SCORE}.`)
    .join('\n')

  return [
    `Итоговая оценка: ${totalScore} из 10`,
    `Вердикт: ${scoreLabel}`,
    '',
    'Оценки по критериям:',
    criteriaResults,
  ].join('\n')
}

export const useTalkRating = () => {
  const copyError = ref(false)
  const scores = reactive<Record<CriterionId, CriterionScore>>({ ...defaultScores })

  const totalScore = computed(() => {
    if (totalWeight === 0) return 0

    const weightedSum = criteria.reduce(
      (total, criterion) => total + scores[criterion.id] * criterion.weight,
      0,
    )

    return Math.round((weightedSum / totalWeight / MAX_CRITERION_SCORE) * 10)
  })

  const scoreLabel = computed(() => SCORE_LABELS[totalScore.value] ?? SCORE_LABELS[0])

  const resultsText = computed(() =>
    formatResultsText(scores, totalScore.value, scoreLabel.value),
  )

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

  return { copyResults, copyStatus, resultsText, scores, scoreLabel, totalScore }
}
