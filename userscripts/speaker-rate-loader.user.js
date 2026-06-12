// ==UserScript==
// @name         Speaker Rate — JugRu
// @namespace    https://github.com/Sdju/speaker-rate
// @version      2.4.0
// @description  Минимальный загрузчик Speaker Rate на beta.jugru.org. Панель монтируется напрямую в DOM.
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

  const DOCK_ATTR = 'data-speaker-rate-dock'
  const MOUNT_ID = 'speaker-rate-mount'
  const CSS_ATTR = 'data-speaker-rate-widget-css'
  const SCRIPT_ATTR = 'data-speaker-rate-widget-js'
  const FONTS_ATTR = 'data-speaker-rate-fonts'
  const RATING_SELECTOR = '[aria-label="Оценка"]'

  log('инициализация', { href: location.href, readyState: document.readyState })

  const assetUrl = (file) => {
    const url = new URL(`${PANEL_BASE}${file}`, PANEL_ORIGIN)
    url.searchParams.set('_', String(Date.now()))
    return url.href
  }

  const isOwnElement = (node) => {
    if (!(node instanceof Element)) return false

    return Boolean(node.closest(`[${DOCK_ATTR}]`) || node.hasAttribute(DOCK_ATTR))
  }

  const ensureFonts = () => {
    if (document.querySelector(`link[${FONTS_ATTR}]`)) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap'
    link.setAttribute(FONTS_ATTR, '')
    document.head.append(link)
    log('шрифты подключены')
  }

  const ensureWidgetCss = () => {
    const existing = document.querySelector(`link[${CSS_ATTR}]`)
    if (existing) return Promise.resolve()

    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = assetUrl('widget.css')
      link.setAttribute(CSS_ATTR, '')

      link.addEventListener('load', () => {
        log('widget.css загружен')
        resolve()
      })

      link.addEventListener('error', (event) => {
        error('widget.css не загрузился', { href: link.href, event })
        reject(new Error('widget.css failed'))
      })

      document.head.append(link)
      log('подключаю widget.css', link.href)
    })
  }

  const ensureWidgetJs = () => {
    if (window.SpeakerRateWidget?.mount) {
      return Promise.resolve()
    }

    const existing = document.querySelector(`script[${SCRIPT_ATTR}]`)
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load', () => resolve(), { once: true })
        existing.addEventListener(
          'error',
          () => reject(new Error('widget.js failed')),
          { once: true },
        )
      })
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.async = true
      script.src = assetUrl('widget.js')
      script.setAttribute(SCRIPT_ATTR, '')

      script.addEventListener('load', () => {
        log('widget.js загружен', { api: typeof window.SpeakerRateWidget?.mount })
        resolve()
      })

      script.addEventListener('error', (event) => {
        error('widget.js не загрузился', { src: script.src, event })
        reject(new Error('widget.js failed'))
      })

      log('подключаю widget.js', script.src)
      document.head.append(script)
    })
  }

  let widgetLoading = null

  const loadWidget = () => {
    if (!widgetLoading) {
      ensureFonts()
      widgetLoading = ensureWidgetCss()
        .then(() => ensureWidgetJs())
        .catch((err) => {
          widgetLoading = null
          throw err
        })
    }

    return widgetLoading
  }

  const isPanelDocked = (target) => {
    const dock = target.previousElementSibling
    if (!(dock instanceof HTMLElement) || !dock.hasAttribute(DOCK_ATTR)) return false

    const mount = dock.querySelector(`#${MOUNT_ID}`)
    return mount instanceof HTMLElement && mount.dataset.speakerRateMounted === 'true'
  }

  const mountInlinePanel = (target) => {
    if (!(target instanceof Element)) return
    if (isPanelDocked(target)) return

    let dock = target.previousElementSibling
    if (!(dock instanceof HTMLElement) || !dock.hasAttribute(DOCK_ATTR)) {
      dock = document.createElement('div')
      dock.setAttribute(DOCK_ATTR, '')
      dock.style.cssText =
        'box-sizing: border-box; width: 100%; margin: 0 0 16px; ' +
        'border-radius: 10px; box-shadow: 0 8px 24px rgba(23, 32, 38, 0.12);'
      target.insertAdjacentElement('beforebegin', dock)
      log('dock вставлен над формой оценки')
    }

    let mount = dock.querySelector(`#${MOUNT_ID}`)
    if (!(mount instanceof HTMLElement)) {
      mount = document.createElement('div')
      mount.id = MOUNT_ID
      dock.append(mount)
    }

    if (mount.dataset.speakerRateMounted === 'true') return

    loadWidget()
      .then(() => {
        if (mount.dataset.speakerRateMounted === 'true') return
        if (!window.SpeakerRateWidget?.mount) {
          error('SpeakerRateWidget.mount недоступен')
          return
        }

        window.SpeakerRateWidget.mount(mount)
        log('панель смонтирована в DOM')
      })
      .catch((err) => {
        error('не удалось смонтировать панель', err)
      })
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
    watchRatingForm()
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
