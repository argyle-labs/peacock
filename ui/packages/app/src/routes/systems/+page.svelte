<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    SectionHead,
    DataTable,
    Badge,
    Button,
    Drawer,
    Popover,
    StatusDot,
  } from '@peacock/ui-kit';
  import { systemList, systemHealth, systemInfoDetail } from '$lib/client/sdk.gen';
  import { unwrap, peerHeader } from '$lib/stores/runTool';
  import { toast } from '$lib/stores/notifications';
  import { createPoller } from '$lib/utils/polling';
  import { relTime, fmtUptime, fmtMb, fmtGb } from '$lib/utils/format';
  import { tableColumns, type Column } from '$lib/pages/descriptor';
  import { candidateSpecs, offerSpecs, staleReasonLabels } from '$lib/pages/systemsCellSpecs';
  import type {
    MeshInstance,
    MeshCandidate,
    MeshStaleRow,
    MeshInboundOffer,
    MeshHealthRow,
    MeshHealthReport,
    MeshInstancesOutput,
    SystemInfoReport,
  } from '$lib/client/types.gen';

  let members = $state<MeshInstance[]>([]);
  let candidates = $state<MeshCandidate[]>([]);
  let stale = $state<MeshStaleRow[]>([]);
  let inboundOffers = $state<MeshInboundOffer[]>([]);
  let health = $state<Map<string, MeshHealthRow>>(new Map());
  let loading = $state(true);
  let error = $state<string | null>(null);
  let drawerOpen = $state(false);
  let openRoutePopover = $state<Record<string, boolean>>({});

  // Hardware drawer — fetched on open, never on page load/poll: a fat
  // `system.info.detail` probe per row, every 10s, across every system
  // would be an unacceptable request fan-out for data an operator may
  // never look at.
  let hwOpen = $state(false);
  let hwLoading = $state(false);
  let hwError = $state<string | null>(null);
  let hwReport = $state<SystemInfoReport | null>(null);
  let hwLabel = $state('');

  // Local member row has no roster id (health rows key it as ""); every
  // paired peer joins on `id`, falling back to `peer_id` for shape drift.
  function healthRowFor(m: MeshInstance): MeshHealthRow | undefined {
    return health.get(m.role === 'local' ? '' : m.id) ?? health.get(m.peer_id);
  }

  // orca-side gap: the roster's own `health` field reports "unknown" for the
  // local system (it never self-probes) even though `system.health` returns
  // a full, trustworthy `HealthReport` for that same machine in the same
  // call — measured: local member had `health: 'unknown'` while its health
  // report showed `healthy: true`, `daemon.running: true`. Prefer the real
  // report when one is joined; fall back to the roster string only when
  // there's no report to derive from (a genuine unknown stays unknown).
  function displayHealth(m: MeshInstance): string {
    const h = healthRowFor(m)?.health;
    if (!h) return m.health;
    return h.healthy || h.daemon?.running ? 'up' : 'down';
  }

  const memberRows = $derived(members.map(m => ({ ...m, health: displayHealth(m) })));

  function statusOk(v: string): boolean | null {
    if (v === 'up') return true;
    if (v === 'down') return false;
    return null;
  }

  // `last_checked` is epoch MILLISECONDS (measured) — surfaced as a tooltip
  // on the Health cell, since it answers "how current is this status?", not
  // "how current is this machine's name?". `relTime`'s implausible-value
  // guard still applies so a bad value renders as an explicit flag, not a
  // confident-looking wrong answer.
  function lastCheckedTitle(m: MeshInstance): string {
    const r = relTime(m.last_checked, 'ms');
    return `last checked ${r.text}`;
  }

  // No documented beacon cadence from orca — the page's own poller runs
  // every 10s, so this window is a conservative multiple of that (one or
  // two skipped beacons shouldn't flip a row to "offline"). This is a guess,
  // not a measured interval; tighten it once the real cadence is known.
  const LIVENESS_WINDOW_MS = 60_000;

  // `last_seen_at` is `null` for `departed` rows (they were never seen, they
  // left) — that must render as genuinely unknown, not "offline". For an
  // `orphan` row a fresh beacon is still a real, current sighting of that
  // system — this is what lets hemlock/bragi show "up" despite orca's
  // roster not counting them as active members.
  function liveness(lastSeenAtSecs: number | null | undefined): boolean | null {
    if (lastSeenAtSecs == null) return null;
    return Date.now() - lastSeenAtSecs * 1000 <= LIVENESS_WINDOW_MS;
  }

  // Tooltip for a `stale[]` row's Health cell: unlike `last_checked`
  // (members, milliseconds), `last_seen_at` is epoch SECONDS — kept on its
  // own path through `relTime` so the two units never touch. `reason` is
  // folded in here as context, not as a column that would partition rows.
  function staleHealthTitle(s: MeshStaleRow): string {
    const r = relTime(s.last_seen_at, 's');
    const reason = staleReasonLabels[s.reason] ?? s.reason;
    return `${reason} · last seen ${r.text}`;
  }

  // `origin` is the strongest signal for the route actually in use (it's the
  // `addr:port` the peer connection is live on); for the synthetic local row
  // the daemon can't know how the browser reached it and emits `""`, so the
  // browser's own `window.location.origin` is the documented substitute.
  function currentRoute(m: MeshInstance): string {
    if (m.origin) return m.origin;
    if (m.role === 'local' && typeof window !== 'undefined') return window.location.origin;
    return '—';
  }

  // `reachable_addrs` is the candidate set; `addresses` carries a human
  // `kind_label` per address value. Match by value (allowing for a bare host
  // in `addresses` vs. a `host:port` reachable addr) so the popover can name
  // each route instead of listing bare strings.
  function reachableRouteList(m: MeshInstance): { label: string; value: string }[] {
    return m.reachable_addrs.map(addr => {
      const match = m.addresses.find(a => a.value === addr || addr.startsWith(`${a.value}:`));
      return { label: match?.kind_label ?? 'address', value: addr };
    });
  }

  // The universal peer-dispatch header — `undefined` routes to the local
  // daemon (loopback), any other id proxies the call over the mesh.
  function peerIdFor(r: UnifiedRow): string {
    return r.kind === 'member' ? (r.m.role === 'local' ? 'local' : r.m.peer_id) : r.s.peer_id;
  }

  function hostnameOf(r: UnifiedRow): string {
    return r.kind === 'member' ? r.m.label || r.m.origin || r.m.id : r.s.hostname;
  }

  async function openHardware(r: UnifiedRow) {
    hwOpen = true;
    hwLoading = true;
    hwError = null;
    hwReport = null;
    hwLabel = hostnameOf(r);
    try {
      const out = await unwrap(systemInfoDetail({ body: {}, headers: peerHeader(peerIdFor(r)) }));
      hwReport = out.host;
    } catch (e) {
      hwError = e instanceof Error ? e.message : String(e);
    } finally {
      hwLoading = false;
    }
  }

  // `system.list`'s 200 response is a 3-way union and `MeshSnapshotOutput`
  // ALSO carries `candidates`/`inbound_offers`/`members`/`stale` — it is a
  // superset of `MeshInstancesOutput` — so `'candidates' in v` alone only
  // rules out `MeshListOutput`. The only fields unique to `MeshSnapshotOutput`
  // are the required (non-optional) `cluster_membership` and `clusters`; their
  // absence, combined with the presence of every `MeshInstancesOutput` field,
  // is what actually discriminates the two. This still isn't a type-level
  // guarantee — nothing stops a future response from carrying an odd mix of
  // fields — it's the backend CONTRACT (`{ instances: true }` on the request
  // is documented to return exactly `MeshInstancesOutput`) that guarantees
  // the shape; this guard only verifies that contract held for this reply,
  // and anything else must throw rather than be coerced.
  function isInstancesOutput(v: unknown): v is MeshInstancesOutput {
    return (
      !!v &&
      typeof v === 'object' &&
      'candidates' in v &&
      'members' in v &&
      'stale' in v &&
      'inbound_offers' in v &&
      !('cluster_membership' in v) &&
      !('clusters' in v)
    );
  }

  // `system.health`'s 200 response is untagged `MeshHealthReport | HealthReport`.
  // `systems` is a required field unique to `MeshHealthReport` — a bare
  // `HealthReport` (one system's own probe) never carries it — so its
  // presence is a sound discriminant between the two.
  function isHealthReport(v: unknown): v is MeshHealthReport {
    return !!v && typeof v === 'object' && 'systems' in v;
  }

  async function refresh() {
    try {
      const [inst, hr] = await Promise.all([
        unwrap(systemList({ body: { instances: true } })),
        unwrap(systemHealth({ body: {} })),
      ]);
      if (!isInstancesOutput(inst)) throw new Error('unexpected system.list response shape');
      if (!isHealthReport(hr)) throw new Error('unexpected system.health response shape');
      members = inst.members;
      candidates = inst.candidates;
      stale = inst.stale;
      inboundOffers = inst.inbound_offers;
      health = new Map(hr.systems.map(r => [r.id, r]));
      error = null;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      toast.error(`systems: ${error}`);
    } finally {
      loading = false;
    }
  }

  // ONE table of every system orca knows about — a `stale[]` row (e.g.
  // hemlock, bragi: paired systems orca's discovery view currently disagrees
  // with its roster about, see the orca-side gap below) is still a system,
  // not a lesser category, so it's a row here rather than a separate section.
  type UnifiedRow =
    { kind: 'member'; m: (typeof memberRows)[number] } | { kind: 'stale'; s: MeshStaleRow };

  // Own system first; everything else keeps the order the API returned it
  // in. Never sorted by health/liveness — that would make rows jump between
  // polls, which is worse than any particular order.
  const unifiedRows = $derived(
    (
      [
        ...memberRows.map(m => ({ kind: 'member' as const, m })),
        ...stale.map(s => ({ kind: 'stale' as const, s })),
      ] satisfies UnifiedRow[]
    ).sort((a, b) => {
      const aLocal = a.kind === 'member' && a.m.role === 'local';
      const bLocal = b.kind === 'member' && b.m.role === 'local';
      return aLocal === bLocal ? 0 : aLocal ? -1 : 1;
    }),
  );

  // Candidates and inbound offers live in a drawer, not the page body — the
  // trigger's badge is the only reason to open it, so it must count both
  // without the operator opening the drawer first.
  const drawerCount = $derived(candidates.length + inboundOffers.length);

  const poller = createPoller({ fn: refresh, intervalMs: 10000 });
  onMount(poller.start);
  onDestroy(poller.stop);
