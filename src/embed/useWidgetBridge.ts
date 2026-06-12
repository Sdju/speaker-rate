import { type ComputedRef, type Ref, unref, watch } from 'vue'

import { applyJugruHostSync } from '@/embed/host/jugru'
import { isEmbedMode, isWidgetMode } from '@/embed/mode'
import { EMBED_MESSAGE_SOURCE, type EmbedSyncMessage } from '@/embed/protocol'

const readEmbedQuery = () => new URLSearchParams(window.location.search).get('embed') === '1'

type MaybeRef<T> = Ref<T> | ComputedRef<T>

type WidgetBridgeOptions = {
  enabled: MaybeRef<boolean>
  totalScore: MaybeRef<number>
  resultsText: MaybeRef<string>
  scoreLabel: MaybeRef<string>
}

export const useWidgetBridge = (options: WidgetBridgeOptions) => {
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

      if (isWidgetMode()) {
        console.log('[speaker-rate:widget]', 'sync → JugRu', {
          totalScore: message.totalScore,
          scoreLabel: message.scoreLabel,
          commentLength: message.comment.length,
        })
        applyJugruHostSync(message)
        return
      }

      const iframeEmbed = (isEmbedMode || readEmbedQuery()) && window.parent !== window
      if (!iframeEmbed) return

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
