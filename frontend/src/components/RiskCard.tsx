/** A single risk rendered as a severity-coloured card. */
import type { Risk } from '../types';
import { SEVERITY_STYLES } from '../lib/severity';
import { ArrowRightIcon, ShieldIcon } from './icons';

interface RiskCardProps {
  risk: Risk;
}

export function RiskCard({ risk }: RiskCardProps) {
  const style = SEVERITY_STYLES[risk.severity];

  return (
    <article
      className={`relative overflow-hidden rounded-xl border ${style.card} pl-4 shadow-card transition-shadow hover:shadow-card-hover`}
    >
      {/* Severity accent bar */}
      <span className={`absolute inset-y-0 left-0 w-1.5 ${style.accent}`} aria-hidden="true" />

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${style.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
          <h3 className={`text-[15px] font-bold ${style.title}`}>{risk.title}</h3>
          <span className="tag-mono ml-auto">{risk.clauseReference}</span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-700">{risk.explanation}</p>

        <div className="mt-3 flex items-start gap-2 rounded-lg border border-white/60 bg-white/70 px-3 py-2.5">
          <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" />
          <p className="text-sm leading-relaxed text-ink-700">
            <span className="inline-flex items-center gap-1 font-semibold text-ink-800">
              Recommendation
              <ArrowRightIcon className="h-3.5 w-3.5 text-accent-600" />
            </span>{' '}
            {risk.recommendation}
          </p>
        </div>
      </div>
    </article>
  );
}
