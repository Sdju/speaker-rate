export { default as RatingPanel } from '@/components/RatingPanel.vue'
export { formatResultsText, useTalkRating } from '@/composables/useTalkRating'
export { criteria } from '@/config/ratingCriteria'
export type { Criterion, CriterionId, CriterionScore } from '@/types/rating'
export {
  EMBED_MESSAGE_SOURCE,
  applyJugruHostSync,
  isEmbedSyncMessage,
  useWidgetBridge,
} from '@/embed'
export type { EmbedSyncMessage } from '@/embed'
