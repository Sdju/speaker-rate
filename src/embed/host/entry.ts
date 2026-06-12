import { applyJugruHostSync } from '@/embed/host/jugru'
import { isEmbedSyncMessage } from '@/embed/protocol'

declare global {
  interface Window {
    __speakerRateHostBridge?: boolean
  }
}

const resolvePanelOrigin = () => {
  const script = document.currentScript
  if (script instanceof HTMLScriptElement && script.src) {
    return new URL(script.src).origin
  }

  return 'https://sdju.github.io'
}

const initHostBridge = () => {
  if (window.__speakerRateHostBridge) return

  window.__speakerRateHostBridge = true
  const panelOrigin = resolvePanelOrigin()

  window.addEventListener('message', (event) => {
    if (event.origin !== panelOrigin) return
    if (!isEmbedSyncMessage(event.data)) return

    applyJugruHostSync(event.data)
  })
}

initHostBridge()
