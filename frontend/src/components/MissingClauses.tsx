/** "Missing clauses" warning section — gaps a well-drafted contract would fill. */
import type { MissingClause } from '../types';
import { MissingIcon } from './icons';

interface MissingClausesProps {
  missingClauses: MissingClause[];
}

export function MissingClauses({ missingClauses }: MissingClausesProps) {
  if (missingClauses.length === 0) {
    return (
      <section
        className="card flex items-center gap-3 p-5"
        aria-label="Missing clauses"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
          <MissingIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-800">
            No obvious gaps detected
          </p>
          <p className="text-sm text-ink-500">
            The expected clauses for this document type appear to be present.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-medium-border bg-medium-bg shadow-card"
      aria-label="Missing clauses"
    >
      <div className="flex items-center gap-2 border-b border-medium-border/70 px-5 py-3">
        <MissingIcon className="h-4 w-4 text-medium-text" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-medium-text">
          Missing clauses
        </h2>
        <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-medium-text">
          {missingClauses.length}
        </span>
      </div>
      <ul className="divide-y divide-medium-border/60">
        {missingClauses.map((clause, i) => (
          <li key={`${clause.clause}-${i}`} className="px-5 py-3.5">
            <p className="text-sm font-semibold text-ink-800">{clause.clause}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-600">
              {clause.whyItMatters}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
