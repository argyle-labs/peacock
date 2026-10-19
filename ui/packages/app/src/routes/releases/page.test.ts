import { render, screen, within } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Releases, ReleaseRun } from '$lib/pages/releasesAdapter';

vi.mock('$lib/pages/releasesAdapter', () => ({ fetchReleases: vi.fn() }));

import { fetchReleases } from '$lib/pages/releasesAdapter';
import Page from './+page.svelte';

const fetchMock = fetchReleases as unknown as ReturnType<typeof vi.fn>;

function data(over: Partial<Releases> = {}): Releases {
  return {
    drafts: [],
    runs: [],
    fleet: { runners: [], starved: [], notes: [] },
    notes: [],
    ...over,
  };
}

const run = (over: Partial<ReleaseRun>): ReleaseRun => ({
  repo: 'orca',
  runId: '1',
  tag: 'v1.0.0-rc.1',
  status: 'running',
  conclusion: null,
  durationSecs: 90,
  url: 'https://g/run/1',
  phase: 'running',
  failure: null,
  ...over,
});

describe('releases page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders empty states', async () => {
    fetchMock.mockResolvedValue(data());
    render(Page);
    expect(await screen.findByText('No RC drafts awaiting approval')).toBeInTheDocument();
    expect(screen.getByText('No stable drafts awaiting approval')).toBeInTheDocument();
    expect(screen.getByText('No release runs in progress')).toBeInTheDocument();
    expect(screen.getByText('No failed release runs')).toBeInTheDocument();
    expect(screen.getByText('No runners registered')).toBeInTheDocument();
  });

  it('says when no gitea endpoint is configured', async () => {
    fetchMock.mockResolvedValue(null);
    render(Page);
    expect(await screen.findByText('No enabled gitea endpoint is configured.')).toBeInTheDocument();
  });

  it('groups drafts and links to the Gitea publish page', async () => {
    fetchMock.mockResolvedValue(
      data({
        drafts: [
          {
            repo: 'orca',
            tag: 'v1.1.0-rc.2',
            kind: 'rc',
            createdAt: null,
            publishUrl: 'https://g/rc',
          },
          {
            repo: 'gitea',
            tag: 'v0.4.0',
            kind: 'stable',
            createdAt: null,
            publishUrl: 'https://g/st',
          },
        ],
      }),
    );
    render(Page);
    const link = await screen.findByRole('link', { name: /Publish orca v1.1.0-rc.2 in Gitea/ });
    expect(link).toHaveAttribute('href', 'https://g/rc');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: /Publish gitea v0.4.0/ })).toHaveAttribute(
      'href',
      'https://g/st',
    );
    expect(screen.queryByRole('button', { name: /publish/i })).toBeNull();
  });

  it('shows running and failed runs with a collapsible log tail', async () => {
    fetchMock.mockResolvedValue(
      data({
        runs: [
          run({}),
          run({
            repo: 'peacock',
            runId: '7',
            phase: 'failed',
            status: 'completed',
            failure: {
              job: 'build',
              stage: 'step',
              step: 'cargo build',
              runnerName: 'willow',
              logTail: ['line 1', 'error[E0425]'],
              url: 'https://g/job/7',
            },
          }),
          run({
            repo: 'nut',
            runId: '8',
            phase: 'failed',
            failure: {
              job: 'build',
              stage: 'setup',
              step: null,
              runnerName: 'mint',
              logTail: [],
              url: null,
            },
          }),
        ],
      }),
    );
    render(Page);
    const running = await screen.findByRole('region', { name: 'Running' });
    expect(within(running).getByRole('link', { name: 'orca #1' })).toBeInTheDocument();
    const failed = screen.getByRole('region', { name: 'Failed' });
    expect(within(failed).getByText('Failed at build › cargo build')).toBeInTheDocument();
    expect(within(failed).getByRole('link', { name: 'peacock #7' })).toHaveAttribute(
      'href',
      'https://g/job/7',
    );
    expect(
      within(failed).getByText('Failed before any step (runner setup) on mint'),
    ).toBeInTheDocument();
    const details = within(failed).getByText('Log tail').closest('details');
    expect(details).not.toHaveAttribute('open');
    expect(within(failed).getByText(/error\[E0425\]/)).toBeInTheDocument();
  });

  it('shows runner state, setup failures, starved labels and notes', async () => {
    fetchMock.mockResolvedValue(
      data({
        fleet: {
          runners: [
            {
              name: 'willow',
              labels: ['ubuntu-latest'],
              online: true,
              busy: true,
              disabled: false,
              setupFailures: ['2 setup failures'],
            },
            {
              name: 'hemlock',
              labels: [],
              online: false,
              busy: false,
              disabled: false,
              setupFailures: [],
            },
          ],
          starved: [{ labels: ['arm64'], detail: '3 jobs queued' }],
          notes: ['instance runners not visible'],
        },
      }),
    );
    render(Page);
    const runners = await screen.findByRole('region', { name: 'Runners' });
    expect(await within(runners).findByText('busy')).toBeInTheDocument();
    expect(within(runners).getByText('offline')).toBeInTheDocument();
    expect(within(runners).getByText('2 setup failures')).toBeInTheDocument();
    expect(within(runners).getByRole('status')).toHaveTextContent('arm64');
    expect(screen.getByText('instance runners not visible')).toBeInTheDocument();
  });

  it('shows an error banner when a fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('tool not found'));
    render(Page);
    expect(await screen.findByRole('alert')).toHaveTextContent('tool not found');
  });
});
