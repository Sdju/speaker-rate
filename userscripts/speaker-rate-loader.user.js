// ==UserScript==
// @name         Speaker Rate — JugRu
// @namespace    https://github.com/Sdju/speaker-rate
// @version      1.2.0
// @description  Панель оценки докладов на beta.jugru.org. UI с GitHub Pages — обновлять скрипт не нужно.
// @author       Sdju
// @match        *://beta.jugru.org/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

;(function () {
  'use strict'

  const ROOT_ID = 'speaker-rate-root'
  const PANEL_ID = 'speaker-rate-host'
  const PANEL_ORIGIN = 'https://sdju.github.io'
  const PANEL_PATH = '/speaker-rate/'
  const HOTKEY = { alt: true, shift: true, code: 'KeyR' }
  const MESSAGE_SOURCE = 'speaker-rate'
  const RATING_GROUP_SELECTOR = '[aria-label="Оценка"]'
  const VOTE_COMMENT_SELECTOR = 'textarea[name="voteComment"]'
  const MIN_SCORE = 1
  const MAX_SCORE = 10

  /** @type {ShadowRoot | null} */
  let shadowRoot = null
  /** @type {HTMLDivElement | null} */
  let panelHost = null
  /** @type {HTMLButtonElement | null} */
  let backdrop = null
  /** @type {HTMLIFrameElement | null} */
  let frame = null
  /** @type {HTMLButtonElement | null} */
  let launcher = null

  const panelUrl = () => {
    const url = new URL(PANEL_PATH, PANEL_ORIGIN)
    url.searchParams.set('embed', '1')
    url.searchParams.set('_', String(Date.now()))
    return url.href
  }

  /** Зеркало src/embed/host/jugru.ts — синхронизация с формой JugRu. */
  const reactClick = (element) => {
    const init = { bubbles: true, cancelable: true, view: window }

    element.dispatchEvent(new PointerEvent('pointerdown', init))
    element.dispatchEvent(new MouseEvent('mousedown', init))
    element.focus({ preventScroll: true })
    element.dispatchEvent(new PointerEvent('pointerup', init))
    element.dispatchEvent(new MouseEvent('mouseup', init))
    element.click()
  }

  const setReactFieldValue = (field, value) => {
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

  const findRatingGroup = () => {
    const node = document.querySelector(RATING_GROUP_SELECTOR)
    return node instanceof HTMLElement ? node : null
  }

  const findVoteComment = () => {
    const group = findRatingGroup()
    const scoped = group?.closest('form, [role="dialog"], main, section')
    const inScope = scoped?.querySelector(VOTE_COMMENT_SELECTOR)
    if (inScope instanceof HTMLTextAreaElement) return inScope

    const global = document.querySelector(VOTE_COMMENT_SELECTOR)
    return global instanceof HTMLTextAreaElement ? global : null
  }

  const getCurrentRatingScore = (group) => {
    const pressed = group.querySelector('button[aria-pressed="true"]')
    if (!(pressed instanceof HTMLButtonElement)) return 0

    const score = Number(pressed.textContent.trim())
    return Number.isInteger(score) ? score : 0
  }

  const setRatingScore = (score) => {
    if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_SCORE) return

    const group = findRatingGroup()
    if (!group) return
    if (getCurrentRatingScore(group) === score) return

    const button = [...group.querySelectorAll('button[type="button"]')].find((node) => {
      const value = Number(node.textContent.trim())
      return value === score
    })

    if (button instanceof HTMLButtonElement) reactClick(button)
  }

  const setVoteComment = (comment) => {
    const textarea = findVoteComment()
    if (!textarea || textarea.value === comment) return

    setReactFieldValue(textarea, comment)
  }

  const applyHostSync = (payload) => {
    if (payload.totalScore >= MIN_SCORE && payload.totalScore <= MAX_SCORE) {
      setRatingScore(payload.totalScore)
    }

    setVoteComment(payload.comment)
  }

  const isSyncMessage = (data) =>
    data &&
    typeof data === 'object' &&
    data.source === MESSAGE_SOURCE &&
    data.type === 'sync' &&
    typeof data.totalScore === 'number' &&
    typeof data.comment === 'string'

  const onWidgetMessage = (event) => {
    if (event.origin !== PANEL_ORIGIN) return
    if (!isSyncMessage(event.data)) return

    applyHostSync(event.data)
  }

  const isEditableTarget = (target) => {
    if (!(target instanceof Element)) return false

    if (target.closest('[contenteditable=""], [contenteditable="true"]')) return true
    if (target.closest('[role="textbox"], [role="combobox"], [role="searchbox"]')) return true
    if (target.closest('.ProseMirror, .tiptap, .lexical-editor, [data-slate-editor]')) return true

    const tag = target.tagName

    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
  }

  const closePanel = () => {
    if (!panelHost || !backdrop || !frame) return

    panelHost.dataset.open = 'false'
    backdrop.hidden = true
    frame.hidden = true
    frame.removeAttribute('src')

    if (shadowRoot?.host instanceof HTMLElement) {
      shadowRoot.host.dataset.open = 'false'
    }
  }

  const openPanel = () => {
    if (!panelHost || !backdrop || !frame) return

    frame.src = panelUrl()
    panelHost.dataset.open = 'true'
    backdrop.hidden = false
    frame.hidden = false

    if (shadowRoot?.host instanceof HTMLElement) {
      shadowRoot.host.dataset.open = 'true'
    }
  }

  const togglePanel = () => {
    if (panelHost?.dataset.open === 'true') {
      closePanel()
      return
    }

    openPanel()
  }

  const onKeydown = (event) => {
    if (event.altKey !== HOTKEY.alt || event.shiftKey !== HOTKEY.shift || event.code !== HOTKEY.code) {
      return
    }

    if (isEditableTarget(event.target)) return

    event.preventDefault()
    event.stopPropagation()
    togglePanel()
  }

  const onNavigate = () => {
    closePanel()
  }

  const hookHistory = () => {
    const wrap = (method) => {
      const original = history[method]

      history[method] = function (...args) {
        const result = original.apply(this, args)
        onNavigate()
        return result
      }
    }

    wrap('pushState')
    wrap('replaceState')
    window.addEventListener('popstate', onNavigate)
  }

  const buildStyles = () => `
    :host {
      all: initial;
      position: fixed;
      z-index: 2147483647;
      inset: 0;
      pointer-events: none;
    }

    :host([data-open='true']) {
      pointer-events: auto;
    }

    #${PANEL_ID} {
      position: fixed;
      inset: 0;
      pointer-events: none;
    }

    #${PANEL_ID}[data-open='true'] {
      pointer-events: auto;
    }

    .speaker-rate-backdrop {
      position: fixed;
      inset: 0;
      padding: 0;
      border: 0;
      background: rgba(0, 0, 0, 0.18);
      cursor: default;
    }

    .speaker-rate-popover {
      position: fixed;
      right: 16px;
      bottom: 16px;
      width: min(360px, calc(100vw - 32px));
      height: min(560px, calc(100vh - 32px));
      border: 0;
      border-radius: 12px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);
      background: transparent;
    }

    #speaker-rate-launcher {
      position: fixed;
      right: 16px;
      bottom: 16px;
      display: grid;
      width: 44px;
      height: 44px;
      padding: 0;
      border: 0;
      border-radius: 999px;
      color: #fff;
      background: #2f6f67;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      font: 700 18px/1 Roboto, system-ui, sans-serif;
      place-items: center;
      pointer-events: auto;
    }

    #speaker-rate-launcher:hover {
      background: #265a53;
    }

    :host([data-open='true']) #speaker-rate-launcher {
      display: none;
    }
  `

  const mount = () => {
    if (document.getElementById(ROOT_ID)) return

    const root = document.createElement('div')
    root.id = ROOT_ID
    root.dataset.open = 'false'

    shadowRoot = root.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = buildStyles()

    panelHost = document.createElement('div')
    panelHost.id = PANEL_ID
    panelHost.dataset.open = 'false'

    backdrop = document.createElement('button')
    backdrop.type = 'button'
    backdrop.className = 'speaker-rate-backdrop'
    backdrop.setAttribute('aria-label', 'Закрыть панель оценки')
    backdrop.hidden = true

    frame = document.createElement('iframe')
    frame.className = 'speaker-rate-popover'
    frame.title = 'Speaker Rate'
    frame.hidden = true
    frame.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads',
    )
    frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade')

    launcher = document.createElement('button')
    launcher.id = 'speaker-rate-launcher'
    launcher.type = 'button'
    launcher.title = 'Оценка доклада (Alt+Shift+R)'
    launcher.textContent = '★'

    panelHost.append(backdrop, frame)
    shadowRoot.append(style, panelHost, launcher)

    backdrop.addEventListener('click', closePanel)
    launcher.addEventListener('click', togglePanel)

    document.documentElement.append(root)
  }

  const ensureMounted = () => {
    if (!document.getElementById(ROOT_ID)) {
      mount()
    }
  }

  const watchDom = () => {
    const observer = new MutationObserver(() => {
      ensureMounted()
    })

    observer.observe(document.documentElement, { childList: true })
  }

  mount()
  hookHistory()
  watchDom()

  window.addEventListener('message', onWidgetMessage)
  window.addEventListener('keydown', onKeydown, true)
})()
