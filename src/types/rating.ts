export type CriterionId =
  | 'relevance'
  | 'novelty'
  | 'practicality'
  | 'structure'
  | 'speaker'
  | 'trust'

export type Criterion = {
  id: CriterionId
  title: string
  description: string
  scoreDescriptions: string[]
}
