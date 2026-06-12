import { applyJugruHostSync } from '@/embed/host/jugru'
import { isEmbedSyncMessage } from '@/embed/protocol'

declare global {
  interface Window {
    __speakerRateHostBridge?: boolean
  }
}

const TAG = '[speaker-rate:host]'

const resolvePanelOrigin = () => {
  const script = document.currentScript
  if (script instanceof HTMLScriptElement && script.src) {
    return new URL(script.src).origin
  }

  return 'https://sdju.github.io'
}

const initHostBridge = () => {
  if (window.__speakerRateHostBridge) {
    console.log(TAG, 'мост уже инициализирован')
    return
  }

  window.__speakerRateHostBridge = true
  const panelOrigin = resolvePanelOrigin()

  console.log(TAG, 'мост запущен', { panelOrigin })

  window.addEventListener('message', (event) => {
    if (event.origin !== panelOrigin) {
      console.debug(TAG, 'postMessage проигнорирован: origin', event.origin, 'ожидался', panelOrigin)
      return
    }

    if (!isEmbedSyncMessage(event.data)) {
      console.debug(TAG, 'postMessage проигнорирован: неверный payload', event.data)
      return
    }

    console.log(TAG, 'sync', {
      totalScore: event.data.totalScore,
      scoreLabel: event.data.scoreLabel,
      commentLength: event.data.comment.length,
    })

    applyJugruHostSync(event.data)
  })
}

initHostBridge()
