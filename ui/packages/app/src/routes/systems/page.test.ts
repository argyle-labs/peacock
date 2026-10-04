import { render, screen, fireEvent, within } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tick } from 'svelte';
import type {
  HealthReport,
  MeshHealthRow,
  MeshInstance,
  MeshInstancesOutput,
  MeshStaleRow,
  SystemInfoReport,
} from '$lib/client/types.gen';

vi.mock('$lib/client/sdk.gen', () => ({
  systemList: vi.fn(),
  systemHealth: vi.fn(),
  systemInfoDetail: vi.fn(),
}));

import { systemList, systemHealth, systemInfoDetail } from '$lib/client/sdk.gen';
import Page from './+page.svelte';

const NOW = Date.parse('2026-06-01T12:00:00Z');
const NOW_S = NOW / 1000;

function member(over: Partial<MeshInstance>): MeshInstance {
  return {
    addresses: [],
    available_versions: [],
    health: 'up',
    id: 'r',
    label: 'host',
    origin: '',
    peer_id: 'peer',
    port: 12000,
    reachable_addrs: [],
    role: 'system',
    update_available: false,
    version: '0.3.0',
    ...over,
  };
}

function report(over: Partial<HealthReport> = {}): HealthReport {
  return {
    checkedAtMs: NOW - 30_000,
    daemon: { running: true, uptime_seconds: 7200 } as HealthReport['daemon'],
    displayName: 'host',
    healthy: true,
    machineId: 'm',
    version: '0.3.0',
    ...over,
  };
}

function staleRow(over: Partial<MeshStaleRow>): MeshStaleRow {
  return {
    addr: '10.0.0.50',
    hostname: 'stale',
    last_seen_at: NOW_S,
    peer_id: 'stale-peer',
    port: 12000,
    reason: 'orphan',
    ...over,
  };
}

const members: MeshInstance[] = [
  member({
    id: 'r1',
    peer_id: 'peer-healthy',
    label: 'bravo',
    origin: '10.0.0.2:12000',
    reachable_addrs: ['10.0.0.2:12000'],
    addresses: [{ kind: 'lan', kind_label: 'LAN', value: '10.0.0.2' }],
  }),
  member({
    id: 'r2',
    peer_id: 'peer-sick',
    label: 'charlie',
    origin: '10.0.0.9:12000',
    reachable_addrs: ['10.0.0.3:12000'],
  }),
  member({ id: 'r3', peer_id: 'peer-down', label: 'delta' }),
  member({ id: 'r4', peer_id: 'peer-disk', label: 'echo' }),
  member({ id: 'r5', peer_id: 'peer-noprobe', label: 'foxtrot' }),
  member({
    id: '',
    peer_id: 'local-machine',
    role: 'local',
    label: 'alpha',
    health: 'unknown',
    reachable_addrs: [''],
  }),
];

const stale: MeshStaleRow[] = [
  staleRow({ peer_id: 'peer-healthy', hostname: 'bravo' }),
  staleRow({ peer_id: 'peer-ghost', hostname: 'golf', last_seen_at: NOW_S - 1000 }),
  staleRow({ peer_id: 'peer-ghost', hostname: 'golf', last_seen_at: NOW_S - 10 }),
  staleRow({ peer_id: 'old-self', hostname: 'alpha', reason: 'stale self identity' }),
];

const healthRows: MeshHealthRow[] = [
  { id: 'local-machine', host: 'alpha', health: report() },
  { id: 'peer-healthy', host: 'bravo', health: report() },
  { id: 'peer-sick', host: 'charlie', health: report({ healthy: false }) },
  { id: 'peer-down', host: 'delta', error: 'connection refused' },
  {
    id: 'peer-disk',
    host: 'echo',
    health: report({ disk: { availGb: 4, path: '/', totalGb: 50, usedPct: 92 } }),
  },
  { id: '', host: '', error: 'enumerate mesh systems: roster locked' },
];

const listOutput: MeshInstancesOutput = { candidates: [], inbound_offers: [], members, stale };

function hwReport(cpu: string): { host: SystemInfoReport } {
  return { host: { cpuModel: cpu, gpus: [], interfaces: [], detectedCapabilities: [] } };
}

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>(r => (resolve = r));
  return { promise, resolve };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  vi.mocked(systemList).mockReset();
  vi.mocked(systemHealth).mockReset();
  vi.mocked(systemInfoDetail).mockReset();
  vi.mocked(systemList).mockResolvedValue({ data: listOutput } as never);
  vi.mocked(systemHealth).mockResolvedValue({ data: { systems: healthRows } } as never);
});

afterEach(() => {
  vi.useRealTimers();
});

async function renderPage() {
  const result = render(Page);
  await screen.findByRole('button', { name: 'bravo' });
  return result;
}

function systemsTable(): HTMLTableElement {
  return document.querySelector('.page table') as HTMLTableElement;
}

function rowsNamed(name: string): HTMLTableRowElement[] {
  return Array.from(systemsTable().querySelectorAll('tbody tr')).filter(tr =>
    tr.querySelector('td')?.textContent?.trim().startsWith(name),
  ) as HTMLTableRowElement[];
}

function healthCell(tr: HTMLTableRowElement): HTMLElement {
  const cells = tr.querySelectorAll('td');
  return cells[cells.length - 1].querySelector('.health') as HTMLElement;
}

