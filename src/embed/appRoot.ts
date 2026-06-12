export const APP_ROOT_ATTR = 'data-speaker-rate-app' as const

let appRoot: HTMLElement | null = null
let externalMount = false

export const setAppRoot = (root: HTMLElement, options?: { external?: boolean }) => {
  appRoot = root
  externalMount = options?.external ?? false
  root.setAttribute(APP_ROOT_ATTR, '')
}

export const clearAppRoot = (root: HTMLElement) => {
  if (appRoot === root) {
    appRoot = null
    externalMount = false
  }

  root.removeAttribute(APP_ROOT_ATTR)
  delete root.dataset.theme
  delete root.dataset.embed
}

export const getAppRoot = () => appRoot

export const isWidgetMode = () => externalMount
