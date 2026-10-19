import { client } from '$lib/client/client.gen';

export type ReleaseKind = 'rc' | 'stable';

export interface ReleaseDraft {
  repo: string;
  tag: string;
  kind: ReleaseKind;
  createdAt: string | null;
  publishUrl: string | null;
}

export type RunPhase = 'running' | 'queued' | 'failed' | 'other';

export interface RunFailure {
  job: string | null;
  stage: 'setup' | 'step';
  step: string | null;
  runnerName: string | null;
  logTail: string[];
  url: string | null;
}

export interface ReleaseRun {
  repo: string;
  runId: string;
  tag: string | null;
  status: string;
  conclusion: string | null;
  durationSecs: number | null;
  url: string | null;
  phase: RunPhase;
  failure: RunFailure | null;
}

export interface Runner {
  name: string;
  labels: string[];
  online: boolean;
  busy: boolean;
  disabled: boolean;
  setupFailures: string[];
}

export interface RunnerFleet {
  runners: Runner[];
  starved: { labels: string[]; detail: string }[];
  notes: string[];
}

export interface Releases {
  drafts: ReleaseDraft[];
  runs: ReleaseRun[];
  fleet: RunnerFleet;
  notes: string[];
}

interface WireRelease {
  repo: string;
  tag: string;
  kind: ReleaseKind;
  createdAt: string | null;
  url: string | null;
  publishUrl: string | null;
}

interface WireRun {
  repo: string;
  runId: number | string;
  tag: string | null;
  status: string;
  conclusion: string | null;
  durationSecs: number | null;
  url: string | null;
  failure?: RunFailure;
}

interface WireRunner {
  name: string;
  online: boolean;
  busy: boolean;
  disabled: boolean;
  labels: string[];
}

interface WireFlag {
  kind: 'setupFailures' | 'noOnlineRunner';
  runner?: string;
  labels: string[];
  detail: string;
}

interface WireFleet {
  runners: WireRunner[];
  instanceRunners?: string;
  flags: WireFlag[];
  notes?: string[];
}

async function callTool<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const res = await client.post({ url: `/api/v1/${name}`, body });
  return res.data as T;
}

export async function fetchEndpoint(): Promise<string | null> {
  const out = await callTool<{ endpoints: { name: string; enabled: boolean }[] }>('gitea.list', {});
  return out.endpoints.find(e => e.enabled)?.name ?? null;
}

export function mapDraft(r: WireRelease): ReleaseDraft {
  return {
    repo: r.repo,
    tag: r.tag,
    kind: r.kind,
    createdAt: r.createdAt,
    publishUrl: r.publishUrl ?? r.url,
  };
}

function phaseOf(status: string, conclusion: string | null): RunPhase {
  if (conclusion === 'failure' || status === 'failure') return 'failed';
  if (status === 'running') return 'running';
  if (status === 'waiting' || status === 'blocked' || status === 'queued') return 'queued';
  return 'other';
}

export function mapRun(r: WireRun): ReleaseRun {
  return {
    repo: r.repo,
    runId: String(r.runId),
    tag: r.tag,
    status: r.status,
    conclusion: r.conclusion,
    durationSecs: r.durationSecs,
    url: r.url,
    phase: phaseOf(r.status, r.conclusion),
    failure: r.failure ?? null,
  };
}

export function mapFleet(f: WireFleet): RunnerFleet {
  const setup = f.flags.filter(x => x.kind === 'setupFailures');
  return {
    runners: f.runners.map(r => ({
      name: r.name,
      labels: r.labels,
      online: r.online,
      busy: r.busy,
      disabled: r.disabled,
      setupFailures: setup.filter(x => x.runner === r.name).map(x => x.detail),
    })),
    starved: f.flags
      .filter(x => x.kind === 'noOnlineRunner')
      .map(x => ({ labels: x.labels, detail: x.detail })),
    notes: [...(f.instanceRunners ? [f.instanceRunners] : []), ...(f.notes ?? [])],
  };
}

export async function fetchReleases(): Promise<Releases | null> {
  const endpoint = await fetchEndpoint();
  if (!endpoint) return null;
  const [list, runs, fleet] = await Promise.all([
    callTool<{ releases: WireRelease[]; notes?: string[] }>('gitea.release.list', {
      endpoint,
      draftOnly: true,
    }),
    callTool<{ runs: WireRun[] }>('gitea.release.runs', { endpoint }),
    callTool<WireFleet>('gitea.runner.fleet', { endpoint }),
  ]);
  return {
    drafts: list.releases.map(mapDraft),
    runs: runs.runs.map(mapRun),
    fleet: mapFleet(fleet),
    notes: list.notes ?? [],
  };
}