</script>

<svelte:head><title>systems · orca</title></svelte:head>

{#snippet hostnameCell(r: UnifiedRow)}
  <!-- Escape hatch: a composite of fallback fields plus a conditional error
       line for members, or the plain hostname for a `stale[]` row — the two
       source shapes don't share a field name a `CellSpec` could target. The
       name itself is the hardware-drawer trigger, so clicking any row
       opens its `system.info.detail` probe. -->
  <button type="button" class="hostname-trigger" onclick={() => openHardware(r)}>
    {hostnameOf(r)}
  </button>
  {#if r.kind === 'member'}
    {#if r.m.role === 'local'}
      <span class="this-system" title="this system">(this system)</span>
    {/if}
    {#if r.m.error}
      <br /><span class="dim-error" title={r.m.error}>⚠ {r.m.error}</span>
    {/if}
  {/if}
{/snippet}

{#snippet routeCell(r: UnifiedRow)}
  <!-- Escape hatch: `stale[]` rows only ever have one address (`addr:port`);
       members get the live route plus a popover over every reachable one. -->
  {#if r.kind === 'stale'}
    <span class="mono">{r.s.addr}:{r.s.port}</span>
  {:else}
    {@const m = r.m}
    {@const current = currentRoute(m)}
    {@const routes = reachableRouteList(m)}
    {@const mismatch = routes.length === 0 || !routes.some(x => x.value === current)}
    <Popover align="start" width={260} bind:open={openRoutePopover[m.id]}>
      {#snippet trigger()}
        <button
          type="button"
          class="route-trigger"
          onclick={() => (openRoutePopover[m.id] = !openRoutePopover[m.id])}
        >
          <span class="mono">{current}</span>
          {#if mismatch}
            <span class="route-warn" title="current route not confirmed in the reachable set"
              >⚠</span
            >
          {/if}
        </button>
      {/snippet}
      {#snippet children()}
        <div class="route-list">
          {#if routes.length === 0}
            <p class="dim route-note">No reachable routes reported</p>
          {:else}
            {#each routes as route (route.value)}
              <div class="route-row">
                <span class="dim">{route.label}</span>
                <span class="mono">{route.value}</span>
              </div>
            {/each}
          {/if}
        </div>
      {/snippet}
    </Popover>
  {/if}
{/snippet}

{#snippet versionCell(r: UnifiedRow)}
  {#if r.kind === 'member'}
    {r.m.version ?? '—'}
  {:else}
    <span class="dim">—</span>
  {/if}
{/snippet}

{#snippet daemonCell(r: UnifiedRow)}
  <!-- Escape hatch: joins against `health`. `stale[]` rows carry no probe. -->
  {#if r.kind === 'stale'}
    <span class="dim">—</span>
  {:else}
    {@const hr = healthRowFor(r.m)}
    {#if hr?.error}
      <span title={hr.error}><Badge tone="error">probe error</Badge></span>
    {:else if hr?.health?.daemon}
      <Badge tone={hr.health.daemon.running ? 'success' : 'error'}>
        {hr.health.daemon.running ? 'running' : 'stopped'}
      </Badge>
    {:else}
      <Badge tone="neutral">unknown</Badge>
    {/if}
  {/if}
{/snippet}

{#snippet uptimeCell(r: UnifiedRow)}
  <!-- `uptime_seconds` is a DURATION, not a timestamp — `fmtUptime`, never
       `relTime`'s implausible-timestamp guard, which only applies to epoch
       values. No probe (incl. every `stale[]` row) is explicit "unknown". -->
  {#if r.kind === 'stale'}
    <span class="dim">—</span>
  {:else}
    {@const hr = healthRowFor(r.m)}
    {#if hr?.health?.daemon?.uptime_seconds != null}
      {fmtUptime(hr.health.daemon.uptime_seconds)}
    {:else}
      <span class="dim">—</span>
    {/if}
  {/if}
{/snippet}

{#snippet healthCell(r: UnifiedRow)}
  <!-- Escape hatch: same `StatusDot` + label a `status` `CellSpec` renders,
       plus a last-checked/last-seen tooltip — "how current is this
       reading" belongs on the value it describes, not the hostname. Members
       use `last_checked` (ms); `stale[]` rows use `last_seen_at` (s) with
       `reason` folded in as context — the two units never cross paths. -->
  {#if r.kind === 'member'}
    <span title={lastCheckedTitle(r.m)}>
      <StatusDot ok={statusOk(r.m.health)} />
      {r.m.health}
    </span>
  {:else}
    {@const live = liveness(r.s.last_seen_at)}
    <span title={staleHealthTitle(r.s)}>
      <StatusDot ok={live} />
      {live === true ? 'up' : live === false ? 'down' : 'unknown'}
    </span>
  {/if}
{/snippet}

<div class="page">
  <div class="page-header">
    <Button variant="secondary" onclick={() => (drawerOpen = true)}>
      Candidates &amp; offers
      {#if drawerCount > 0}
        <Badge tone="accent">{drawerCount}</Badge>
      {/if}
    </Button>
  </div>

  {#if error}
    <p class="banner-error">Failed to refresh systems: {error}</p>
  {/if}

  <section>
    <DataTable
      columns={tableColumns([
        { key: 'hostname', label: 'Hostname', cell: hostnameCell },
        { key: 'route', label: 'Route', cell: routeCell },
        { key: 'version', label: 'Version', width: '90px', cell: versionCell },
        { key: 'daemon', label: 'Daemon', width: '110px', cell: daemonCell },
        { key: 'uptime', label: 'Uptime', width: '80px', cell: uptimeCell },
        { key: 'health', label: 'Health', width: '90px', cell: healthCell },
      ] satisfies Column<UnifiedRow>[])}
      rows={unifiedRows}
      {loading}
      emptyText="No known systems"
    />
  </section>
</div>

<Drawer
  open={drawerOpen}
  title="Candidates & offers"
  width="min(560px, 90vw)"
  onclose={() => (drawerOpen = false)}
  ariaLabel="Candidates and inbound offers"
>
  <div class="drawer-body">
    <section>
      <SectionHead title="Candidates" />
      <DataTable
        columns={tableColumns([
          { key: 'hostname', label: 'Hostname', spec: candidateSpecs.hostname },
          { key: 'addr', label: 'Address', spec: candidateSpecs.addr },
          { key: 'invite', label: 'Can invite', width: '100px', spec: candidateSpecs.invite },
          { key: 'fp', label: 'Pubkey', spec: candidateSpecs.fp },
        ] satisfies Column<MeshCandidate>[])}
        rows={candidates}
        {loading}
        emptyText="No discovered candidates"
      />
    </section>

    <section>
      <SectionHead title="Inbound offers" />
      <DataTable
        columns={tableColumns([
          { key: 'hostname', label: 'Hostname', spec: offerSpecs.hostname },
          { key: 'addr', label: 'Address', spec: offerSpecs.addr },
          { key: 'inviter', label: 'Inviter', spec: offerSpecs.inviter },
          { key: 'ttl', label: 'Expires in', width: '100px', spec: offerSpecs.ttl },
        ] satisfies Column<MeshInboundOffer>[])}
        rows={inboundOffers}
        {loading}
        emptyText="No inbound offers"
      />
    </section>
  </div>
</Drawer>

<Drawer
  open={hwOpen}
  title={hwLabel ? `Hardware · ${hwLabel}` : 'Hardware'}
  width="min(480px, 90vw)"
  onclose={() => (hwOpen = false)}
  ariaLabel="System hardware detail"
>
  <div class="drawer-body hw-body">
    {#if hwLoading}
      <p class="dim">Loading hardware detail…</p>
    {:else if hwError}
      <p class="banner-error">Failed to load hardware detail: {hwError}</p>
    {:else if hwReport}
      {@const r = hwReport}
      <section>
        <SectionHead title="Machine" />
        <div class="hw-grid">
          <span class="dim">Vendor / model</span>
          <span>{r.dmi_vendor ?? '—'} {r.dmi_product ?? ''}</span>
          <span class="dim">OS</span>
          <span>{r.os_name ?? r.distro ?? '—'} {r.os_version ?? ''}</span>
          <span class="dim">Kernel / arch</span>
          <span>{r.kernel_version ?? '—'} / {r.arch ?? '—'}</span>
          <span class="dim">Type</span>
          <span>{r.system_type_label ?? '—'}</span>
          <span class="dim">Virtualization</span>
          <span>{r.virtualization ?? '—'}</span>
          <span class="dim">Uptime</span>
          <span>{fmtUptime(r.system_uptime_secs)}</span>
        </div>
      </section>

      <section>
        <SectionHead title="CPU" />
        <div class="hw-grid">
          <span class="dim">Model</span>
          <span>{r.cpu_model ?? '—'}</span>
          <span class="dim">Cores</span>
          <span>{r.cpu_physical ?? '—'} physical / {r.cpu_logical ?? '—'} logical</span>
          <span class="dim">Usage</span>
          <!-- `cpu_usage_percent` is always `None` on the first snapshot
               (needs two sysinfo refreshes) — that's unknown, not 0%. -->
          <span
            >{r.cpu_usage_percent != null ? `${r.cpu_usage_percent.toFixed(0)}%` : 'unknown'}</span
          >
        </div>
      </section>

      <section>
        <SectionHead title="Memory" />
        <div class="hw-grid">
          <span class="dim">Used / total</span>
          <span>{fmtMb(r.mem_used_mb)} / {fmtMb(r.mem_total_mb)}</span>
          <span class="dim">Available</span>
          <span>{fmtMb(r.mem_available_mb)}</span>
          <span class="dim">Usage</span>
          <span>{r.mem_percent != null ? `${r.mem_percent.toFixed(0)}%` : '—'}</span>
          <span class="dim">Swap used / total</span>
          <span>{fmtMb(r.swap_used_mb)} / {fmtMb(r.swap_total_mb)}</span>
        </div>
      </section>

      <section>
        <SectionHead title="GPU" />
        {#if !r.gpus || r.gpus.length === 0}
          <p class="dim">No GPU detected</p>
        {:else}
          {#each r.gpus as gpu (gpu.name)}
            <div class="hw-grid">
              <span class="dim">{gpu.name}</span>
              <span>{gpu.vendor}</span>
              <span class="dim">Utilisation</span>
              <!-- `driver_status` explains an absent reading: `no_driver`/
                   `no_metrics` means unknown, never a measured zero. -->
              <span>
                {gpu.utilization_percent != null
                  ? `${gpu.utilization_percent.toFixed(0)}%`
                  : `unknown (${gpu.driver_status ?? 'no metrics'})`}
              </span>
              <span class="dim">VRAM used / total</span>
              <span>{fmtMb(gpu.vram_used_mb)} / {fmtMb(gpu.vram_total_mb)}</span>
              <span class="dim">Temperature</span>
              <span>{gpu.temperature_c != null ? `${gpu.temperature_c}°C` : '—'}</span>
            </div>
          {/each}
        {/if}
      </section>

      <section>
        <SectionHead title="Network" />
        {#if !r.interfaces || r.interfaces.length === 0}
          <p class="dim">No interfaces reported</p>
        {:else}
          {#each r.interfaces as iface (iface.name)}
            <div class="hw-grid">
              <span class="dim">{iface.name}{iface.loopback ? ' (loopback)' : ''}</span>
              <span class="mono"
                >{[...(iface.ipv4 ?? []), ...(iface.ipv6 ?? [])].join(', ') || '—'}</span
              >
            </div>
          {/each}
        {/if}
      </section>

      <section>
        <SectionHead title="Capabilities" />
        {#if !r.detected_capabilities || r.detected_capabilities.length === 0}
          <p class="dim">None detected</p>
        {:else}
          <div class="hw-capabilities">
            {#each r.detected_capabilities as cap, i (cap)}
              <Badge tone="neutral">{r.capability_labels?.[i] ?? cap}</Badge>
            {/each}
          </div>
        {/if}
      </section>

      <section>
        <SectionHead title="Storage (orca filesystem only)" />
        <!-- `SystemInfoReport` carries no per-disk/per-mount list and no
             shares — those live in the separate storage domain
             (`storage.list`, `storage.share.list`, `storage.mount.list`),
             not this report. Saying so here rather than implying this is
             the whole picture. -->
        <div class="hw-grid">
          <span class="dim">orca dir</span>
          <span class="mono">{r.orca_dir ?? '—'}</span>
          <span class="dim">Free / total</span>
          <span>
            {r.orca_fs_avail_gb != null ? fmtGb(r.orca_fs_avail_gb) : '—'} / {r.orca_fs_total_gb !=
            null
              ? fmtGb(r.orca_fs_total_gb)
              : '—'}
          </span>
        </div>
        <p class="dim hw-note">
          This is headroom on the filesystem hosting <code>~/.orca</code>, not the system's disks or
          shares — orca has no per-disk/mount/share inventory on this endpoint.
        </p>
      </section>
    {/if}
  </div>
</Drawer>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  .page-header {
    display: flex;
    justify-content: flex-end;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .drawer-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    padding: 0 var(--space-4) var(--space-4);
    overflow-y: auto;
  }
  .banner-error {
    background: color-mix(in srgb, var(--color-error) 15%, transparent);
    border: 1px solid var(--color-error);
    color: var(--color-error);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    margin: 0;
  }
  .dim {
    color: var(--color-text-dim);
    font-size: var(--text-xs);
  }
  .dim-error {
    color: var(--color-error);
    font-size: var(--text-xs);
  }
  .this-system {
    color: var(--color-text-dim);
    font-size: var(--text-xs);
  }
  .route-trigger {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--color-text);
  }
  .route-warn {
    color: var(--color-warning);
    font-size: var(--text-xs);
  }
  .route-list {
    padding: var(--space-2) var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .route-row {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    font-size: var(--text-xs);
  }
  .route-note {
    margin: 0;
  }
  .hostname-trigger {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--color-text);
    font-size: inherit;
    font-family: inherit;
    text-decoration: underline;
    text-decoration-color: transparent;
  }
  .hostname-trigger:hover {
    text-decoration-color: var(--color-text-dim);
  }
  .hw-grid {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: var(--space-1) var(--space-3);
    font-size: var(--text-sm);
    margin-bottom: var(--space-2);
  }
  .hw-capabilities {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }
  .hw-note {
    margin: var(--space-2) 0 0;
  }
</style>
