import { render, screen, within } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/pages/releasesAdapter', () => ({
  fetchDrafts: vi.fn(),
  fetchRuns: vi.fn(),
  fetchRunnerHealth: vi.fn(),
}));

import { fetchDrafts, fetchRuns, fetchRunnerHealth } from '$lib/pages/releasesAdapter';
import Page from './+page.svelte';

const mocked = <T>(f: T) => f as unknown as ReturnType<typeof vi.fn>;

function empty() {
  mocked(fetchDrafts).mockResolvedValue([]);
  mocked(fetchRuns).mockResolvedValue([]);
  mocked(fetchRunnerHealth).mockResolvedValue({ runners: [], starvedLabels: [] });
}

const run = (over: object) => ({
  repo: 'orca',
  runId: '1',
  tag: 'v1.0.0-rc.1',
  status: 'running',
  conclusion: null,
  durationSecs: 90,
  htmlUrl: 'https://gitea.example/run/1',
  phase: 'running',
  failedJob: null,
  failedStep: null,
  logTail: null,
  ...over,
});

describe('releases page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders empty states', async () => {
    empty();
    render(Page);
    expect(await screen.findByText('No RC drafts awaiting approval')).toBeInTheDocument();
    expect(screen.getByText('No stable drafts awaiting approval')).toBeInTheDocument();
    expect(screen.getByText('No release runs in progress')).toBeInTheDocument();
    expect(screen.getByText('No failed release runs')).toBeInTheDocument();
    expect(screen.getByText('No runners registered')).toBeInTheDocument();
  });

  it('groups drafts and links to the Gitea publish page', async () => {
    empty();
    mocked(fetchDrafts).mockResolvedValue([
      {
        repo: 'orca',
        tag: 'v1.1.0-rc.2',
        kind: 'rc',
        draft: true,
        created: null,
        htmlUrl: 'https://g/rc',
      },
      {
        repo: 'gitea',
        tag: 'v0.4.0',
        kind: 'stable',
        draft: true,
        created: null,
        htmlUrl: 'https://g/st',
      },
    ]);
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
    empty();
    mocked(fetchRuns).mockResolvedValue([
      run({}),
      run({
        repo: 'peacock',
        runId: '7',
        phase: 'failed',
        status: 'completed',
        failedJob: 'build',
        failedStep: 'cargo build',
        logTail: 'error[E0425]',
      }),
    ]);
    render(Page);
    const running = await screen.findByRole('region', { name: 'Running' });
    expect(within(running).getByRole('link', { name: 'orca #1' })).toBeInTheDocument();
    const failed = screen.getByRole('region', { name: 'Failed' });
    expect(within(failed).getByText('build › cargo build')).toBeInTheDocument();
    const details = within(failed).getByText('Log tail').closest('details');
    expect(details).not.toHaveAttribute('open');
    expect(within(failed).getByText('error[E0425]')).toBeInTheDocument();
  });

  it('shows runner state, flags and starved labels', async () => {
    empty();
    mocked(fetchRunnerHealth).mockResolvedValue({
      runners: [
        {
          name: 'willow',
          labels: ['ubuntu-latest'],
          online: true,
          busy: true,
          flags: ['disk-low'],
        },
        { name: 'hemlock', labels: [], online: false, busy: false, flags: [] },
      ],
      starvedLabels: ['arm64'],
    });
    render(Page);
    const runners = await screen.findByRole('region', { name: 'Runners' });
    expect(await within(runners).findByText('busy')).toBeInTheDocument();
    expect(within(runners).getByText('offline')).toBeInTheDocument();
    expect(within(runners).getByText('disk-low')).toBeInTheDocument();
    expect(within(runners).getByRole('status')).toHaveTextContent('arm64');
  });

  it('shows an error banner when a fetch fails', async () => {
    empty();
    mocked(fetchRuns).mockRejectedValue(new Error('tool not found'));
    render(Page);
    expect(await screen.findByRole('alert')).toHaveTextContent('tool not found');
  });
});
