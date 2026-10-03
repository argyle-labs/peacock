<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Tone } from '../types';

  type NamedColor =
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'teal'
    | 'cyan'
    | 'blue'
    | 'indigo'
    | 'purple'
    | 'pink'
    | 'gray'
    | 'accent';

  interface Props {
    /** Semantic intent — the DEFAULT, preferred prop. Maps to --color-{success,warning,error,info}
        or --color-accent. Use this unless the meaning genuinely is "this specific colour". */
    tone?: Tone;
    /** Named-colour escape hatch, from the full ramp (src/tokens/tokens.css). Use only when the
        meaning is a specific colour rather than a state. Accepts the legacy color names
        (green/yellow/red/blue/gray/purple/accent) for backward compatibility.
        Precedence: if both `tone` and `color` are passed, `color` wins — an explicit escape
        hatch should beat a default. */
    color?: NamedColor;
    children: Snippet;
  }
  let { tone = 'neutral', color, children }: Props = $props();

  const tones: Record<Tone, string> = {
    neutral: 'var(--color-text-dim)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
    info: 'var(--color-info)',
    accent: 'var(--color-accent)',
  };
  const namedColors: Record<NamedColor, string> = {
    red: 'var(--color-red)',
    orange: 'var(--color-orange)',
    yellow: 'var(--color-yellow)',
    green: 'var(--color-green)',
    teal: 'var(--color-teal)',
    cyan: 'var(--color-cyan)',
    blue: 'var(--color-blue)',
    indigo: 'var(--color-indigo)',
    purple: 'var(--color-purple)',
    pink: 'var(--color-pink)',
    gray: 'var(--color-gray)',
    accent: 'var(--color-accent)',
  };

  // `color` (escape hatch) wins over `tone` (default) when both are given.
  const resolved = $derived(color !== undefined ? namedColors[color] : tones[tone]);
</script>

<span class="badge" style="--badge-color: {resolved}">
  {@render children()}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 1px var(--space-2);
    border-radius: 100px;
    font-size: var(--text-xs);
    font-weight: 500;
    border: 1px solid color-mix(in srgb, var(--badge-color) 40%, transparent);
    background: color-mix(in srgb, var(--badge-color) 15%, transparent);
    color: var(--badge-color);
  }
</style>
