/** App header: product identity, tagline, and a live provider/health badge. */
import type { Provider } from '../types';
import { ScaleIcon } from './icons';
import { ProviderBadge } from './ProviderBadge';

interface HeaderProps {
  /** Active provider from GET /api/health, or null while it is still loading. */
  provider: Provider | null;
  /** True when the health check request is in flight. */
  healthLoading: boolean;
}

/** Fixed-width, top-of-page header shown on every screen. */
export function Header({ provider, healthLoading }: HeaderProps) {
  return (
    <header className="border-b border-ink-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-800 text-accent-100 shadow-card">
            <ScaleIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-ink-900">
                Clause Lens
              </h1>
              <span className="hidden rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-500 sm:inline">
                AI Contract Analyzer
              </span>
            </div>
            <p className="text-sm text-ink-500">
              Read the fine print in seconds — risks, obligations, and gaps, made plain.
            </p>
          </div>
        </div>
        <ProviderBadge provider={provider} loading={healthLoading} />
      </div>
    </header>
  );
}
