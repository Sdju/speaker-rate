const readEmbedMode = () => {
  const params = new URLSearchParams(window.location.search)

  return params.get('embed') === '1' || window.top !== window.self
}

const readCompactMode = () => {
  const params = new URLSearchParams(window.location.search)

  return params.get('view') !== 'full'
}

export { getAppRoot, isWidgetMode, setAppRoot } from '@/embed/appRoot'

export const isEmbedMode = readEmbedMode()
export const isCompactMode = readCompactMode()
