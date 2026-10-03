<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { SectionHead, DataTable, StatusDot, Badge } from '@peacock/ui-kit';
  import { systemList, systemHealth } from '$lib/client/sdk.gen';
  import { unwrap } from '$lib/stores/runTool';
  import { toast } from '$lib/stores/notifications';
  import { createPoller } from '$lib/utils/polling';
  import { relTime, fmtUptime, fmtGb } from '$lib/utils/format';
  import { tableColumns, type Column } from '$lib/pages/descriptor';
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

{#snippet healthCell(m: MeshInstance)}
  <StatusDot ok={m.health === 'up' ? true : m.health === 'down' ? false : null} />
  {m.health}
{/snippet}

{#snippet systemCell(m: MeshInstance)}
  {m.label || m.origin || m.id}
  {#if m.error}
    <br /><span class="dim-error" title={m.error}>⚠ {m.error}</span>
  {/if}
{/snippet}

{#snippet roleCell(m: MeshInstance)}
  <Badge tone={m.role === 'local' ? 'accent' : 'neutral'}>{m.role}</Badge>
{/snippet}

{#snippet daemonCell(m: MeshInstance)}
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
  {@const hr = healthRowFor(m)}
  {#if hr?.health?.disk}
    {fmtGb(hr.health.disk.availGb)} / {fmtGb(hr.health.disk.totalGb)} ({hr.health.disk.usedPct}%)
  {:else}
    <span class="dim">—</span>
  {/if}
{/snippet}

{#snippet versionCell(m: MeshInstance)}
  {m.version ?? '—'}
{/snippet}

{#snippet lastSeenCell(m: MeshInstance)}
  {relTime(m.last_checked ?? null)}
{/snippet}

{#snippet candidateHostCell(c: MeshCandidate)}
  {c.hostname}
{/snippet}

{#snippet candidateAddrCell(c: MeshCandidate)}
  <span class="mono">{c.addr}:{c.port}</span>
{/snippet}

{#snippet candidateInviteCell(c: MeshCandidate)}
  <Badge tone={c.can_invite ? 'success' : 'neutral'}>{c.can_invite ? 'yes' : 'no'}</Badge>
{/snippet}

{#snippet candidateFpCell(c: MeshCandidate)}
  <span class="mono">{c.pubkey_fp}</span>
{/snippet}

{#snippet staleHostCell(s: MeshStaleRow)}
  {s.hostname}
{/snippet}

{#snippet staleAddrCell(s: MeshStaleRow)}
  <span class="mono">{s.addr}:{s.port}</span>
{/snippet}

{#snippet staleReasonCell(s: MeshStaleRow)}
  <Badge tone="warning">{s.reason}</Badge>
{/snippet}

{#snippet staleLastSeenCell(s: MeshStaleRow)}
  {relTime(s.last_seen_at ?? null)}
{/snippet}

{#snippet offerHostCell(o: MeshInboundOffer)}
  {o.peer_hostname}
{/snippet}

{#snippet offerAddrCell(o: MeshInboundOffer)}
  <span class="mono">{o.peer_addr}:{o.peer_port}</span>
{/snippet}

{#snippet offerInviterCell(o: MeshInboundOffer)}
  <span class="mono">{o.inviter_peer_id ?? '—'}</span>
{/snippet}

{#snippet offerTtlCell(o: MeshInboundOffer)}
  {fmtUptime(o.ttl_secs)}
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
        { key: 'health', label: 'Health', width: '110px', cell: healthCell },
        { key: 'system', label: 'System', cell: systemCell },
        { key: 'role', label: 'Role', width: '80px', cell: roleCell },
        { key: 'daemon', label: 'Daemon', cell: daemonCell },
        { key: 'disk', label: 'Disk', cell: diskCell },
        { key: 'version', label: 'Version', width: '110px', cell: versionCell },
        { key: 'lastSeen', label: 'Last seen', width: '100px', cell: lastSeenCell },
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
        { key: 'hostname', label: 'Hostname', cell: candidateHostCell },
        { key: 'addr', label: 'Address', cell: candidateAddrCell },
        { key: 'invite', label: 'Can invite', width: '100px', cell: candidateInviteCell },
        { key: 'fp', label: 'Pubkey', cell: candidateFpCell },
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
        { key: 'hostname', label: 'Hostname', cell: staleHostCell },
        { key: 'addr', label: 'Address', cell: staleAddrCell },
        { key: 'reason', label: 'Reason', width: '150px', cell: staleReasonCell },
        { key: 'lastSeen', label: 'Last seen', width: '100px', cell: staleLastSeenCell },
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
        { key: 'hostname', label: 'Hostname', cell: offerHostCell },
        { key: 'addr', label: 'Address', cell: offerAddrCell },
        { key: 'inviter', label: 'Inviter', cell: offerInviterCell },
        { key: 'ttl', label: 'Expires in', width: '100px', cell: offerTtlCell },
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
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
</style>
