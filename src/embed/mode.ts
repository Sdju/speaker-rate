let widgetRoot: HTMLElement | null = null

const readEmbedMode = () => {
  const params = new URLSearchParams(window.location.search)

  return params.get('embed') === '1' || window.top !== window.self
}

const readCompactMode = () => {
  const params = new URLSearchParams(window.location.search)

  return params.get('view') !== 'full'
}

export const enableWidgetMode = (root: HTMLElement) => {
  widgetRoot = root
}

export const isWidgetMode = () => widgetRoot !== null

export const getWidgetRoot = () => widgetRoot

export const isEmbedMode = readEmbedMode()
export const isCompactMode = readCompactMode()

export const applyEmbedDocumentAttrs = () => {
  if (!isEmbedMode) return

  document.documentElement.dataset.embed = 'true'
}
