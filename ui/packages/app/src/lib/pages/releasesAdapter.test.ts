import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/client/client.gen', () => ({ client: { post: vi.fn() } }));

import { client } from '$lib/client/client.gen';
import { fetchReleases } from './releasesAdapter';

const post = client.post as unknown as ReturnType<typeof vi.fn>;

const releaseList = {
  org: 'argyle-labs',
  releases: [
    {
      repo: 'orca',
      tag: 'v1.2.0-rc.1',
      name: null,
      kind: 'rc',
      draft: true,
      prerelease: true,
      createdAt: '2026-10-19T10:00:00Z',
      ageSecs: 60,
      url: 'https://g/orca/releases/tag/v1.2.0-rc.1',
      publishUrl: 'https://g/orca/releases/edit/v1.2.0-rc.1',
    },
    {
      repo: 'gitea',
      tag: 'v0.4.0',
      name: 'v0.4.0',
      kind: 'stable',
      draft: true,
      prerelease: false,
      createdAt: null,
      ageSecs: null,
      url: 'https://g/gitea/releases/tag/v0.4.0',
      publishUrl: null,
    },
  ],
  notes: ['1 repo skipped'],
};

const releaseRuns = {
  org: 'argyle-labs',
  since: '24h',
  runs: [
    {
      repo: 'a',
      runId: 1,
      workflow: 'release.yml',
      tag: 'v1',
      title: null,
      status: 'running',
      conclusion: null,
      createdAt: null,
      durationSecs: 30,
      url: 'u1',
    },
    {
      repo: 'b',
      runId: 2,
      workflow: 'release.yml',
      tag: null,
      title: null,
      status: 'waiting',
      conclusion: null,
      createdAt: null,
      durationSecs: null,
      url: null,
    },
    {
      repo: 'c',
      runId: 3,
      workflow: 'release.yml',
      tag: 'v3',
      title: null,
      status: 'completed',
      conclusion: 'failure',
      createdAt: null,
      durationSecs: 120,
      url: 'u3',
      failure: {
        job: 'build',
        jobId: 9,
        stage: 'step',
        step: 'cargo build',
        runnerName: 'willow',
        logTail: ['a', 'b'],
        url: 'j3',
      },
    },
    {
      repo: 'd',
      runId: 4,
      workflow: 'release.yml',
      tag: 'v4',
      title: null,
      status: 'completed',
      conclusion: 'success',
      createdAt: null,
      durationSecs: 5,
      url: 'u4',
    },
  ],
};

const runnerFleet = {
  org: 'argyle-labs',
  runners: [
    {
      scope: 'org',
      id: 1,
      name: 'willow',
      status: 'online',
      online: true,
      busy: false,
      disabled: false,
      labels: ['ubuntu-latest'],
    },
  ],
  instanceRunners: 'instance runners not visible to this token',
  flags: [
    {
      kind: 'setupFailures',
      runner: 'willow',
      labels: [],
      count: 2,
      detail: '2 setup failures',
      jobUrls: [],
    },
    { kind: 'noOnlineRunner', labels: ['macos'], count: 1, detail: '1 job queued', jobUrls: [] },
  ],
  notes: ['fleet note'],
};

function route(endpoints = [{ name: 'main', enabled: true }]) {
  post.mockImplementation(({ url }: { url: string }) => {
    const data = {
      '/api/v1/gitea.list': { endpoints },
      '/api/v1/gitea.release.list': releaseList,
      '/api/v1/gitea.release.runs': releaseRuns,
      '/api/v1/gitea.runner.fleet': runnerFleet,
    }[url];
    return Promise.resolve({ data });
  });
}

describe('releasesAdapter', () => {
  beforeEach(() => {
    post.mockReset();
  });

  it('passes the first enabled endpoint to every verb', async () => {
    route([
      { name: 'off', enabled: false },
      { name: 'main', enabled: true },
    ]);
    await fetchReleases();
    expect(post).toHaveBeenCalledWith({
      url: '/api/v1/gitea.release.list',
      body: { endpoint: 'main', draftOnly: true },
    });
    expect(post).toHaveBeenCalledWith({
      url: '/api/v1/gitea.release.runs',
      body: { endpoint: 'main' },
    });
    expect(post).toHaveBeenCalledWith({
      url: '/api/v1/gitea.runner.fleet',
      body: { endpoint: 'main' },
    });
  });

  it('returns null without an enabled endpoint', async () => {
    route([]);
    expect(await fetchReleases()).toBeNull();
  });

  it('maps drafts, falling back to url when publishUrl is missing', async () => {
    route();
    const out = await fetchReleases();
    expect(out?.drafts.map(d => d.publishUrl)).toEqual([
      'https://g/orca/releases/edit/v1.2.0-rc.1',
      'https://g/gitea/releases/tag/v0.4.0',
    ]);
    expect(out?.notes).toEqual(['1 repo skipped']);
  });

  it('classifies run phases and keeps failure detail', async () => {
    route();
    const out = await fetchReleases();
    expect(out?.runs.map(r => r.phase)).toEqual(['running', 'queued', 'failed', 'other']);
    expect(out?.runs[2]).toMatchObject({
      runId: '3',
      failure: { step: 'cargo build', logTail: ['a', 'b'] },
    });
  });

  it('attaches setup failures to runners and collects starved labels and notes', async () => {
    route();
    const fleet = (await fetchReleases())!.fleet;
    expect(fleet.runners[0].setupFailures).toEqual(['2 setup failures']);
    expect(fleet.starved).toEqual([{ labels: ['macos'], detail: '1 job queued' }]);
    expect(fleet.notes).toEqual(['instance runners not visible to this token', 'fleet note']);
  });
});
