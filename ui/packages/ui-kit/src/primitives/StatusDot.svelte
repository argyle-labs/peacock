<script lang="ts">
  let { ok, degraded = false }: { ok: boolean | null; degraded?: boolean } = $props();
</script>

<span
  class="dot {degraded ? 'degraded' : ok === true ? 'ok' : ok === false ? 'fail' : 'unknown'}"
  aria-hidden="true">●</span
>

<style>
  .dot {
    font-size: 0.6rem;
    flex-shrink: 0;
    line-height: 1;
  }
  .ok {
    color: var(--color-success);
  }
  .fail {
    color: var(--color-error);
  }
  .degraded {
    color: var(--color-warning);
  }
  .unknown {
    color: var(--color-text-faint);
  }
</style>
