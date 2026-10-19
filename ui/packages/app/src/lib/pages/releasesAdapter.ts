import { client } from '$lib/client/client.gen';

export type ReleaseKind = 'rc' | 'stable';

export interface ReleaseDraft {
  repo: string;
  tag: string;
  kind: ReleaseKind;
  draft: boolean;
  created: string | null;
  htmlUrl: string;
}

export type RunPhase = 'running' | 'queued' | 'failed' | 'other';

export interface ReleaseRun {
  repo: string;
  runId: string;
  tag: string;
  status: string;
  conclusion: string | null;
  durationSecs: number | null;
  htmlUrl: string;
  phase: RunPhase;
  failedJob: string | null;
  failedStep: string | null;
  logTail: string | null;
}

export interface Runner {
  name: string;
  labels: string[];
  online: boolean;
  busy: boolean;
  flags: string[];
}

export interface RunnerHealth {
  runners: Runner[];
  starvedLabels: string[];
}

type Raw = Record<string, unknown>;

async function callTool(name: string): Promise<unknown> {
  const res = await client.post({ url: `/api/v1/${name}`, body: {} });
  return res.data;
}

function list(v: unknown, key: string): Raw[] {
  if (Array.isArray(v)) return v as Raw[];
  if (v && typeof v === 'object' && Array.isArray((v as Raw)[key])) return (v as Raw)[key] as Raw[];
  return [];
}

const str = (v: unknown): string => (v == null ? '' : String(v));
const optStr = (v: unknown): string | null => (v == null || v === '' ? null : String(v));
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

export function mapDraft(r: Raw): ReleaseDraft {
  return {
    repo: str(r.repo),
    tag: str(r.tag),
    kind: r.kind === 'stable' ? 'stable' : 'rc',
    draft: r.draft !== false,
    created: optStr(r.created),
    htmlUrl: str(r.html_url),
  };
}

function phaseOf(status: string, conclusion: string | null): RunPhase {
  if (conclusion === 'failure' || status === 'failure') return 'failed';
  if (status === 'running' || status === 'in_progress') return 'running';
  if (status === 'queued' || status === 'waiting' || status === 'blocked') return 'queued';
  return 'other';
}

export function mapRun(r: Raw): ReleaseRun {
  const status = str(r.status);
  const conclusion = optStr(r.conclusion);
  const failure = (r.failure ?? {}) as Raw;
  return {
    repo: str(r.repo),
    runId: str(r.run_id ?? r.id),
    tag: str(r.tag),
    status,
    conclusion,
    durationSecs: typeof r.duration === 'number' ? r.duration : null,
    htmlUrl: str(r.html_url),
    phase: phaseOf(status, conclusion),
    failedJob: optStr(r.failed_job ?? failure.job),
    failedStep: optStr(r.failed_step ?? failure.step),
    logTail: optStr(r.log_tail ?? failure.log_tail),
  };
}

export function mapRunner(r: Raw): Runner {
  return {
    name: str(r.name),
    labels: strs(r.labels),
    online: r.online === true,
    busy: r.busy === true,
    flags: strs(r.flags),
  };
}

export async function fetchDrafts(): Promise<ReleaseDraft[]> {
  return list(await callTool('gitea.release.list'), 'releases').map(mapDraft);
}

export async function fetchRuns(): Promise<ReleaseRun[]> {
  return list(await callTool('gitea.release.runs'), 'runs').map(mapRun);
}

export async function fetchRunnerHealth(): Promise<RunnerHealth> {
  const out = await callTool('gitea.runner.health');
  const starved =
    out && typeof out === 'object' && !Array.isArray(out)
      ? strs((out as Raw).starved_labels ?? (out as Raw).unserved_labels)
      : [];
  return { runners: list(out, 'runners').map(mapRunner), starvedLabels: starved };
}
