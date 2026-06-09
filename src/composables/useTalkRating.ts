import { useClipboard } from '@vueuse/core'
import { computed, reactive, ref } from 'vue'

import { criteria } from '@/config/ratingCriteria'
import type { CriterionId, CriterionScore } from '@/types/rating'

const MAX_CRITERION_SCORE = 3

const defaultScores: Record<CriterionId, CriterionScore> = {
  audienceValue: 2,
  contentDepth: 2,
  uniqueness: 2,
  speakerConfidence: 2,
  applicationQuality: 2,
}

const totalWeight = criteria.reduce((total, criterion) => total + criterion.weight, 0)

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

        return `${criterion.title}: ${score}/${MAX_CRITERION_SCORE}, вес ${criterion.weight}. ${getScoreDescription(criterion.id)}`
      })
      .join('\n')

    return [
      `Итоговая оценка: ${totalScore.value} из 10`,
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
  }
}
