<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { SectionHead, DataTable, Badge, StatusDot } from '@peacock/ui-kit';
  import { toast } from '$lib/stores/notifications';
  import { createPoller } from '$lib/utils/polling';
  import { relTime, fmtUptime } from '$lib/utils/format';
  import { tableColumns, type Column } from '$lib/pages/descriptor';
  import {
    fetchReleases,
    type ReleaseDraft,
    type ReleaseRun,
    type Runner,
  } from '$lib/pages/releasesAdapter';

  let drafts = $state<ReleaseDraft[]>([]);
  let runs = $state<ReleaseRun[]>([]);
  let runners = $state<Runner[]>([]);
  let starved = $state<{ labels: string[]; detail: string }[]>([]);
  let notes = $state<string[]>([]);
  let noEndpoint = $state(false);
  let loading = $state(true);
  let error = $state<string | null>(null);

  async function refresh() {
    try {
      const out = await fetchReleases();
      noEndpoint = out === null;
      drafts = out?.drafts ?? [];
      runs = out?.runs ?? [];
      runners = out?.fleet.runners ?? [];
      starved = out?.fleet.starved ?? [];
      notes = out ? [...out.notes, ...out.fleet.notes] : [];
      error = null;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      toast.error(`releases: ${error}`);
    } finally {
      loading = false;
    }
  }

  const rcDrafts = $derived(drafts.filter(d => d.kind === 'rc'));
  const stableDrafts = $derived(drafts.filter(d => d.kind === 'stable'));
  const activeRuns = $derived(runs.filter(r => r.phase === 'running' || r.phase === 'queued'));
  const failedRuns = $derived(runs.filter(r => r.phase === 'failed'));

  function created(d: ReleaseDraft): string {
    if (!d.createdAt) return '—';
    const ms = Date.parse(d.createdAt);
    return Number.isNaN(ms) ? d.createdAt : relTime(ms, 'ms').text;
  }

  function duration(r: ReleaseRun): string {
    return r.durationSecs == null ? '—' : fmtUptime(r.durationSecs);
  }

  function failedAt(r: ReleaseRun): string {
    const f = r.failure;
    if (f?.stage === 'setup') {
      return `Failed before any step (runner setup) on ${f.runnerName ?? 'unknown runner'}`;
    }
    return `Failed at ${[f?.job, f?.step].filter(Boolean).join(' › ') || 'unknown step'}`;
  }

  function runnerState(r: Runner): { label: string; ok: boolean | null; degraded: boolean } {
    if (r.disabled) return { label: 'disabled', ok: null, degraded: false };
    if (!r.online) return { label: 'offline', ok: false, degraded: false };
    if (r.busy) return { label: 'busy', ok: true, degraded: true };
    return { label: 'online', ok: true, degraded: false };
  }

  const draftColumns = $derived(
    tableColumns([
      { key: 'repo', label: 'Repository', cell: repoCell },
      { key: 'tag', label: 'Tag', cell: tagCell },
      { key: 'created', label: 'Created', width: '120px', cell: createdCell },
      { key: 'publish', label: 'Approve', width: '160px', cell: publishCell },
    ] satisfies Column<ReleaseDraft>[]),
  );

  const poller = createPoller({ fn: refresh, intervalMs: 30000 });
  onMount(poller.start);
  onDestroy(poller.stop);
</script>

<svelte:head><title>releases · orca</title></svelte:head>

