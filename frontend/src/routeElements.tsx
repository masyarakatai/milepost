/**
 * The lazy route elements, split out of `App.tsx` so that file can stay
 * component-only — mixing plain object exports into a component file trips
import type { ReactElement } from 'react';

 * `react-refresh/only-export-components` (the same reason `pages/payeeBulk.ts`).
 *
 * Keyed by the same paths as `APP_ROUTES` (see `routes.ts`), so the header
 * Menu (built from that list) can never point at a path this router does not
 * also serve.
 */
import { lazyWithRetry } from './lib/lazyWithRetry';

const ProgrammeDirectory = lazyWithRetry(() =>
  import('./pages/ProgrammeDirectory').then((m) => ({ default: m.ProgrammeDirectory })),
);
export const ProgrammeDetail = lazyWithRetry(() =>
  import('./pages/ProgrammeDetail').then((m) => ({ default: m.ProgrammeDetail })),
);
const FunderDashboard = lazyWithRetry(() =>
  import('./pages/FunderDashboard').then((m) => ({ default: m.FunderDashboard })),
);
const RecipientDashboard = lazyWithRetry(() =>
  import('./pages/RecipientDashboard').then((m) => ({ default: m.RecipientDashboard })),
);
const Standing = lazyWithRetry(() => import('./pages/Standing').then((m) => ({ default: m.Standing })));
const AwardProgress = lazyWithRetry(() =>
  import('./pages/AwardProgress').then((m) => ({ default: m.AwardProgress })),
);
const ApplicationTimeline = lazyWithRetry(() =>
  import('./pages/ApplicationTimeline').then((m) => ({ default: m.ApplicationTimeline })),
);
const VerifierDashboard = lazyWithRetry(() =>
  import('./pages/VerifierDashboard').then((m) => ({ default: m.VerifierDashboard })),
);
const FinalizeAwards = lazyWithRetry(() =>
  import('./pages/FinalizeAwards').then((m) => ({ default: m.FinalizeAwards })),
);
const SpendPolicy = lazyWithRetry(() =>
  import('./pages/SpendPolicy').then((m) => ({ default: m.SpendPolicy })),
);
const RegistryAdmin = lazyWithRetry(() =>
  import('./pages/RegistryAdmin').then((m) => ({ default: m.RegistryAdmin })),
);
const AdminStanding = lazyWithRetry(() =>
  import('./pages/AdminStanding').then((m) => ({ default: m.AdminStanding })),
);
const AttestationLookup = lazyWithRetry(() =>
  import('./pages/AttestationLookup').then((m) => ({ default: m.AttestationLookup })),
);
const RegisterSchema = lazyWithRetry(() =>
  import('./pages/RegisterSchema').then((m) => ({ default: m.RegisterSchema })),
);
const Keepalive = lazyWithRetry(() =>
  import('./pages/Keepalive').then((m) => ({ default: m.Keepalive })),
);
const PayeeManagement = lazyWithRetry(() =>
  import('./pages/PayeeManagement').then((m) => ({ default: m.PayeeManagement })),
);
const IndexStatus = lazyWithRetry(() =>
  import('./pages/IndexStatus').then((m) => ({ default: m.IndexStatus })),
);
const AboutDeployment = lazyWithRetry(() =>
  import('./pages/AboutDeployment').then((m) => ({ default: m.AboutDeployment })),
);

export const ROUTE_ELEMENTS: Record<string, ReactElement> = {
  '/directory': <ProgrammeDirectory />,
  '/programme': <ProgrammeDetail />,
  '/funders': <FunderDashboard />,
  '/recipients': <RecipientDashboard />,
  '/recipients/standing': <Standing />,
  '/recipients/award-progress': <AwardProgress />,
  '/recipients/application-timeline': <ApplicationTimeline />,
  '/verifiers': <VerifierDashboard />,
  '/finalize': <FinalizeAwards />,
  '/policy': <SpendPolicy />,
  '/admin': <RegistryAdmin />,
  '/admin/standing': <AdminStanding />,
  '/attestations': <AttestationLookup />,
  '/schemas/register': <RegisterSchema />,
  '/keepalive': <Keepalive />,
  '/admin/payees': <PayeeManagement />,
  '/status': <IndexStatus />,
  '/about': <AboutDeployment />,
};
