import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/client/client.gen', () => ({ client: { post: vi.fn() } }));

import { client } from '$lib/client/client.gen';
import { fetchDrafts, fetchRuns, fetchRunnerHealth, mapRun } from './releasesAdapter';

const post = client.post as unknown as ReturnType<typeof vi.fn>;

describe('releasesAdapter', () => {
  beforeEach(() => post.mockReset());

  it('calls the gitea tool over the generic REST route', async () => {
    post.mockResolvedValue({ data: [] });
    await fetchDrafts();
    expect(post).toHaveBeenCalledWith({ url: '/api/v1/gitea.release.list', body: {} });
  });

  it('maps drafts from a bare array or a wrapped list', async () => {
    const raw = { repo: 'orca', tag: 'v1.0.0', kind: 'stable', draft: true, html_url: 'u' };
    post
      .mockResolvedValueOnce({ data: [raw] })
      .mockResolvedValueOnce({ data: { releases: [raw] } });
    for (const d of [await fetchDrafts(), await fetchDrafts()]) {
      expect(d).toEqual([
        { repo: 'orca', tag: 'v1.0.0', kind: 'stable', draft: true, created: null, htmlUrl: 'u' },
      ]);
    }
  });

  it('classifies run phases and carries failure detail', async () => {
    post.mockResolvedValue({
      data: [
        { repo: 'a', run_id: 1, status: 'running' },
        { repo: 'b', run_id: 2, status: 'queued' },
        {
          repo: 'c',
          run_id: 3,
          status: 'completed',
          conclusion: 'failure',
          failed_step: 'build',
          log_tail: 'boom',
        },
        { repo: 'd', run_id: 4, status: 'completed', conclusion: 'success' },
      ],
    });
    const runs = await fetchRuns();
    expect(runs.map(r => r.phase)).toEqual(['running', 'queued', 'failed', 'other']);
    expect(runs[2]).toMatchObject({ runId: '3', failedStep: 'build', logTail: 'boom' });
  });

  it('reads nested failure detail', () => {
    const r = mapRun({
      status: 'failure',
      failure: { job: 'publish', step: 'sign', log_tail: 'x' },
    });
    expect(r).toMatchObject({
      phase: 'failed',
      failedJob: 'publish',
      failedStep: 'sign',
      logTail: 'x',
    });
  });

  it('maps runners and starved labels', async () => {
    post.mockResolvedValue({
      data: {
        runners: [{ name: 'mint', labels: ['macos'], online: true, busy: false, flags: ['stale'] }],
        starved_labels: ['arm64'],
      },
    });
    expect(await fetchRunnerHealth()).toEqual({
      runners: [{ name: 'mint', labels: ['macos'], online: true, busy: false, flags: ['stale'] }],
      starvedLabels: ['arm64'],
    });
  });
});
