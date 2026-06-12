// ==UserScript==
// @name         Speaker Rate — JugRu
// @namespace    https://github.com/Sdju/speaker-rate
// @version      2.0.0
// @description  Минимальный загрузчик Speaker Rate на beta.jugru.org. Логика — на GitHub Pages.
// @author       Sdju
// @match        *://beta.jugru.org/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

;(function () {
  'use strict'

  /** Стабильная точка входа: меняется только при смене хостинга. */
  const PANEL_ORIGIN = 'https://sdju.github.io'
  const PANEL_BASE = '/speaker-rate/'

  const HOST_ATTR = 'data-speaker-rate-host'
  const SHELL_ID = 'speaker-rate-shell'
  const LAUNCHER_ID = 'speaker-rate-launcher'
  const FRAME_ID = 'speaker-rate-frame'
  const HOTKEY = { alt: true, shift: true, code: 'KeyR' }

  const panelUrl = () => {
    const url = new URL(PANEL_BASE, PANEL_ORIGIN)
    url.searchParams.set('embed', '1')
    url.searchParams.set('_', String(Date.now()))
    return url.href
  }

  const loadHostBridge = () => {
    if (document.querySelector(`script[${HOST_ATTR}]`)) return

    const script = document.createElement('script')
    script.setAttribute(HOST_ATTR, '')
    script.async = true
    script.src = `${PANEL_ORIGIN}${PANEL_BASE}host.js?_=${Date.now()}`
    document.head.append(script)
  }

  const isEditableTarget = (target) => {
    if (!(target instanceof Element)) return false
    if (target.closest('[contenteditable=""], [contenteditable="true"]')) return true
    if (target.closest('[role="textbox"], [role="combobox"], [role="searchbox"]')) return true
    if (target.closest('.ProseMirror, .tiptap, .lexical-editor, [data-slate-editor]')) return true

    const tag = target.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
  }

  const mountShell = () => {
    if (document.getElementById(SHELL_ID)) return

    const launcher = document.createElement('button')
    launcher.id = LAUNCHER_ID
    launcher.type = 'button'
    launcher.title = 'Оценка доклада (Alt+Shift+R)'
    launcher.textContent = '★'
    launcher.style.cssText =
      'position: fixed; right: 16px; bottom: 16px; z-index: 2147483647; ' +
      'display: grid; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 999px; ' +
      'color: #fff; background: #2f6f67; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); ' +
      'cursor: pointer; font: 700 18px/1 Roboto, system-ui, sans-serif; place-items: center;'

    const shell = document.createElement('div')
    shell.id = SHELL_ID
    shell.hidden = true
    shell.style.cssText = 'position: fixed; inset: 0; z-index: 2147483646;'

    const backdrop = document.createElement('button')
    backdrop.type = 'button'
    backdrop.setAttribute('aria-label', 'Закрыть панель оценки')
    backdrop.style.cssText =
      'position: fixed; inset: 0; padding: 0; border: 0; ' +
      'background: rgba(0, 0, 0, 0.18); cursor: default;'

    const frame = document.createElement('iframe')
    frame.id = FRAME_ID
    frame.title = 'Speaker Rate'
    frame.style.cssText =
      'position: fixed; right: 16px; bottom: 16px; ' +
      'width: min(360px, calc(100vw - 32px)); height: min(560px, calc(100vh - 32px)); ' +
      'border: 0; border-radius: 12px; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24); ' +
      'background: #fff;'

    shell.append(backdrop, frame)
    document.documentElement.append(launcher, shell)

    const closePanel = () => {
      shell.hidden = true
      launcher.hidden = false
      frame.removeAttribute('src')
    }

    const openPanel = () => {
      launcher.hidden = true
      shell.hidden = false
      frame.src = panelUrl()
    }

    const togglePanel = () => {
      if (shell.hidden) openPanel()
      else closePanel()
    }

    launcher.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      togglePanel()
    })

    backdrop.addEventListener('click', closePanel)

    window.addEventListener('keydown', (event) => {
      if (event.altKey !== HOTKEY.alt || event.shiftKey !== HOTKEY.shift || event.code !== HOTKEY.code) {
        return
      }
      if (isEditableTarget(event.target)) return

      event.preventDefault()
      event.stopPropagation()
      togglePanel()
    })
  }

  const boot = () => {
    loadHostBridge()
    mountShell()
  }

  if (document.body) boot()
  else {
    const observer = new MutationObserver(() => {
      if (!document.body) return
      observer.disconnect()
      boot()
    })
    observer.observe(document.documentElement, { childList: true })
  }
})()
