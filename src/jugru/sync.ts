const RATING = '[aria-label="Оценка"]'
const COMMENT = 'textarea[name="voteComment"]'

const reactClick = (element: HTMLElement) => {
  const init = { bubbles: true, cancelable: true, view: window }

  element.dispatchEvent(new PointerEvent('pointerdown', init))
  element.dispatchEvent(new MouseEvent('mousedown', init))
  element.focus({ preventScroll: true })
  element.dispatchEvent(new PointerEvent('pointerup', init))
  element.dispatchEvent(new MouseEvent('mouseup', init))
  element.click()
}

const setReactFieldValue = (field: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const setValue = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), 'value')?.set

  if (setValue) setValue.call(field, value)
  else field.value = value

  field.dispatchEvent(new Event('input', { bubbles: true }))
  field.dispatchEvent(new Event('change', { bubbles: true }))
}

const ratingGroup = () => {
  const node = document.querySelector(RATING)
  return node instanceof HTMLElement ? node : null
}

const voteComment = () => {
  const node = document.querySelector(COMMENT)
  return node instanceof HTMLTextAreaElement ? node : null
}

const setScore = (score: number) => {
  if (!Number.isInteger(score) || score < 1 || score > 10) return false

  const group = ratingGroup()
  if (!group) return false

  const button = [...group.querySelectorAll('button[type="button"]')].find(
    (node) => Number(node.textContent?.trim()) === score,
  )

  if (!(button instanceof HTMLButtonElement)) return false

  reactClick(button)
  return true
}

const setComment = (comment: string) => {
  const textarea = voteComment()
  if (!textarea || textarea.value === comment) return Boolean(textarea)

  setReactFieldValue(textarea, comment)
  return true
}

export const syncToJugru = (totalScore: number, comment: string) => {
  if (totalScore >= 1 && totalScore <= 10) setScore(totalScore)
  setComment(comment)
}
