// ==UserScript==
// @name         Speaker Rate — JugRu
// @namespace    https://github.com/Sdju/speaker-rate
// @version      2.3.0
// @description  Минимальный загрузчик Speaker Rate на beta.jugru.org. Логика — на GitHub Pages.
// @author       Sdju
// @match        *://beta.jugru.org/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

;(function () {
  'use strict'

  const TAG = '[speaker-rate:loader]'
  const log = (...args) => console.log(TAG, ...args)
  const error = (...args) => console.error(TAG, ...args)

  const PANEL_ORIGIN = 'https://sdju.github.io'
  const PANEL_BASE = '/speaker-rate/'

  const HOST_ATTR = 'data-speaker-rate-host'
  const DOCK_ATTR = 'data-speaker-rate-dock'
  const FRAME_ID = 'speaker-rate-frame'
  const RATING_SELECTOR = '[aria-label="Оценка"]'

  log('инициализация', { href: location.href, readyState: document.readyState })

  const panelUrl = () => {
    const url = new URL(PANEL_BASE, PANEL_ORIGIN)
    url.searchParams.set('embed', '1')
    url.searchParams.set('_', String(Date.now()))
    return url.href
  }

  const isOwnElement = (node) => {
    if (!(node instanceof Element)) return false

    return Boolean(
      node.closest(`[${DOCK_ATTR}]`) ||
        node.id === FRAME_ID ||
        node.hasAttribute(DOCK_ATTR),
    )
  }

  const loadHostBridge = () => {
    const existing = document.querySelector(`script[${HOST_ATTR}]`)
    if (existing) {
      log('host.js уже в DOM', existing.src)
      return
    }

    const src = `${PANEL_ORIGIN}${PANEL_BASE}host.js?_=${Date.now()}`
    const script = document.createElement('script')
    script.setAttribute(HOST_ATTR, '')
    script.async = true
    script.src = src

    script.addEventListener('load', () => {
      log('host.js загружен', { src, bridge: window.__speakerRateHostBridge === true })
    })

    script.addEventListener('error', (event) => {
      error('host.js не загрузился', { src, event })
    })

    log('подключаю host.js', src)
    document.head.append(script)
  }

  const isPanelDocked = (target) => {
    const dock = target.previousElementSibling
    return (
      dock instanceof HTMLElement &&
      dock.hasAttribute(DOCK_ATTR) &&
      dock.querySelector(`#${FRAME_ID}`) instanceof HTMLIFrameElement
    )
  }

  const mountInlinePanel = (target) => {
    if (!(target instanceof Element)) return
    if (isPanelDocked(target)) return

    let dock = target.previousElementSibling
    if (!(dock instanceof HTMLElement) || !dock.hasAttribute(DOCK_ATTR)) {
      dock = document.createElement('div')
      dock.setAttribute(DOCK_ATTR, '')
      dock.style.cssText = 'box-sizing: border-box; width: 100%; margin: 0 0 16px;'
      target.insertAdjacentElement('beforebegin', dock)
      log('dock вставлен над формой оценки')
    }

    let frame = dock.querySelector(`#${FRAME_ID}`)
    if (!(frame instanceof HTMLIFrameElement)) {
      frame = document.createElement('iframe')
      frame.id = FRAME_ID
      frame.title = 'Speaker Rate'
      frame.style.cssText =
        'display: block; box-sizing: border-box; width: 100%; height: 520px; ' +
        'border: 0; border-radius: 10px; background: transparent; ' +
        'box-shadow: 0 8px 24px rgba(23, 32, 38, 0.12);'

      frame.addEventListener('load', () => {
        if (!frame.src) return
        log('iframe load', { src: frame.src })
      })

      dock.append(frame)
    }

    if (!frame.src) {
      const url = panelUrl()
      log('загружаю панель', url)
      frame.src = url
    }
  }

  const scanForRatingForm = (root) => {
    if (!(root instanceof Node)) return

    const check = (element) => {
      if (!(element instanceof Element)) return
      if (!element.matches(RATING_SELECTOR)) return
      mountInlinePanel(element)
    }

    if (root instanceof Document || root instanceof DocumentFragment) {
      root.querySelectorAll(RATING_SELECTOR).forEach(check)
      return
    }

    if (root instanceof Element) {
      if (isOwnElement(root)) return
      check(root)
      root.querySelectorAll(RATING_SELECTOR).forEach(check)
    }
  }

  const watchRatingForm = () => {
    scanForRatingForm(document)

    if (!document.querySelector(RATING_SELECTOR)) {
      log('форма оценки ещё не в DOM — жду')
    }

    let scheduled = false

    const flush = () => {
      scheduled = false

      const rating = document.querySelector(RATING_SELECTOR)
      if (rating instanceof Element) {
        mountInlinePanel(rating)
      }
    }

    const schedule = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(flush)
    }

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.target instanceof Element && isOwnElement(record.target)) continue

        if (record.type === 'attributes' && record.target instanceof Element) {
          if (record.target.matches(RATING_SELECTOR)) schedule()
          continue
        }

        for (const node of record.addedNodes) {
          if (node instanceof Element && isOwnElement(node)) continue
          if (node instanceof Element && node.matches(RATING_SELECTOR)) {
            schedule()
            continue
          }
          if (node instanceof Element && node.querySelector(RATING_SELECTOR)) {
            schedule()
          }
        }
      }
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label'],
    })
  }

  const boot = () => {
    log('boot')
    loadHostBridge()
    watchRatingForm()

    window.addEventListener('message', (event) => {
      if (event.origin !== PANEL_ORIGIN) return
      log('postMessage от панели', event.data)
    })

    log('готово')
  }

  if (document.body) {
    boot()
  } else {
    const observer = new MutationObserver(() => {
      if (!document.body) return
      observer.disconnect()
      boot()
    })
    observer.observe(document.documentElement, { childList: true })
  }
})()