{#snippet repoCell(d: ReleaseDraft)}{d.repo}{/snippet}
{#snippet tagCell(d: ReleaseDraft)}<span class="mono">{d.tag}</span>{/snippet}
{#snippet createdCell(d: ReleaseDraft)}{created(d)}{/snippet}
{#snippet publishCell(d: ReleaseDraft)}
  {#if d.publishUrl}<a
      class="link"
      href={d.publishUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Publish ${d.repo} ${d.tag} in Gitea (opens in a new tab)`}>Publish in Gitea</a
    >{:else}<span class="dim">no link</span>{/if}
{/snippet}

{#snippet runRepoCell(r: ReleaseRun)}
  {#if r.url}<a class="link" href={r.url} target="_blank" rel="noopener noreferrer"
      >{r.repo} #{r.runId}</a
    >{:else}{r.repo} #{r.runId}{/if}
{/snippet}
{#snippet runTagCell(r: ReleaseRun)}<span class="mono">{r.tag || '—'}</span>{/snippet}
{#snippet runStatusCell(r: ReleaseRun)}
  <Badge tone={r.phase === 'running' ? 'info' : 'neutral'}>{r.status}</Badge>
{/snippet}
{#snippet runDurationCell(r: ReleaseRun)}{duration(r)}{/snippet}

{#snippet runnerNameCell(r: Runner)}{r.name}{/snippet}
{#snippet runnerStateCell(r: Runner)}
  {@const s = runnerState(r)}
  <span class="health">
    <StatusDot ok={s.ok} degraded={s.degraded} />
    {s.label}
  </span>
{/snippet}
{#snippet runnerLabelsCell(r: Runner)}
  <span class="chips">
    {#each r.labels as l (l)}<Badge tone="neutral">{l}</Badge>{/each}
  </span>
{/snippet}
{#snippet runnerFlagsCell(r: Runner)}
  {#if r.setupFailures.length === 0}
    <span class="dim">—</span>
  {:else}
    <span class="chips">
      {#each r.setupFailures as f (f)}<Badge tone="warning">{f}</Badge>{/each}
    </span>
  {/if}
{/snippet}

<div class="page">
  {#if error}
    <p class="banner-error" role="alert">Failed to refresh releases: {error}</p>
  {/if}
  {#if noEndpoint}
    <p class="banner-info" role="status">No enabled gitea endpoint is configured.</p>
  {/if}
  {#each notes as n (n)}
    <p class="banner-info">{n}</p>
  {/each}

  <section aria-label="Awaiting approval">
    <SectionHead title="Awaiting approval" />
    <p class="dim">Approval happens in Gitea; publishing a draft starts its release.</p>
    <h3>Release candidates</h3>
    <DataTable
      columns={draftColumns}
      rows={rcDrafts}
      rowKey={d => `${d.repo}:${d.tag}`}
      {loading}
      emptyText="No RC drafts awaiting approval"
    />
    <h3>Stable</h3>
    <DataTable
      columns={draftColumns}
      rows={stableDrafts}
      rowKey={d => `${d.repo}:${d.tag}`}
      {loading}
      emptyText="No stable drafts awaiting approval"
    />
  </section>

  <section aria-label="Running">
    <SectionHead title="Running" />
    <DataTable
      columns={tableColumns([
        { key: 'run', label: 'Run', cell: runRepoCell },
        { key: 'tag', label: 'Tag', cell: runTagCell },
        { key: 'status', label: 'Status', width: '110px', cell: runStatusCell },
        { key: 'duration', label: 'Duration', width: '110px', cell: runDurationCell },
      ] satisfies Column<ReleaseRun>[])}
      rows={activeRuns}
      rowKey={r => `${r.repo}:${r.runId}`}
      {loading}
      emptyText="No release runs in progress"
    />
  </section>

  <section aria-label="Failed">
    <SectionHead title="Failed" />
    {#if loading}
      <p class="dim">Loading…</p>
    {:else if failedRuns.length === 0}
      <p class="dim">No failed release runs</p>
    {:else}
      <ul class="failures">
        {#each failedRuns as r (`${r.repo}:${r.runId}`)}
          <li class="failure">
            <div class="failure-head">
              <StatusDot ok={false} />
              <a
                class="link"
                href={r.failure?.url ?? r.url}
                target="_blank"
                rel="noopener noreferrer">{r.repo} #{r.runId}</a
              >
              <span class="mono">{r.tag ?? '—'}</span>
              <span class="dim">{duration(r)}</span>
            </div>
            <p class="failure-step"><strong>{failedAt(r)}</strong></p>
            {#if r.failure?.logTail.length}
              <details>
                <summary>Log tail</summary>
                <pre class="log">{r.failure.logTail.join('\n')}</pre>
              </details>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <section aria-label="Runners">
    <SectionHead title="Runners" />
    {#each starved as f (f.labels.join(','))}
      <p class="banner-warn" role="status">
        Queued jobs with no online runner for:
        {#each f.labels as l (l)}<Badge tone="warning">{l}</Badge>{/each}
        <span>{f.detail}</span>
      </p>
    {/each}
    <DataTable
      columns={tableColumns([
        { key: 'name', label: 'Runner', cell: runnerNameCell },
        { key: 'state', label: 'State', width: '110px', cell: runnerStateCell },
        { key: 'labels', label: 'Labels', cell: runnerLabelsCell },
        { key: 'flags', label: 'Flags', cell: runnerFlagsCell },
      ] satisfies Column<Runner>[])}
      rows={runners}
      rowKey={r => r.name}
      {loading}
      emptyText="No runners registered"
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
  h3 {
    margin: var(--space-2) 0 0;
    font-size: var(--text-sm);
    color: var(--color-text);
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
  .banner-info {
    border: 1px solid var(--color-info);
    color: var(--color-text);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    margin: 0;
  }
  .banner-warn {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
    border: 1px solid var(--color-warning);
    color: var(--color-text);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    margin: 0;
  }
  .dim {
    color: var(--color-text-dim);
    font-size: var(--text-xs);
    margin: 0;
  }
  .link {
    color: var(--color-accent);
  }
  .link:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .health,
  .chips {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
  }
  .failures {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .failure {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-3);
  }
  .failure-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .failure-step {
    margin: var(--space-1) 0;
    font-size: var(--text-sm);
  }
  summary {
    cursor: pointer;
    font-size: var(--text-sm);
  }
  .log {
    max-height: 320px;
    overflow: auto;
    font-size: var(--text-xs);
    white-space: pre-wrap;
    margin: var(--space-1) 0 0;
  }
</style>
