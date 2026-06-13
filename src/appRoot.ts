let root: HTMLElement | null = null

export const setAppRoot = (element: HTMLElement) => {
  root = element
  element.setAttribute('data-speaker-rate-app', '')
}

export const getAppRoot = () => root
