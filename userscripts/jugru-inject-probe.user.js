// ==UserScript==
// @name         JugRu — probe inject
// @namespace    https://github.com/grindpride/speaker-rate
// @version      0.3.0
// @description  Тест: вставить «Привет» над элементом [aria-label="Оценка"] на beta.jugru.org
// @author       grindpride
// @match        *://beta.jugru.org/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

;(function () {
  'use strict'

  const TARGET_SELECTOR = '[aria-label="Оценка"]'
  const VOTE_COMMENT_SELECTOR = 'textarea[name="voteComment"]'
  const PROBE_ATTR = 'data-speaker-rate-probe'
  const INSERT_TEXT = 'привет'

  const hasProbe = (target) => target.previousElementSibling?.getAttribute(PROBE_ATTR) === 'true'

  /** React-контролируемые поля: нативный setter + input/change. */
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

  const findVoteComment = (from) => {
    if (from instanceof Element) {
      const nearby = from.closest('form, [role="dialog"], main, section')
      const scoped = nearby?.querySelector(VOTE_COMMENT_SELECTOR)
      if (scoped instanceof HTMLTextAreaElement) return scoped
    }

    const global = document.querySelector(VOTE_COMMENT_SELECTOR)
    return global instanceof HTMLTextAreaElement ? global : null
  }

  const insertVoteComment = (from) => {
    const textarea = findVoteComment(from)
    if (!textarea) return { ok: false, message: 'textarea[name="voteComment"] не найден' }

    const next = textarea.value ? `${textarea.value}\n${INSERT_TEXT}` : INSERT_TEXT
    setReactFieldValue(textarea, next)
    textarea.focus()

    return { ok: true, message: 'Добавлено в voteComment' }
  }

  const injectProbe = (target) => {
    if (!(target instanceof Element)) return
    if (!target.matches(TARGET_SELECTOR)) return
    if (hasProbe(target)) return

    const probe = document.createElement('div')
    probe.setAttribute(PROBE_ATTR, 'true')
    probe.style.cssText =
      'margin: 0 0 8px; padding: 8px 12px; border: 2px dashed #2f6f67; border-radius: 8px; ' +
      'color: #172026; background: #e8f5f2; font: 600 14px/1.3 Roboto, system-ui, sans-serif;'

    const label = document.createElement('span')
    label.textContent = 'Привет'
    label.style.marginRight = '8px'

    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = '→ voteComment'
    button.style.cssText =
      'padding: 4px 10px; border: 1px solid #2f6f67; border-radius: 6px; ' +
      'color: #fff; background: #2f6f67; cursor: pointer; font: inherit;'

    const status = document.createElement('span')
    status.style.cssText = 'margin-left: 8px; font-size: 12px; font-weight: 400; color: #657076;'

    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()

      const result = insertVoteComment(target)
      status.textContent = result.message
      status.style.color = result.ok ? '#14532d' : '#7a1616'
    })

    probe.append(label, button, status)
    target.insertAdjacentElement('beforebegin', probe)
  }

  const scan = (root) => {
    if (!(root instanceof Node)) return

    if (root instanceof Element) {
      if (root.matches(TARGET_SELECTOR)) injectProbe(root)
      root.querySelectorAll(TARGET_SELECTOR).forEach(injectProbe)
    }
  }

  const start = () => {
    scan(document)

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'attributes' && record.target instanceof Element) {
          injectProbe(record.target)
          continue
        }

        for (const node of record.addedNodes) {
          scan(node)
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }
})()
