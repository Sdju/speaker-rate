import { type ComputedRef, type Ref, unref, watch } from 'vue'

import { isEmbedMode } from '@/embed/mode'
import { EMBED_MESSAGE_SOURCE, type EmbedSyncMessage } from '@/embed/protocol'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type WidgetBridgeOptions = {
  enabled: MaybeRef<boolean>
  totalScore: MaybeRef<number>
  resultsText: MaybeRef<string>
  scoreLabel: MaybeRef<string>
}

export const useWidgetBridge = (options: WidgetBridgeOptions) => {
  if (!isEmbedMode || window.parent === window) return

  watch(
    [() => unref(options.enabled), () => unref(options.totalScore), () => unref(options.resultsText)],
    ([enabled, totalScore, comment]) => {
      if (!enabled) return

      const message: EmbedSyncMessage = {
        source: EMBED_MESSAGE_SOURCE,
        type: 'sync',
        totalScore,
        comment,
        scoreLabel: unref(options.scoreLabel),
      }

      console.log('[speaker-rate:widget]', 'postMessage → parent', {
        totalScore: message.totalScore,
        scoreLabel: message.scoreLabel,
        commentLength: message.comment.length,
      })

      window.parent.postMessage(message, '*')
    },
    { immediate: true },
  )
}
