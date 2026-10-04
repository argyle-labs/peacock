/** Shared open/close focus handoff for overlay primitives (`Drawer`,
 * `Popover`): captures whatever had focus right before the overlay opens,
 * moves focus into the panel, and hands focus back when it closes. */
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
  // Only reclaim focus the overlay still holds (or dropped to <body> when its
  // panel unmounted); if the user already moved focus elsewhere, leave it.
  const active = document.activeElement;
  if (!active || active === document.body || panel?.contains(active)) returnFocusTo?.focus();
  return null;
}

const openOverlays: object[] = [];

/** Registers an open overlay as the topmost; call the returned function when it
 * closes. An Escape handler acts only when `isTopOverlay` and the event is not
 * yet `defaultPrevented`, then calls `preventDefault()`: browsers flush
 * microtasks between listeners, so the stack alone can change mid-dispatch. */
export function pushOverlay(token: object): () => void {
  openOverlays.push(token);
  return () => {
    const i = openOverlays.lastIndexOf(token);
    if (i !== -1) openOverlays.splice(i, 1);
  };
}

export function isTopOverlay(token: object): boolean {
  return openOverlays[openOverlays.length - 1] === token;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keeps Tab / Shift+Tab cycling inside `panel` (a modal focus trap). */
export function trapTab(e: KeyboardEvent, panel: HTMLElement | null | undefined) {
  if (e.key !== 'Tab' || !panel) return;
  const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (items.length === 0) {
    e.preventDefault();
    panel.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  const outside = !(active instanceof Node) || !panel.contains(active) || active === panel;
  if (e.shiftKey && (outside || active === first)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (outside || active === last)) {
    e.preventDefault();
    first.focus();
  }
}
