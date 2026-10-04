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
  let healthRosterError = $state<string | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let drawerOpen = $state(false);
  let openRoutePopover = $state<Record<string, boolean>>({});

  // Fetched on open only: a full `system.info.detail` probe per row on every
  // poll would fan out requests for data an operator rarely opens.
  let hwOpen = $state(false);
  let hwLoading = $state(false);
  let hwError = $state<string | null>(null);
  let hwReport = $state<SystemInfoReport | null>(null);
  let hwLabel = $state('');
  let hwRowKey = $state<string | null>(null);
  let hwSeq = 0;
  let hwAbort: AbortController | null = null;

  // orca's default disk warn threshold (`DEFAULT_DISK_WARN_PCT`).
  const DISK_WARN_PCT = 85;

  type HealthView = {
    label: string;
    ok: boolean | null;
    degraded: boolean;
    title?: string;
  };

  type MemberRow = { kind: 'member'; key: string; m: MeshInstance };
  type StaleRow = { kind: 'stale'; key: string; s: MeshStaleRow; selfIdentity: boolean };
  type UnifiedRow = MemberRow | StaleRow;

  // Every `system.health` row is keyed by peer id; the local row's machine id
  // is its peer id.
  function healthRowFor(m: MeshInstance): MeshHealthRow | undefined {
    return health.get(m.peer_id);
  }

  // The roster's `health` is "up" for every active remote and "unknown" for the
  // local system regardless of any probe (orca#701), so without a probe the
  // state is unknown. orca sets `healthy` to `daemon.running`.
  function memberHealth(m: MeshInstance): HealthView {
    const row = healthRowFor(m);
    if (row?.error) {
      return { label: 'unreachable', ok: false, degraded: false, title: row.error };
    }
    const h = row?.health;
    if (!h) return { label: 'unknown', ok: null, degraded: false, title: 'no health probe' };
    const checked = `checked ${relTime(h.checkedAtMs, 'ms').text}`;
    if (!h.healthy) {
      return {
        label: 'down',
        ok: false,
        degraded: false,
        title: `daemon not running · ${checked}`,
      };
    }
    const reasons: string[] = [];
    if (h.disk && h.disk.usedPct >= DISK_WARN_PCT) {
      reasons.push(`disk ${h.disk.usedPct}% used on ${h.disk.path}`);
    }
    return {
      label: reasons.length ? 'degraded' : 'up',
      ok: true,
      degraded: reasons.length > 0,
      title: [...reasons, checked].join(' · '),
    };
  }

  // No documented beacon cadence from orca; a multiple of the 10s poll so one
  // or two skipped beacons don't flip a row to "down".
  const LIVENESS_WINDOW_MS = 60_000;

  // `last_seen_at` is epoch seconds, `null` for `departed` rows (unknown).
  function liveness(lastSeenAtSecs: number | null | undefined): boolean | null {
    if (lastSeenAtSecs == null || !relTime(lastSeenAtSecs, 's').ok) return null;
    return Date.now() - lastSeenAtSecs * 1000 <= LIVENESS_WINDOW_MS;
  }

  function staleHealth(r: StaleRow): HealthView {
    const reason = staleReasonLabels[r.s.reason] ?? r.s.reason;
    const title = `${reason} · last seen ${relTime(r.s.last_seen_at, 's').text}`;
    // A beacon from this machine's former identity is this machine, so its
    // liveness says nothing about that identity.
    if (r.selfIdentity) return { label: 'retired', ok: null, degraded: false, title };
    const live = liveness(r.s.last_seen_at);
    const label = live === true ? 'up' : live === false ? 'down' : 'unknown';
    return { label, ok: live, degraded: false, title };
  }

  function rowHealth(r: UnifiedRow): HealthView {
    return r.kind === 'member' ? memberHealth(r.m) : staleHealth(r);
  }

  function normalizeRoute(v: string): string {
    return v
      .trim()
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
  }

  // Bare host of `host:port`, `[v6]:port`, `[v6]`, or a bare v4/v6 address.
  function hostOf(addr: string): string {
    if (addr.startsWith('[')) return addr.slice(1, addr.indexOf(']'));
    const parts = addr.split(':');
    return parts.length === 2 ? parts[0] : addr;
  }

  const LOOPBACK = /^(localhost|127(\.\d{1,3}){3}|\[::1\])(:\d+)?$/;

  // The local row's `origin` is "" (the daemon can't see how the browser
  // reached it), so the browser's own host stands in.
  function currentRoute(m: MeshInstance): string {
    if (m.origin) return normalizeRoute(m.origin);
    if (m.role === 'local' && typeof window !== 'undefined') return window.location.host;
    return '';
  }

  function reachableRouteList(m: MeshInstance): { label: string; value: string }[] {
    return m.reachable_addrs
      .map(normalizeRoute)
      .filter(Boolean)
      .map(addr => {
        const host = hostOf(addr);
        const match = m.addresses.find(a => hostOf(a.value.toLowerCase()) === host);
        return { label: match?.kind_label ?? 'address', value: addr };
      });
  }

  // A loopback route to the local row is the browser sitting on that machine,
  // which `reachable_addrs` (LAN only) never lists.
  function routeConfirmed(m: MeshInstance, current: string, routes: { value: string }[]): boolean {
    if (!current) return true;
    if (m.role === 'local' && LOOPBACK.test(current)) return true;
    return routes.some(x => x.value === current);
  }

  function hostnameOf(r: UnifiedRow): string {
    return r.kind === 'member' ? r.m.label || r.m.origin || r.m.id : r.s.hostname;
  }

  async function openHardware(r: MemberRow) {
    const seq = ++hwSeq;
    hwAbort?.abort();
    const ctrl = new AbortController();
    hwAbort = ctrl;
    hwOpen = true;
    hwLoading = true;
    hwError = null;
    hwReport = null;
    hwLabel = hostnameOf(r);
    hwRowKey = r.key;
    try {
      const out = await unwrap(
        systemInfoDetail({
          body: {},
          headers: peerHeader(r.m.role === 'local' ? 'local' : r.m.peer_id),
          signal: ctrl.signal,
        }),
      );
      if (seq === hwSeq) hwReport = out.host;
    } catch (e) {
      if (seq === hwSeq) hwError = e instanceof Error ? e.message : String(e);
    } finally {
      if (seq === hwSeq) hwLoading = false;
    }
  }

  function closeHardware() {
    hwSeq++;
    hwAbort?.abort();
    hwAbort = null;
    hwOpen = false;
    hwLoading = false;
    hwRowKey = null;
  }

  // `system.list` returns a 3-way union; `MeshSnapshotOutput` is a superset of
  // `MeshInstancesOutput`, so its required `cluster_membership`/`clusters` must
  // be absent too. Anything else throws rather than being coerced.
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

  // `system.health` returns untagged `MeshHealthReport | HealthReport`;
  // only `MeshHealthReport` carries `systems`.
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
      // An `id: ''` row is orca failing to enumerate the roster, not a system.
      health = new Map(hr.systems.filter(r => r.id).map(r => [r.id, r]));
      healthRosterError = hr.systems.find(r => !r.id && r.error)?.error ?? null;
      error = null;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      toast.error(`systems: ${error}`);
    } finally {
      loading = false;
    }
  }

  // Stale rows that duplicate a member or each other are dropped (the most
  // recently seen copy wins). Local system first, otherwise API order, so rows
  // never jump between polls.
  const unifiedRows = $derived.by((): UnifiedRow[] => {
    const memberPeers = new Set(members.map(m => m.peer_id));
    const staleByPeer = new Map<string, MeshStaleRow>();
    for (const s of stale) {
      if (memberPeers.has(s.peer_id)) continue;
      const prev = staleByPeer.get(s.peer_id);
      if (!prev || (s.last_seen_at ?? 0) > (prev.last_seen_at ?? 0)) staleByPeer.set(s.peer_id, s);
    }
    const memberRows: UnifiedRow[] = members.map(m => ({
      kind: 'member',
      key: `member:${m.id}:${m.peer_id}`,
      m,
    }));
    const staleRows: UnifiedRow[] = [...staleByPeer.values()].map(s => ({
      kind: 'stale',
      key: `stale:${s.peer_id}`,
      s,
      selfIdentity: s.reason === 'stale self identity',
    }));
    return [...memberRows, ...staleRows].sort((a, b) => {
      const aLocal = a.kind === 'member' && a.m.role === 'local';
      const bLocal = b.kind === 'member' && b.m.role === 'local';
      return aLocal === bLocal ? 0 : aLocal ? -1 : 1;
    });
  });

  const drawerCount = $derived(candidates.length + inboundOffers.length);

  const poller = createPoller({ fn: refresh, intervalMs: 10000 });
  onMount(poller.start);
  onDestroy(() => {
    poller.stop();
    hwAbort?.abort();
  });
