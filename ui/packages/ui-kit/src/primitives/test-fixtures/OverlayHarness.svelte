<script lang="ts">
  import Drawer from '../Drawer.svelte';
  import Popover from '../Popover.svelte';

  let drawerOpen = $state(false);
  let popoverOpen = $state(false);
</script>

<button type="button" onclick={() => (drawerOpen = true)}>open drawer</button>
<button type="button">outside</button>

<Drawer open={drawerOpen} title="Harness drawer" onclose={() => (drawerOpen = false)}>
  <Popover bind:open={popoverOpen} ariaLabel="Harness popover">
    {#snippet trigger()}
      <button type="button" onclick={() => (popoverOpen = !popoverOpen)}>open popover</button>
    {/snippet}
    {#snippet children()}
      <button type="button">inside popover</button>
    {/snippet}
  </Popover>
  <button type="button">last in drawer</button>
</Drawer>
