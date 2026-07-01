/**
 * Risks dashboard section: a header with per-severity counts plus the list of
 * severity-coloured risk cards (sorted high → low). Renders an empty state when
 * the analyzer found no risks.
 */
import type { Risk } from '../types';
import {
  countSeverities,
  sortBySeverity,
  summariseSeverities,
} from '../lib/severity';
import { AlertIcon, ShieldIcon } from './icons';
import { RiskCard } from './RiskCard';

interface RisksSectionProps {
  risks: Risk[];
}

export function RisksSection({ risks }: RisksSectionProps) {
  const counts = countSeverities(risks);
  const summary = summariseSeverities(counts);
  const sorted = sortBySeverity(risks);

  return (
    <section aria-label="Risks">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="section-title">
          <AlertIcon className="h-4 w-4 text-ink-400" />
          Risks
          <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold normal-case tracking-normal text-ink-600">
            {counts.total}
          </span>
        </h2>
        {summary && (
          <div className="flex items-center gap-2 text-xs font-medium">
            {counts.high > 0 && (
              <span className="rounded-full bg-high-bg px-2 py-1 text-high-text">
                {counts.high} high
              </span>
            )}
            {counts.medium > 0 && (
              <span className="rounded-full bg-medium-bg px-2 py-1 text-medium-text">
                {counts.medium} medium
              </span>
            )}
            {counts.low > 0 && (
              <span className="rounded-full bg-low-bg px-2 py-1 text-low-text">
                {counts.low} low
              </span>
            )}
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="card flex items-center gap-3 px-5 py-6 text-sm text-ink-600">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
            <ShieldIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-ink-800">No material risks flagged</p>
            <p className="text-ink-500">
              The analyzer did not surface notable red flags. Still worth a human review.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </div>
      )}
    </section>
  );
}
