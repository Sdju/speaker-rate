<script setup lang="ts">
import { useId } from 'vue'

withDefaults(
  defineProps<{
    label: string
    content: string
    align?: 'start' | 'end'
  }>(),
  {
    align: 'start',
  },
)

const anchorName = `--info-tooltip-${useId()}`
</script>

<template>
  <span class="info-tooltip">
    <button
      class="info-trigger"
      type="button"
      :aria-label="label"
      :style="{ anchorName }"
    >
      <span aria-hidden="true">?</span>
    </button>
    <span
      class="info-content"
      :class="`info-content--align-${align}`"
      role="tooltip"
      :style="{ positionAnchor: anchorName }"
    >
      {{ content }}
    </span>
  </span>
</template>

<style scoped>
.info-tooltip {
  display: inline-flex;
  flex-shrink: 0;
}

.info-trigger {
  display: grid;
  width: 18px;
  min-height: 18px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  background: var(--color-surface-muted);
  cursor: help;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1;
  place-items: center;
}

.info-trigger:hover,
.info-trigger:focus-visible {
  color: var(--color-accent);
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
  outline: none;
}

.info-content {
  z-index: 20;
  width: auto;
  max-inline-size: 240px;
  max-block-size: min(40vh, 240px);
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  background: var(--background, var(--color-surface));
  box-shadow: var(--shadow);
  font-size: 0.78rem;
  font-weight: 400;
  line-height: 1.35;
  text-align: left;
  white-space: pre-line;
  overflow-y: auto;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.15s ease,
    visibility 0.15s ease;
}

.info-tooltip:hover .info-content,
.info-tooltip:focus-within .info-content {
  opacity: 1;
  visibility: visible;
}

@position-try --below-start {
  top: anchor(bottom);
  bottom: auto;
  left: anchor(left);
  right: 0;
  margin-block-start: 6px;
  margin-block-end: 0;
}

@position-try --below-end {
  top: anchor(bottom);
  bottom: auto;
  right: anchor(right);
  left: auto;
  margin-block-start: 6px;
  margin-block-end: 0;
}

@supports (anchor-name: --anchor) {
  .info-content {
    position: absolute;
    inset: auto;
  }

  .info-content--align-start {
    bottom: anchor(top);
    left: anchor(left);
    right: 0;
    margin-block-end: 6px;
    position-try-fallbacks: --below-start;
  }

  .info-content--align-end {
    bottom: anchor(top);
    right: anchor(right);
    left: auto;
    max-inline-size: min(240px, anchor(right));
    margin-block-end: 6px;
    position-try-fallbacks: --below-end;
  }
}

@supports not (anchor-name: --anchor) {
  .info-tooltip {
    position: relative;
  }

  .info-content {
    position: absolute;
    bottom: calc(100% + 6px);
    max-width: min(240px, 100cqw);
    transition:
      opacity 0.15s ease,
      transform 0.15s ease,
      visibility 0.15s ease;
  }

  .info-content--align-start {
    left: 0;
    right: auto;
    transform: translateY(4px);
  }

  .info-content--align-end {
    right: 0;
    left: auto;
    transform: translateY(4px);
  }

  .info-tooltip:hover .info-content,
  .info-tooltip:focus-within .info-content {
    transform: translateY(0);
  }
}
</style>
