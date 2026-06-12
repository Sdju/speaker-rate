import { createApp, type App } from 'vue'

import { clearAppRoot, setAppRoot } from '@/embed/appRoot'
import '@/styles/themes.css'

import WidgetApp from './WidgetApp.vue'

export type WidgetMountOptions = {
  theme?: 'light' | 'dark'
}

export type WidgetUnmount = () => void

declare global {
  interface Window {
    SpeakerRateWidget?: {
      mount: (container: HTMLElement, options?: WidgetMountOptions) => WidgetUnmount
    }
  }
}

const mountWidget = (container: HTMLElement, options: WidgetMountOptions = {}): WidgetUnmount => {
  if (container.dataset.speakerRateMounted === 'true') {
    console.warn('[speaker-rate:widget]', 'уже смонтирован', container)
    return () => {}
  }

  container.dataset.speakerRateMounted = 'true'
  setAppRoot(container, { external: true })

  if (options.theme) {
    container.dataset.theme = options.theme
  }

  const mountEl = document.createElement('div')
  container.append(mountEl)

  const app: App = createApp(WidgetApp)
  app.mount(mountEl)

  console.log('[speaker-rate:widget]', 'смонтирован в DOM')

  return () => {
    app.unmount()
    mountEl.remove()
    delete container.dataset.speakerRateMounted
    clearAppRoot(container)
  }
}

window.SpeakerRateWidget = { mount: mountWidget }

export { mountWidget }
