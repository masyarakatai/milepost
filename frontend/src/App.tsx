import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SorobanProvider } from "./context/SorobanContext";
import { WalletProvider } from "./context/WalletContext";
import { Layout } from "./components/layout/Layout";
import { Skeleton } from "./components/state/AsyncStates";
import { Home } from "./pages/Home";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { APP_ROUTES } from "./routes";
import { ROUTE_ELEMENTS, ProgrammeDetail } from "./routeElements";
import { lazyWithRetry } from "./lib/lazyWithRetry";

// Route chunks load on navigation, not up front. The shell (providers,
// layout) and the landing page (`Home`, the most-visited route and the one
// that needs the least code) stay in the initial chunk; every app route
// splits into its own chunk behind `React.lazy`. Baseline (all eager):
// 869,340 uncompressed JS bytes; budget allows +5%.
//
// `lazyWithRetry` rather than `React.lazy` directly: after a deploy, an open
// tab's route chunks 404 against the old build's file hashes. This recovers
// with one automatic reload instead of leaving the raw import error to hit
// `ErrorBoundary` as an ordinary crash.

/**
 * What a route chunk shows while it loads: the same card-shaped skeleton
 * the screens use for reads, not a bare spinner — so navigating feels like
 * the content resolving rather than the app restarting.
 */
function RouteFallback() {
  return (
    <div aria-busy="true">
      <Skeleton variant="card" label="Loading this section" />
    </div>
  );
}

// Development builds only. Vite replaces `import.meta.env.DEV` with `false` in a
// production build, so this import and its chunk are dropped entirely.
const ComponentGallery = import.meta.env.DEV
  ? lazyWithRetry(() =>
      import("./pages/dev/ComponentGallery").then((m) => ({ default: m.ComponentGallery })),
    )
  : null;
const NotFound = lazyWithRetry(() => import("./pages/NotFound").then((m) => ({ default: m.NotFound })));

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <SorobanProvider>
          <ErrorBoundary>
            <Router>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    {APP_ROUTES.map(({ path }) => (
                      <Route
                        key={path}
                        path={path.slice(1)}
                        element={ROUTE_ELEMENTS[path]}
                      />
                    ))}
                    <Route
                      path="programme/:programmeId"
                      element={<ProgrammeDetail />}
                    />
                    {ComponentGallery && <Route path="dev/ui" element={<ComponentGallery />} />}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </ErrorBoundary>
        </SorobanProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
