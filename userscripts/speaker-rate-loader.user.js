// ==UserScript==
// @name         Speaker Rate — JugRu
// @namespace    https://github.com/Sdju/speaker-rate
// @version      3.0.0
// @description  Speaker Rate на beta.jugru.org
// @author       Sdju
// @match        *://beta.jugru.org/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

;(function () {
  'use strict'

  const BASE = 'https://sdju.github.io/speaker-rate/'
  const TARGET = '[aria-label="Оценка"]'
  const DOCK = 'data-speaker-rate-dock'

  const asset = (file) => `${BASE}${file}?_=${Date.now()}`

  const loadCss = (href) =>
    new Promise((resolve, reject) => {
      if (document.querySelector(`link[href^="${BASE}widget.css"]`)) return resolve()

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.onload = () => resolve()
      link.onerror = () => reject(new Error('widget.css'))
      document.head.append(link)
    })

  const loadJs = (src) =>
    new Promise((resolve, reject) => {
      if (window.SpeakerRateWidget?.mount) return resolve()

      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('widget.js'))
      document.head.append(script)
    })

  let assets = null
  const ensureAssets = () => {
    if (!assets) assets = loadCss(asset('widget.css')).then(() => loadJs(asset('widget.js')))
    return assets
  }

  const hasDock = (target) => target.previousElementSibling?.hasAttribute(DOCK)

  const mount = (target) => {
    if (!(target instanceof Element) || !target.matches(TARGET) || hasDock(target)) return

    const dock = document.createElement('div')
    dock.setAttribute(DOCK, '')
    dock.style.cssText = 'width:100%;margin:0 0 16px;'
    target.insertAdjacentElement('beforebegin', dock)

    ensureAssets()
      .then(() => window.SpeakerRateWidget?.mount(dock))
      .catch((error) => console.error('[speaker-rate]', error))
  }

  const scan = (root) => {
    if (!(root instanceof Node)) return

    if (root instanceof Element) {
      if (root.matches(TARGET)) mount(root)
      root.querySelectorAll(TARGET).forEach(mount)
    }
  }

  const start = () => {
    scan(document)

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'attributes' && record.target instanceof Element) {
          mount(record.target)
          continue
        }

        for (const node of record.addedNodes) scan(node)
      }
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label'],
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }
})()
