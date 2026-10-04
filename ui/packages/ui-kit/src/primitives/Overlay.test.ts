import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import { tick } from 'svelte';
import OverlayHarness from './test-fixtures/OverlayHarness.svelte';

async function openDrawer() {
  const trigger = screen.getByRole('button', { name: 'open drawer' });
  trigger.focus();
  await fireEvent.click(trigger);
  await tick();
  return trigger;
}

function drawerPanel() {
  return document.querySelector('.drawer') as HTMLElement;
}

describe('Drawer + Popover overlays', () => {
  it('labels the drawer as a modal dialog by its heading', async () => {
    render(OverlayHarness);
    await openDrawer();
    const panel = drawerPanel();
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel).toHaveAttribute('aria-modal', 'true');
    const heading = document.getElementById(panel.getAttribute('aria-labelledby') ?? '');
    expect(heading).toHaveTextContent('Harness drawer');
  });

  it('keeps the backdrop out of the tab order', () => {
    render(OverlayHarness);
    expect(screen.getByLabelText('Close drawer')).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus into the drawer on open and restores it to the trigger on Escape', async () => {
    render(OverlayHarness);
    const trigger = await openDrawer();
    expect(document.activeElement).toBe(drawerPanel());
    await fireEvent.keyDown(window, { key: 'Escape' });
    await tick();
    expect(drawerPanel()).not.toHaveClass('open');
    expect(document.activeElement).toBe(trigger);
  });

  it('does not steal focus back if it already moved outside the panel', async () => {
    render(OverlayHarness);
    await openDrawer();
    const outside = screen.getByRole('button', { name: 'outside' });
    outside.focus();
    await fireEvent.keyDown(window, { key: 'Escape' });
    await tick();
    expect(document.activeElement).toBe(outside);
  });

  it('Escape closes only the topmost overlay', async () => {
    render(OverlayHarness);
    await openDrawer();
    await fireEvent.click(screen.getByRole('button', { name: 'open popover' }));
    await tick();
    expect(screen.getByRole('dialog', { name: 'Harness popover' })).toBeInTheDocument();

    await fireEvent.keyDown(document, { key: 'Escape' });
    await tick();
    expect(screen.queryByRole('dialog', { name: 'Harness popover' })).toBeNull();
    expect(drawerPanel()).toHaveClass('open');

    await fireEvent.keyDown(document, { key: 'Escape' });
    await tick();
    expect(drawerPanel()).not.toHaveClass('open');
  });

  it('traps Tab inside the open drawer', async () => {
    render(OverlayHarness);
    await openDrawer();
    const close = screen.getByRole('button', { name: 'Close' });
    const last = screen.getByRole('button', { name: 'last in drawer' });

    last.focus();
    await fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(close);

    close.focus();
    await fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});
