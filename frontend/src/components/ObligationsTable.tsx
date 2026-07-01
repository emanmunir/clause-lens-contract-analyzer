/** Obligations rendered as a party / obligation / clause table. */
import type { Obligation } from '../types';
import { ChecklistIcon } from './icons';

interface ObligationsTableProps {
  obligations: Obligation[];
}

export function ObligationsTable({ obligations }: ObligationsTableProps) {
  return (
    <section className="card p-5" aria-label="Obligations">
      <h2 className="section-title mb-4">
        <ChecklistIcon className="h-4 w-4 text-ink-400" />
        Obligations
      </h2>
      {obligations.length === 0 ? (
        <p className="text-sm text-ink-400">No obligations identified.</p>
      ) : (
        <div className="scroll-slim -mx-1 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                <th className="px-2 pb-2 font-semibold">Party</th>
                <th className="px-2 pb-2 font-semibold">Obligation</th>
                <th className="px-2 pb-2 text-right font-semibold">Clause</th>
              </tr>
            </thead>
            <tbody>
              {obligations.map((o, i) => (
                <tr
                  key={`${o.party}-${i}`}
                  className="border-b border-ink-100 align-top last:border-0"
                >
                  <td className="px-2 py-3 font-medium text-ink-800">{o.party}</td>
                  <td className="px-2 py-3 leading-relaxed text-ink-700">
                    {o.obligation}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <span className="tag-mono">{o.clauseReference}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