describe('/systems page', () => {
  it('renders every row, including route popovers that have never been opened', async () => {
    await renderPage();
    expect(systemsTable().querySelectorAll('tbody tr')).toHaveLength(8);
  });

  it('opens a route popover through the function binding', async () => {
    await renderPage();
    const trigger = within(rowsNamed('bravo')[0]).getByRole('button', { name: /10\.0\.0\.2/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await fireEvent.click(trigger);
    await tick();
    expect(screen.getByRole('dialog', { name: 'Routes for bravo' })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('derives health from the probe: healthy, daemon stopped, unreachable, disk pressure', async () => {
    await renderPage();
    expect(healthCell(rowsNamed('bravo')[0])).toHaveTextContent('up');
    const charlie = healthCell(rowsNamed('charlie')[0]);
    expect(charlie).toHaveTextContent('down');
    expect(charlie.querySelector('.fail')).toBeTruthy();
    expect(charlie.title).toBe('daemon not running · checked 30s ago');
    const delta = healthCell(rowsNamed('delta')[0]);
    expect(delta).toHaveTextContent('unreachable');
    expect(delta.title).toBe('connection refused');
    const echo = healthCell(rowsNamed('echo')[0]);
    expect(echo).toHaveTextContent('degraded');
    expect(echo.title).toBe('disk 92% used on / · checked 30s ago');
  });

  it('shows unknown, not the roster status, when there is no probe', async () => {
    await renderPage();
    const foxtrot = healthCell(rowsNamed('foxtrot')[0]);
    expect(foxtrot).toHaveTextContent('unknown');
    expect(foxtrot.querySelector('.unknown')).toBeTruthy();
    expect(foxtrot.title).toBe('no health probe');
  });

  it('uses the probe checkedAtMs for the tooltip', async () => {
    await renderPage();
    expect(healthCell(rowsNamed('bravo')[0]).title).toBe('checked 30s ago');
  });

  it('warns when the current route is not in the reachable set', async () => {
    await renderPage();
    const warn = rowsNamed('charlie')[0].querySelector('.route-warn');
    expect(warn).toHaveAttribute('aria-label', 'current route not in the reachable set');
    expect(rowsNamed('bravo')[0].querySelector('.route-warn')).toBeNull();
  });

  it('joins the local row by peer id, not the id-less roster error row', async () => {
    await renderPage();
    const local = rowsNamed('alpha').find(tr => tr.textContent?.includes('(this system)'))!;
    expect(healthCell(local)).toHaveTextContent('up');
    expect(screen.getByText(/Health is incomplete: enumerate mesh systems/)).toBeInTheDocument();
  });

  it('renders the local route without a warning and an empty LAN list sensibly', async () => {
    await renderPage();
    const local = rowsNamed('alpha').find(tr => tr.textContent?.includes('(this system)'))!;
    expect(local.querySelector('.route-warn')).toBeNull();
    await fireEvent.click(within(local).getByRole('button', { name: /localhost/ }));
    await tick();
    expect(screen.getByText('No LAN addresses reported')).toBeInTheDocument();
  });

  it('drops stale rows that duplicate a member or each other', async () => {
    await renderPage();
    expect(rowsNamed('bravo')).toHaveLength(1);
    const golf = rowsNamed('golf');
    expect(golf).toHaveLength(1);
    expect(healthCell(golf[0])).toHaveTextContent('up');
  });

  it('labels a stale self-identity row instead of showing it as a second live system', async () => {
    await renderPage();
    const former = rowsNamed('alpha').find(tr => !tr.textContent?.includes('(this system)'))!;
    expect(former).toHaveTextContent('(former identity of this system)');
    expect(healthCell(former)).toHaveTextContent('retired');
    expect(within(former).queryByRole('button', { name: 'alpha' })).toBeNull();
  });

  it('ignores a stale hardware response that resolves after a newer one', async () => {
    const first = deferred<{ data: { host: SystemInfoReport } }>();
    const second = deferred<{ data: { host: SystemInfoReport } }>();
    vi.mocked(systemInfoDetail)
      .mockReturnValueOnce(first.promise as never)
      .mockReturnValueOnce(second.promise as never);
    await renderPage();

    await fireEvent.click(screen.getByRole('button', { name: 'bravo' }));
    await fireEvent.click(screen.getByRole('button', { name: 'charlie' }));
    second.resolve({ data: hwReport('second-cpu') });
    await tick();
    await screen.findByText('second-cpu');

    first.resolve({ data: hwReport('first-cpu') });
    await tick();
    await tick();
    expect(screen.queryByText('first-cpu')).toBeNull();
    expect(screen.getByText('second-cpu')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Hardware · charlie' })).toBeInTheDocument();
  });

  it('renders identical GPUs as separate entries', async () => {
    const gpu = { name: 'RTX 4090', vendor: 'nvidia', utilizationPercent: 10 };
    vi.mocked(systemInfoDetail).mockResolvedValueOnce({
      data: { host: { ...hwReport('cpu').host, gpus: [gpu, gpu] } },
    } as never);
    await renderPage();
    await fireEvent.click(screen.getByRole('button', { name: 'bravo' }));
    await tick();
    expect(await screen.findAllByText('RTX 4090')).toHaveLength(2);
  });

  it('aborts the hardware request when the drawer closes', async () => {
    const pending = deferred<{ data: { host: SystemInfoReport } }>();
    vi.mocked(systemInfoDetail).mockReturnValueOnce(pending.promise as never);
    await renderPage();

    await fireEvent.click(screen.getByRole('button', { name: 'bravo' }));
    const signal = vi.mocked(systemInfoDetail).mock.calls[0][0].signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    await fireEvent.keyDown(window, { key: 'Escape' });
    await tick();
    expect(signal.aborted).toBe(true);

    pending.resolve({ data: hwReport('late-cpu') });
    await tick();
    await tick();
    expect(screen.queryByText('late-cpu')).toBeNull();
    expect(screen.queryByText('Loading hardware detail…')).toBeNull();
  });
});
