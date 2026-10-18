import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { APP_ROUTES } from './routes';
import App from './App';
import { ROUTE_ELEMENTS } from './routeElements';
import { DEMO_PROGRAMME_ID } from './context/sorobanStore';

// The route table and the router must stay in lockstep: a route in APP_ROUTES
// without a lazy element in the router compiles fine and silently renders
// nothing. So the test pins three things — every APP_ROUTES path has its lazy
// element, and every mounted route resolves to real content (a level-1
// heading) without the error boundary.

const origin = vi.hoisted(() => ({ path: '/' }));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    // App owns its BrowserRouter; the memory variant lets a test pick the
    // URL the app boots at.
    BrowserRouter: (props: React.ComponentProps<typeof actual.BrowserRouter>) =>
      React.createElement(actual.MemoryRouter, { initialEntries: [origin.path], ...props }),
  };
});

vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn(async () => true),
  getNetwork: vi.fn(async () => ({
    network: 'TESTNET',
    networkPassphrase: 'Test SDF Network ; September 2015',
    networkUrl: 'https://horizon-testnet.stellar.org',
  })),
  getAddress: vi.fn(async () => ({ address: null, error: null })),
  signTransaction: vi.fn(),
  signMessage: vi.fn(),
  getPublicKey: vi.fn(),
  addToken: vi.fn(),
  requestAccess: vi.fn(),
}));

vi.mock('./lib/indexer', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./lib/indexer')>()),
  fetchMeta: vi.fn(async () => ({
    last_event_seq: 0,
    last_ledger_seq: 0,
    head_update_age_secs: 0,
    indexed_count: 0,
    handled_events: 0,
    unhandled_event_types: [],
  })),
  fetchProgrammes: vi.fn(async () => []),
  fetchAwards: vi.fn(async () => []),
}));

// Route pages read through their own hooks; the clients' behaviour is
// asserted by those pages' suites. Here the stubs only keep every mounted
// route free of network traffic.
vi.mock('./context/useSoroban', () => {
  const stubClient = () =>
    new Proxy({}, { get: () => vi.fn(async () => ({ result: null })) }) as never;
  return {
    useSoroban: vi.fn(() => ({
      registry: stubClient(),
      attest: stubClient(),
      record: stubClient(),
      policy: stubClient(),
      programmeAt: () => stubClient(),
      demoProgramme: stubClient(),
      rpcUrl: 'https://soroban-testnet.stellar.org',
    })),
  };
});

// Every route the app exposes: the h1 that screen readers call the page.
const H1 = (name: string | undefined) => ({ level: 1 as const, name });
const EXPECTED_HEADINGS: Record<string, { level: 1 | 2; name: string | undefined }> = {
  '/directory': H1('Programmes'),
  // The detail page's h1 is the programme's own name; any level-1 heading
  // with content is the pin (the name itself belongs to the client tests).
  '/programme': H1(undefined),
  '/funders': H1('Funding'),
  '/recipients': H1('Your funding'),
  '/recipients/standing': { level: 2, name: 'Sign in to see your awards' },
  '/recipients/award-progress': H1('Your funding'),
  '/recipients/application-timeline': H1('Your funding'),
  '/verifiers': H1('Verify conditions'),
  '/finalize': H1('Finalize Awards'),
  '/policy': H1('Spend policy'),
  '/admin': H1('Run programmes'),
  '/admin/standing': H1('Standing writers'),
  '/attestations': H1('Look up an attestation'),
  '/schemas/register': H1('Register a schema'),
  '/keepalive': H1('Keepalive'),
  '/admin/payees': H1('Payee management'),
  '/status': H1('Index status'),
  '/about': H1('About this deployment'),
};

const bootPath = (path: string) => (path === '/programme' ? `/programme/${DEMO_PROGRAMME_ID}` : path);

describe('Issue #466 — every route in APP_ROUTES renders', () => {
  beforeEach(() => {
    origin.path = '/';
    vi.clearAllMocks();
  });

  it('routes every path of APP_ROUTES through the lazy router table', () => {
    const unreachable = APP_ROUTES.filter((route) => !(route.path in ROUTE_ELEMENTS));
    expect(unreachable).toEqual([]);
  });

  for (const route of APP_ROUTES) {
    it(`mounts ${route.path}`, async () => {
      origin.path = bootPath(route.path);
      render(<App />);

      const expected = EXPECTED_HEADINGS[route.path];
      const heading = await screen.findByRole(
        'heading',
        { level: expected.level, name: expected.name },
        { timeout: 10_000 },
      );
      expect(heading).toBeTruthy();
      expect(
        screen.queryByRole('heading', { name: 'Something went wrong' }),
      ).toBeNull();
      // The fallback skeleton is gone once the page resolved.
      await waitFor(() => {
        expect(document.body.innerHTML).not.toContain('Loading this section');
      });
    });
  }
});
