/**
 * Clause Lens — root single-page application.
 *
 * Owns all cross-cutting state: the backend health/provider status, the current
 * input, the in-flight analysis request, the returned result, and any error. The
 * layout is a two-column dashboard once a result arrives: a full-width summary
 * and risks column, with parties/dates/obligations/gaps in a responsive grid.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnalysisResult, Provider } from './types';
import { ApiError, analyzeFile, analyzeText, getHealth } from './lib/api';
import { SAMPLE_CONTRACT } from './lib/sample';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { ErrorBanner } from './components/ErrorBanner';
import { SummaryCard } from './components/SummaryCard';
import { RisksSection } from './components/RisksSection';
import { PartiesList } from './components/PartiesList';
import { KeyDatesTimeline } from './components/KeyDatesTimeline';
import { ObligationsTable } from './components/ObligationsTable';
import { MissingClauses } from './components/MissingClauses';
import { ExportMenu } from './components/ExportMenu';
import { ProviderBadge } from './components/ProviderBadge';

/**
 * Rotating progress messages shown on the Analyze button while a request runs,
 * so the wait reads as deliberate work rather than a frozen spinner.
 */
const PROGRESS_STEPS: readonly string[] = [
  'Reading document…',
  'Extracting clauses…',
  'Assessing risks…',
  'Compiling brief…',
];

function App() {
  // Backend health / provider.
  const [provider, setProvider] = useState<Provider | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);

  // Input (lifted so "try sample" can populate the paste area).
  const [pastedText, setPastedText] = useState<string>('');

  // Analysis lifecycle.
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>(PROGRESS_STEPS[0]!);
  const [error, setError] = useState<string | null>(null);

  // Abort controller for the active request, so a new submission cancels the old.
  const abortRef = useRef<AbortController | null>(null);
  // Anchor to scroll the results into view once they arrive.
  const resultsRef = useRef<HTMLDivElement>(null);

  // Probe backend health once on mount.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getHealth(controller.signal)
      .then((health) => {
        if (active) setProvider(health.provider);
      })
      .catch(() => {
        // A failed health check simply means "offline"; the badge conveys it.
        if (active) setProvider(null);
      })
      .finally(() => {
        if (active) setHealthLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  // Cycle the progress text while a request is in flight.
  useEffect(() => {
    if (!loading) return;
    let step = 0;
    setProgressText(PROGRESS_STEPS[0]!);
    const timer = window.setInterval(() => {
      step = (step + 1) % PROGRESS_STEPS.length;
      setProgressText(PROGRESS_STEPS[step]!);
    }, 1400);
    return () => window.clearInterval(timer);
  }, [loading]);

  // Scroll freshly-arrived results into view.
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  /** Run an analysis request built by the given async factory. */
  const runAnalysis = useCallback(
    async (request: (signal: AbortSignal) => Promise<AnalysisResult>) => {
      // Cancel any in-flight request before starting a new one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const analysis = await request(controller.signal);
        if (!controller.signal.aborted) {
          setResult(analysis);
          // Reflect any mock/live switch the backend reports on this response.
          setProvider(analysis.mock ? 'mock' : 'anthropic');
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof ApiError
            ? err.message
            : 'Something went wrong while analyzing the contract.';
        setError(message);
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setLoading(false);
        }
      }
    },
    [],
  );

  const handleAnalyzeText = useCallback(
    (text: string) => {
      void runAnalysis((signal) => analyzeText(text, signal));
    },
    [runAnalysis],
  );

  const handleAnalyzeFile = useCallback(
    (file: File) => {
      void runAnalysis((signal) => analyzeFile(file, signal));
    },
    [runAnalysis],
  );

  /** Populate the paste area with the bundled sample (from the input panel link). */
  const handleLoadSample = useCallback(() => {
    setPastedText(SAMPLE_CONTRACT);
  }, []);

  /** Onboarding CTA: load the sample and analyze it in one click. */
  const handleTrySample = useCallback(() => {
    setPastedText(SAMPLE_CONTRACT);
    handleAnalyzeText(SAMPLE_CONTRACT);
  }, [handleAnalyzeText]);

  // Cancel any pending request when the app unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header provider={provider} healthLoading={healthLoading} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8">
        <div className="space-y-6">
          <InputPanel
            loading={loading}
            progressText={progressText}
            onAnalyzeText={handleAnalyzeText}
            onAnalyzeFile={handleAnalyzeFile}
            onLoadSample={handleLoadSample}
            pastedText={pastedText}
            onPastedTextChange={setPastedText}
          />

          {error && (
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          )}

          {/* Results region: loading skeleton → dashboard → onboarding. */}
          <div ref={resultsRef}>
            {loading ? (
              <LoadingState />
            ) : result ? (
              <ResultsDashboard result={result} />
            ) : (
              <EmptyState onTrySample={handleTrySample} disabled={loading} />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-ink-200/70 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-ink-400 sm:flex-row sm:px-8">
          <p>
            Clause Lens · AI-assisted contract review. Not a substitute for legal
            counsel.
          </p>
          <p className="font-mono">v1.0.0</p>
        </div>
      </footer>
    </div>
  );
}

interface ResultsDashboardProps {
  result: AnalysisResult;
}

/** The full results dashboard rendered once an analysis returns. */
function ResultsDashboard({ result }: ResultsDashboardProps) {
  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Toolbar: mock badge (when applicable) + export. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            Analysis
          </h2>
          {result.mock && <ProviderBadge provider="mock" loading={false} />}
        </div>
        <ExportMenu result={result} />
      </div>

      <SummaryCard
        documentType={result.documentType}
        summary={result.summary}
      />

      <RisksSection risks={result.risks} />

      <div className="grid gap-6 lg:grid-cols-3">
        <PartiesList parties={result.parties} />
        <KeyDatesTimeline keyDates={result.keyDates} />
        <div className="lg:col-span-1">
          <MissingClauses missingClauses={result.missingClauses} />
        </div>
      </div>

      <ObligationsTable obligations={result.obligations} />
    </div>
  );
}

export default App;
