<script lang="ts">
  import type { Snippet } from 'svelte';
  import { trackOverlayFocus, pushOverlay, isTopOverlay, trapTab } from '../utils/overlayFocus';

  interface Props {
    open: boolean;
    title?: string;
    side?: 'left' | 'right';
    width?: string;
    onclose?: () => void;
    ariaLabel?: string;
    backdrop?: boolean;
    children: Snippet;
  }

  let {
    open,
    title,
    side = 'right',
    width = 'min(420px, 90vw)',
    onclose,
    ariaLabel,
    backdrop = true,
    children,
  }: Props = $props();

  const headingId = $props.id();
  const token = {};
  let panel = $state<HTMLElement>();
  let returnFocusTo: HTMLElement | null = null;

  $effect(() => {
    returnFocusTo = trackOverlayFocus(open, panel, returnFocusTo);
  });

  $effect(() => {
    if (open) return pushOverlay(token);
  });

  function handleBackdropClick() {
    onclose?.();
  }

  function handleKey(e: KeyboardEvent) {
    if (!open || e.defaultPrevented || !isTopOverlay(token)) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onclose?.();
    } else trapTab(e, panel);
  }
</script>

<svelte:window onkeydown={handleKey} />

{#if backdrop}
  <button
    class="backdrop"
    class:open
    aria-label="Close drawer"
    tabindex="-1"
    onclick={handleBackdropClick}
  ></button>
{/if}

<div
  class="drawer {side}"
  class:open
  style="--drawer-width: {width}"
  role="dialog"
  aria-modal="true"
  aria-hidden={!open}
  aria-labelledby={title ? headingId : undefined}
  aria-label={title ? undefined : ariaLabel}
  inert={!open}
  bind:this={panel}
  tabindex="-1"
>
  {#if title}
    <div class="drawer-header">
      <h3 id={headingId}>{title}</h3>
      <button class="drawer-close" onclick={onclose} aria-label="Close">✕</button>
    </div>
  {/if}
  {@render children()}
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 100;
    border: none;
    padding: 0;
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.18s ease;
  }
  .backdrop.open {
    opacity: 1;
    pointer-events: auto;
  }

  .drawer {
    position: fixed;
    top: 0;
    bottom: 0;
    width: var(--drawer-width);
    background: var(--color-surface);
    z-index: 101;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.18s ease;
  }
  .drawer.right {
    right: 0;
    border-left: 1px solid var(--color-border);
    transform: translateX(100%);
  }
  .drawer.left {
    left: 0;
    border-right: 1px solid var(--color-border);
    transform: translateX(-100%);
  }
  .drawer.open {
    transform: translateX(0);
  }
  .drawer:focus-visible {
    outline: none;
  }
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-4) var(--space-2);
    flex-shrink: 0;
  }
  .drawer-header h3 {
    margin: 0;
    font-size: var(--text-base);
  }
  .drawer-close {
    background: none;
    border: none;
    color: var(--color-text-dim);
    cursor: pointer;
    font-size: var(--text-base);
    padding: var(--space-1);
  }
</style>
