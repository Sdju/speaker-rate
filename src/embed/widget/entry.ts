import { createApp, type App } from 'vue'

import { enableWidgetMode } from '@/embed/mode'
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
  container.dataset.speakerRateRoot = ''

  if (options.theme) {
    container.dataset.theme = options.theme
  }

  enableWidgetMode(container)

  const mountEl = document.createElement('div')
  container.append(mountEl)

  const app: App = createApp(WidgetApp)
  app.mount(mountEl)

  console.log('[speaker-rate:widget]', 'смонтирован в DOM')

  return () => {
    app.unmount()
    mountEl.remove()
    delete container.dataset.speakerRateMounted
    delete container.dataset.speakerRateRoot
    delete container.dataset.theme
  }
}

window.SpeakerRateWidget = { mount: mountWidget }

export { mountWidget }
