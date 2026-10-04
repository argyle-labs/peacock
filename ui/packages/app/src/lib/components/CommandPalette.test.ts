import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRawSnippet, tick } from 'svelte';
import { Drawer } from '@peacock/ui-kit';

import CommandPalette from './CommandPalette.svelte';
import { openCommandPalette, closeCommandPalette } from '$lib/stores/commandPalette.svelte';

afterEach(() => {
  closeCommandPalette();
});

describe('CommandPalette over an open Drawer', () => {
  it('keeps Tab and Escape away from the Drawer underneath', async () => {
    const onclose = vi.fn();
    render(Drawer, {
      props: {
        open: true,
        title: 'Underneath',
        onclose,
        children: createRawSnippet(() => ({ render: () => '<button>in drawer</button>' })),
      },
    });
    await tick();
    render(CommandPalette);
    openCommandPalette();
    await tick();
    await tick();

    const input = screen.getByPlaceholderText('Search pages…');
    input.focus();
    await fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(input);

    await fireEvent.keyDown(window, { key: 'Escape' });
    expect(onclose).not.toHaveBeenCalled();
  });
});
