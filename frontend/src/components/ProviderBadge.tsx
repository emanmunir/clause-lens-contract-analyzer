/** Small status pill reflecting the backend provider from GET /api/health. */
import type { Provider } from '../types';

interface ProviderBadgeProps {
  provider: Provider | null;
  loading: boolean;
}

export function ProviderBadge({ provider, loading }: ProviderBadgeProps) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-300" />
        Connecting…
      </span>
    );
  }

  if (provider === null) {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full border border-high-border bg-high-bg px-3 py-1.5 text-xs font-medium text-high-text"
        title="The frontend could not reach the backend health endpoint."
      >
        <span className="h-2 w-2 rounded-full bg-high-dot" />
        Backend offline
      </span>
    );
  }

  const isLive = provider === 'anthropic';
  return (
    <span
      className={
        isLive
          ? 'inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-800'
          : 'inline-flex items-center gap-2 rounded-full border border-medium-border bg-medium-bg px-3 py-1.5 text-xs font-medium text-medium-text'
      }
      title={
        isLive
          ? 'Connected to the Anthropic-powered backend.'
          : 'Backend is running in mock mode — responses are canned sample data.'
      }
    >
      <span
        className={`h-2 w-2 rounded-full ${isLive ? 'bg-accent-500' : 'bg-medium-dot'}`}
      />
      {isLive ? 'Anthropic' : 'Mock mode'}
    </span>
  );
}
