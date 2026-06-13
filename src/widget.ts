import { createApp } from 'vue'

import { setAppRoot } from '@/appRoot'
import RatingPanel from '@/components/RatingPanel.vue'
import '@/styles/themes.css'

declare global {
  interface Window {
    SpeakerRateWidget?: {
      mount: (container: HTMLElement) => () => void
    }
  }
}

const mount = (container: HTMLElement) => {
  if (container.dataset.mounted === 'true') return () => {}

  container.dataset.mounted = 'true'
  setAppRoot(container)

  const app = createApp(RatingPanel, { compact: true, jugru: true })
  app.mount(container)

  return () => {
    app.unmount()
    delete container.dataset.mounted
    container.removeAttribute('data-speaker-rate-app')
    delete container.dataset.theme
  }
}

window.SpeakerRateWidget = { mount }
