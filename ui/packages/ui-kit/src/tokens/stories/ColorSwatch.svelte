<script lang="ts">
  /** Renders one named CSS color token as a swatch, resolving the actual
      computed value from the element it's attached to (so it reflects
      whatever [data-theme][data-mode] ancestor it's nested under). */
  let { token }: { token: string } = $props();

  let el: HTMLElement | undefined;
  let resolved = $state('');

  function measure(node: HTMLElement) {
    el = node;
    resolved = getComputedStyle(node).getPropertyValue(token).trim();
    return {
      destroy() {},
    };
  }
</script>

<div class="swatch" use:measure>
  <div class="chip" style="background: var({token})"></div>
  <code class="name">{token}</code>
  <code class="value">{resolved}</code>
</div>

<style>
  .swatch {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 104px;
  }
  .chip {
    width: 100%;
    height: 48px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
  }
  .name {
    font-size: 10px;
    color: var(--color-text-dim);
  }
  .value {
    font-size: 10px;
    color: var(--color-text-faint);
  }
</style>
