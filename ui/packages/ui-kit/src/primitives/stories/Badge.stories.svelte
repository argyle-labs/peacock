<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Badge from '../Badge.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Badge',
    component: Badge,
    tags: ['autodocs'],
    argTypes: {
      tone: {
        control: 'select',
        options: ['neutral', 'success', 'warning', 'error', 'info', 'accent'],
      },
      color: {
        control: 'select',
        options: [
          undefined,
          'red',
          'orange',
          'yellow',
          'green',
          'teal',
          'cyan',
          'blue',
          'indigo',
          'purple',
          'pink',
          'gray',
          'accent',
        ],
      },
    },
    args: { tone: 'neutral' },
  });
</script>

<Story name="Default">
  {#snippet template({ children: _children, ...args })}
    <Badge {...args}>label</Badge>
  {/snippet}
</Story>

<Story name="Tones (semantic, default path)">
  {#snippet template()}
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
      <Badge tone="neutral">neutral</Badge>
      <Badge tone="success">success</Badge>
      <Badge tone="warning">warning</Badge>
      <Badge tone="error">error</Badge>
      <Badge tone="info">info</Badge>
      <Badge tone="accent">accent</Badge>
    </div>
  {/snippet}
</Story>

<Story name="Named colors (escape hatch)">
  {#snippet template()}
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
      <Badge color="red">red</Badge>
      <Badge color="orange">orange</Badge>
      <Badge color="yellow">yellow</Badge>
      <Badge color="green">green</Badge>
      <Badge color="teal">teal</Badge>
      <Badge color="cyan">cyan</Badge>
      <Badge color="blue">blue</Badge>
      <Badge color="indigo">indigo</Badge>
      <Badge color="purple">purple</Badge>
      <Badge color="pink">pink</Badge>
      <Badge color="gray">gray</Badge>
      <Badge color="accent">accent</Badge>
    </div>
  {/snippet}
</Story>

<Story name="Legacy color names (backward compat)">
  {#snippet template()}
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
      <Badge color="gray">gray</Badge>
      <Badge color="green">up</Badge>
      <Badge color="yellow">degraded</Badge>
      <Badge color="red">down</Badge>
      <Badge color="blue">info</Badge>
      <Badge color="purple">lxc</Badge>
      <Badge color="accent">system</Badge>
    </div>
  {/snippet}
</Story>

<Story name="Precedence: color wins over tone">
  {#snippet template()}
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
      <Badge tone="error" color="teal">tone=error, color=teal → renders teal</Badge>
    </div>
  {/snippet}
</Story>
