export const EMBED_MESSAGE_SOURCE = 'speaker-rate' as const

export type EmbedSyncMessage = {
  source: typeof EMBED_MESSAGE_SOURCE
  type: 'sync'
  totalScore: number
  comment: string
  scoreLabel: string
}

export const isEmbedSyncMessage = (data: unknown): data is EmbedSyncMessage => {
  if (!data || typeof data !== 'object') return false

  const message = data as Record<string, unknown>

  return (
    message.source === EMBED_MESSAGE_SOURCE &&
    message.type === 'sync' &&
    typeof message.totalScore === 'number' &&
    typeof message.comment === 'string' &&
    typeof message.scoreLabel === 'string'
  )
}
