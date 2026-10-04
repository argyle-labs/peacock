/** Shared open/close focus handoff for overlay primitives (`Drawer`,
 * `Popover`): captures whatever had focus right before the overlay opens,
 * moves focus into the panel, and hands focus back to that trigger when the
 * overlay closes. Neither primitive traps focus — Tab can still leave the
 * panel while it's open; this only owns the open/close handoff. */
export function trackOverlayFocus(
  open: boolean,
  panel: HTMLElement | null | undefined,
  returnFocusTo: HTMLElement | null,
): HTMLElement | null {
  if (open) {
    const trigger =
      document.activeElement instanceof HTMLElement ? document.activeElement : returnFocusTo;
    panel?.focus();
    return trigger;
  }
  returnFocusTo?.focus();
  return null;
}
