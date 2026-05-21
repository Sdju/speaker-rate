export type CriterionId =
  | 'relevance'
  | 'novelty'
  | 'practicality'
  | 'structure'
  | 'speaker'
  | 'trust'

export type CriterionScore = 0 | 1 | 2 | 3

export type CriterionScoreDescriptions = [string, string, string, string]

export type Criterion = {
  id: CriterionId
  title: string
  description: string
  defaultWeight: number
  scoreDescriptions: CriterionScoreDescriptions
}
