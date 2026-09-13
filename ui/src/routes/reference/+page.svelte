<script lang="ts">
  import { onMount } from 'svelte';

  let container: HTMLDivElement;

  onMount(async () => {
    // Client-only mount: peacock is adapter-static (ssr = false, no server
    // runtime), so Scalar's SvelteKit *server* handler can't run here. Bundle
    // the standalone @scalar/api-reference via Vite instead — self-hosted, no
    // CDN, CSP-safe, works on the LAN offline. Point it at orca's live spec on
    // THIS host via a relative URL, so the reference always reflects the API
    // surface of whatever orca instance peacock is installed under.
    const { createApiReference } = await import('@scalar/api-reference');
    createApiReference(container, {
      url: '/api/openapi.json',
    });
  });
</script>

<svelte:head>
  <title>API Reference — orca</title>
</svelte:head>

<div bind:this={container} class="reference-root"></div>

<style>
  .reference-root {
    height: 100%;
    width: 100%;
    overflow: auto;
  }
</style>