</script>

<svelte:head><title>systems · orca</title></svelte:head>

{#snippet hostnameCell(r: UnifiedRow)}
  {#if r.kind === 'member'}
    <button
      type="button"
      class="hostname-trigger"
      aria-haspopup="dialog"
      aria-expanded={hwOpen && hwRowKey === r.key}
      onclick={() => openHardware(r)}
    >
      {hostnameOf(r)}
    </button>
    {#if r.m.role === 'local'}
      <span class="this-system">(this system)</span>
    {/if}
    {#if r.m.error}
      <br /><span class="dim-error" title={r.m.error}
        ><span aria-hidden="true">⚠</span> {r.m.error}</span
      >
    {/if}
  {:else}
    <span title="Hardware detail is only available for active members">{hostnameOf(r)}</span>
    {#if r.selfIdentity}
      <span class="this-system">(former identity of this system)</span>
    {/if}
  {/if}
{/snippet}

{#snippet routeCell(r: UnifiedRow)}
  {#if r.kind === 'stale'}
    <span class="mono">{r.s.addr}:{r.s.port}</span>
  {:else}
    {@const m = r.m}
    {@const current = currentRoute(m)}
    {@const routes = reachableRouteList(m)}
    {@const confirmed = routeConfirmed(m, current, routes)}
    <Popover
      align="start"
      width={260}
      ariaLabel={`Routes for ${hostnameOf(r)}`}
      bind:open={() => openRoutePopover[r.key] ?? false, v => (openRoutePopover[r.key] = v)}
    >
      {#snippet trigger()}
        <button
          type="button"
          class="route-trigger"
          aria-haspopup="dialog"
          aria-expanded={openRoutePopover[r.key] ?? false}
          onclick={() => (openRoutePopover[r.key] = !openRoutePopover[r.key])}
        >
          <span class="mono">{current || '—'}</span>
          {#if !confirmed}
            <span
              class="route-warn"
              role="img"
              aria-label="current route not in the reachable set"
              title="current route not in the reachable set">⚠</span
            >
          {/if}
        </button>
      {/snippet}
      {#snippet children()}
        <div class="route-list">
          {#if routes.length === 0}
            <p class="dim route-note">No LAN addresses reported</p>
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
  {@const h = rowHealth(r)}
  <span class="health" title={h.title}>
    <StatusDot ok={h.ok} degraded={h.degraded} />
    {h.label}
  </span>
{/snippet}

<div class="page">
  <div class="page-header">
    <Button
      variant="secondary"
      ariaHaspopup="dialog"
      ariaExpanded={drawerOpen}
      onclick={() => (drawerOpen = true)}
    >
      Candidates &amp; offers
      {#if drawerCount > 0}
        <Badge tone="accent">{drawerCount}</Badge>
      {/if}
    </Button>
  </div>

  {#if error}
    <p class="banner-error">Failed to refresh systems: {error}</p>
  {/if}
  {#if healthRosterError}
    <p class="banner-error">Health is incomplete: {healthRosterError}</p>
  {/if}

  <section>
    <DataTable
      columns={tableColumns([
        { key: 'hostname', label: 'Hostname', cell: hostnameCell },
        { key: 'route', label: 'Route', cell: routeCell },
        { key: 'version', label: 'Version', width: '90px', cell: versionCell },
        { key: 'daemon', label: 'Daemon', width: '110px', cell: daemonCell },
        { key: 'uptime', label: 'Daemon uptime', width: '120px', cell: uptimeCell },
        { key: 'health', label: 'Health', width: '110px', cell: healthCell },
      ] satisfies Column<UnifiedRow>[])}
      rows={unifiedRows}
      rowKey={r => r.key}
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
  onclose={closeHardware}
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
          <span>{r.dmiVendor ?? '—'} {r.dmiProduct ?? ''}</span>
          <span class="dim">OS</span>
          <span>{r.osName ?? r.distro ?? '—'} {r.osVersion ?? ''}</span>
          <span class="dim">Kernel / arch</span>
          <span>{r.kernelVersion ?? '—'} / {r.arch ?? '—'}</span>
          <span class="dim">Type</span>
          <span>{r.systemTypeLabel ?? '—'}</span>
          <span class="dim">Virtualization</span>
          <span>{r.virtualization ?? '—'}</span>
          <span class="dim">Uptime</span>
          <span>{fmtUptime(r.systemUptimeSecs)}</span>
        </div>
      </section>

      <section>
        <SectionHead title="CPU" />
        <div class="hw-grid">
          <span class="dim">Model</span>
          <span>{r.cpuModel ?? '—'}</span>
          <span class="dim">Cores</span>
          <span>{r.cpuPhysical ?? '—'} physical / {r.cpuLogical ?? '—'} logical</span>
          <span class="dim">Usage</span>
          <!-- `cpuUsagePercent` is `None` on the first snapshot (it needs two
               sysinfo refreshes), so absent renders as unknown. -->
          <span>{r.cpuUsagePercent != null ? `${r.cpuUsagePercent.toFixed(0)}%` : 'unknown'}</span>
        </div>
      </section>

      <section>
        <SectionHead title="Memory" />
        <div class="hw-grid">
          <span class="dim">Used / total</span>
          <span>{fmtMb(r.memUsedMb)} / {fmtMb(r.memTotalMb)}</span>
          <span class="dim">Available</span>
          <span>{fmtMb(r.memAvailableMb)}</span>
          <span class="dim">Usage</span>
          <span>{r.memPercent != null ? `${r.memPercent.toFixed(0)}%` : '—'}</span>
          <span class="dim">Swap used / total</span>
          <span>{fmtMb(r.swapUsedMb)} / {fmtMb(r.swapTotalMb)}</span>
        </div>
      </section>

      <section>
        <SectionHead title="GPU" />
        {#if !r.gpus || r.gpus.length === 0}
          <p class="dim">No GPU detected</p>
        {:else}
          {#each r.gpus as gpu, i (`${gpu.name}-${i}`)}
            <div class="hw-grid">
              <span class="dim">{gpu.name}</span>
              <span>{gpu.vendor}</span>
              <span class="dim">Utilisation</span>
              <!-- `driverStatus` (`no_driver`/`no_metrics`) explains why a
                   reading is absent. -->
              <span>
                {gpu.utilizationPercent != null
                  ? `${gpu.utilizationPercent.toFixed(0)}%`
                  : `unknown (${gpu.driverStatus ?? 'no metrics'})`}
              </span>
              <span class="dim">VRAM used / total</span>
              <span>{fmtMb(gpu.vramUsedMb)} / {fmtMb(gpu.vramTotalMb)}</span>
              <span class="dim">Temperature</span>
              <span>{gpu.temperatureC != null ? `${gpu.temperatureC}°C` : '—'}</span>
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
        {#if !r.detectedCapabilities || r.detectedCapabilities.length === 0}
          <p class="dim">None detected</p>
        {:else}
          <div class="hw-capabilities">
            {#each r.detectedCapabilities as cap, i (cap)}
              <Badge tone="neutral">{r.capabilityLabels?.[i] ?? cap}</Badge>
            {/each}
          </div>
        {/if}
      </section>

      <section>
        <SectionHead title="Storage (orca filesystem only)" />
        <!-- Per-disk, mount, and share inventory lives in the storage domain
             (`storage.list`, `storage.mount.list`, `storage.share.list`); orca#703. -->
        <div class="hw-grid">
          <span class="dim">orca dir</span>
          <span class="mono">{r.orcaDir ?? '—'}</span>
          <span class="dim">Free / total</span>
          <span>
            {r.orcaFsAvailGb != null ? fmtGb(r.orcaFsAvailGb) : '—'} / {r.orcaFsTotalGb != null
              ? fmtGb(r.orcaFsTotalGb)
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
  .health {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
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
