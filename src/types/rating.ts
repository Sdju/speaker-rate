export type CriterionId =
  | 'audienceValue'
  | 'contentDepth'
  | 'uniqueness'
  | 'speakerConfidence'
  | 'applicationQuality'

export type CriterionScore = 0 | 1 | 2 | 3

export type CriterionScoreDescriptions = [string, string, string, string]

export type Criterion = {
  id: CriterionId
  title: string
  description: string
  weight: number
  scoreDescriptions: CriterionScoreDescriptions
}
