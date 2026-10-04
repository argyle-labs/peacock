<script lang="ts">
  import type { Snippet } from 'svelte';
  import { trackOverlayFocus, pushOverlay, isTopOverlay } from '../utils/overlayFocus';

  let {
    open = $bindable(false),
    align = 'start',
    width,
    ariaLabel,
    trigger,
    children,
  }: {
    open?: boolean;
    align?: 'start' | 'end';
    width?: number;
    /** Names the dropdown and gives it `role="dialog"`, so a trigger can
     * declare `aria-haspopup="dialog"`. */
    ariaLabel?: string;
    trigger: Snippet;
    children: Snippet;
  } = $props();

  let anchorEl: HTMLElement | null = $state(null);
  let dropdownEl: HTMLElement | null = $state(null);
  let returnFocusTo: HTMLElement | null = null;
  const token = {};

  $effect(() => {
    returnFocusTo = trackOverlayFocus(open, dropdownEl, returnFocusTo);
  });

  $effect(() => {
    if (open) return pushOverlay(token);
  });

  function handleOutside(e: MouseEvent) {
    if (!open) return;
    if (anchorEl?.contains(e.target as Node)) return;
    if (dropdownEl?.contains(e.target as Node)) return;
    open = false;
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key !== 'Escape' || !open || e.defaultPrevented || !isTopOverlay(token)) return;
    e.preventDefault();
    open = false;
  }
</script>

<svelte:document onclick={handleOutside} onkeydown={handleKey} />

<div class="popover-root" bind:this={anchorEl}>
  {@render trigger()}
  {#if open}
    <div
      class="popover-dropdown popover-{align}"
      style={width ? `width:${width}px` : ''}
      bind:this={dropdownEl}
      role={ariaLabel ? 'dialog' : undefined}
      aria-label={ariaLabel}
      tabindex="-1"
    >
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .popover-root {
    position: relative;
    display: inline-flex;
  }
  .popover-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    z-index: var(--z-popover);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    min-width: 160px;
  }
  .popover-start {
    left: 0;
  }
  .popover-end {
    right: 0;
  }
</style>
