import type { EmbedSyncMessage } from '@/embed/protocol'

export const JUGRU_RATING_GROUP_SELECTOR = '[aria-label="Оценка"]' as const
export const JUGRU_VOTE_COMMENT_SELECTOR = 'textarea[name="voteComment"]' as const

const MIN_SCORE = 1
const MAX_SCORE = 10

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
  const prototype = Object.getPrototypeOf(field)
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value')
  const setValue = descriptor?.set

  if (setValue) {
    setValue.call(field, value)
  } else {
    field.value = value
  }

  field.dispatchEvent(new Event('input', { bubbles: true }))
  field.dispatchEvent(new Event('change', { bubbles: true }))
}

const getRatingButtons = (group: Element) =>
  [...group.querySelectorAll('button[type="button"]')]
    .map((button) => {
      const score = Number(button.textContent?.trim())
      if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_SCORE) return null

      return { button, score }
    })
    .filter((entry): entry is { button: HTMLButtonElement; score: number } => entry !== null)

export const findJugruRatingGroup = (anchor?: Element | null) => {
  if (anchor?.matches(JUGRU_RATING_GROUP_SELECTOR)) return anchor

  const scoped = anchor?.closest('form, [role="dialog"], main, section')
  const inScope = scoped?.querySelector(JUGRU_RATING_GROUP_SELECTOR)
  if (inScope instanceof HTMLElement) return inScope

  const global = document.querySelector(JUGRU_RATING_GROUP_SELECTOR)
  return global instanceof HTMLElement ? global : null
}

export const findJugruVoteComment = (anchor?: Element | null) => {
  const scoped = anchor?.closest('form, [role="dialog"], main, section')
  const inScope = scoped?.querySelector(JUGRU_VOTE_COMMENT_SELECTOR)
  if (inScope instanceof HTMLTextAreaElement) return inScope

  const global = document.querySelector(JUGRU_VOTE_COMMENT_SELECTOR)
  return global instanceof HTMLTextAreaElement ? global : null
}

export const getJugruRatingScore = (group: Element) => {
  const pressed = group.querySelector('button[aria-pressed="true"]')
  if (!(pressed instanceof HTMLButtonElement)) return 0

  const score = Number(pressed.textContent?.trim())
  return Number.isInteger(score) ? score : 0
}

export const setJugruRatingScore = (score: number, anchor?: Element | null) => {
  if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_SCORE) return false

  const group = findJugruRatingGroup(anchor)
  if (!group) return false

  if (getJugruRatingScore(group) === score) return true

  const entry = getRatingButtons(group).find((item) => item.score === score)
  if (!entry) return false

  reactClick(entry.button)
  return true
}

export const setJugruVoteComment = (comment: string, anchor?: Element | null) => {
  const textarea = findJugruVoteComment(anchor ?? findJugruRatingGroup())
  if (!textarea) return false
  if (textarea.value === comment) return true

  setReactFieldValue(textarea, comment)
  return true
}

export const applyJugruHostSync = (payload: Pick<EmbedSyncMessage, 'totalScore' | 'comment'>) => {
  if (payload.totalScore >= MIN_SCORE && payload.totalScore <= MAX_SCORE) {
    setJugruRatingScore(payload.totalScore)
  }

  setJugruVoteComment(payload.comment)
}
