<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { SectionHead, DataTable, Badge } from '@peacock/ui-kit';
  import { systemList, systemHealth } from '$lib/client/sdk.gen';
  import { unwrap } from '$lib/stores/runTool';
  import { toast } from '$lib/stores/notifications';
  import { createPoller } from '$lib/utils/polling';
  import { fmtUptime, fmtGb } from '$lib/utils/format';
  import { tableColumns, type Column } from '$lib/pages/descriptor';
  import { memberSpecs, candidateSpecs, staleSpecs, offerSpecs } from '$lib/pages/systemsCellSpecs';
  import type {
    MeshInstance,
    MeshCandidate,
    MeshStaleRow,
    MeshInboundOffer,
    MeshHealthRow,
    MeshHealthReport,
    MeshInstancesOutput,
  } from '$lib/client/types.gen';

  let members = $state<MeshInstance[]>([]);
  let candidates = $state<MeshCandidate[]>([]);
  let stale = $state<MeshStaleRow[]>([]);
  let inboundOffers = $state<MeshInboundOffer[]>([]);
  let health = $state<Map<string, MeshHealthRow>>(new Map());
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Local member row has no roster id (health rows key it as ""); every
  // paired peer joins on `id`, falling back to `peer_id` for shape drift.
  function healthRowFor(m: MeshInstance): MeshHealthRow | undefined {
    return health.get(m.role === 'local' ? '' : m.id) ?? health.get(m.peer_id);
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

  const poller = createPoller({ fn: refresh, intervalMs: 10000 });
  onMount(poller.start);
  onDestroy(poller.stop);
</script>

<svelte:head><title>systems · orca</title></svelte:head>

{#snippet systemCell(m: MeshInstance)}
  <!-- Escape hatch, not a `CellSpec`: composite of three row fields chosen by
       fallback plus a conditional error line — one cell, two independent
       pieces of information, with no "pick a fallback chain, then render a
       second line" kind that wouldn't just be a template engine in disguise. -->

  {m.label || m.origin || m.id}
  {#if m.error}
    <br /><span class="dim-error" title={m.error}>⚠ {m.error}</span>
  {/if}
{/snippet}

{#snippet daemonCell(m: MeshInstance)}
  <!-- Escape hatch: a `CellSpec.field` resolves only against the row itself,
       but this cell's data comes from `health`, a sibling map keyed by id —
       a join `CellSpec` can't express without becoming a query language. -->
  {@const hr = healthRowFor(m)}
  {#if hr?.error}
    <span title={hr.error}><Badge tone="error">probe error</Badge></span>
  {:else if hr?.health?.daemon}
    <Badge tone={hr.health.daemon.running ? 'success' : 'error'}>
      {hr.health.daemon.running ? 'running' : 'stopped'}
    </Badge>
    {#if hr.health.daemon.uptime_seconds != null}
      <span class="dim">{fmtUptime(hr.health.daemon.uptime_seconds)}</span>
    {/if}
  {:else}
    <Badge tone="neutral">unknown</Badge>
  {/if}
{/snippet}

{#snippet diskCell(m: MeshInstance)}
  <!-- Escape hatch: same cross-map join as `daemonCell`, plus "avail / total
       (pct%)" composes three fields with literal separators — a one-off,
       not a general `kind` worth adding to a vocabulary every platform
       must reimplement. -->
  {@const hr = healthRowFor(m)}
  {#if hr?.health?.disk}
    {fmtGb(hr.health.disk.availGb)} / {fmtGb(hr.health.disk.totalGb)} ({hr.health.disk.usedPct}%)
  {:else}
    <span class="dim">—</span>
  {/if}
{/snippet}

<div class="page">
  <SectionHead title="Systems" />

  {#if error}
    <p class="banner-error">Failed to refresh systems: {error}</p>
  {/if}

  <section>
    <SectionHead title="Members" />
    <DataTable
      columns={tableColumns([
        { key: 'health', label: 'Health', width: '110px', spec: memberSpecs.health },
        { key: 'system', label: 'System', cell: systemCell },
        { key: 'role', label: 'Role', width: '80px', spec: memberSpecs.role },
        { key: 'daemon', label: 'Daemon', cell: daemonCell },
        { key: 'disk', label: 'Disk', cell: diskCell },
        { key: 'version', label: 'Version', width: '110px', spec: memberSpecs.version },
        { key: 'lastSeen', label: 'Last seen', width: '100px', spec: memberSpecs.lastSeen },
      ] satisfies Column<MeshInstance>[])}
      rows={members}
      {loading}
      emptyText="No paired systems"
    />
  </section>

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
    <SectionHead title="Stale" />
    <DataTable
      columns={tableColumns([
        { key: 'hostname', label: 'Hostname', spec: staleSpecs.hostname },
        { key: 'addr', label: 'Address', spec: staleSpecs.addr },
        { key: 'reason', label: 'Reason', width: '150px', spec: staleSpecs.reason },
        { key: 'lastSeen', label: 'Last seen', width: '100px', spec: staleSpecs.lastSeen },
      ] satisfies Column<MeshStaleRow>[])}
      rows={stale}
      {loading}
      emptyText="No stale entries"
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

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
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
</style>
