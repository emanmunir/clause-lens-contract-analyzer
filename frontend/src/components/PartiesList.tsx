/** Parties to the contract, shown as initial-avatar rows. */
import type { Party } from '../types';
import { UsersIcon } from './icons';

interface PartiesListProps {
  parties: Party[];
}

/** Derive up to two uppercase initials from a party name. */
function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[words.length - 1]![0]!).toUpperCase();
}

export function PartiesList({ parties }: PartiesListProps) {
  return (
    <section className="card p-5" aria-label="Parties">
      <h2 className="section-title mb-4">
        <UsersIcon className="h-4 w-4 text-ink-400" />
        Parties
      </h2>
      {parties.length === 0 ? (
        <p className="text-sm text-ink-400">No parties identified.</p>
      ) : (
        <ul className="space-y-3">
          {parties.map((party, i) => (
            <li key={`${party.name}-${i}`} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-50 text-xs font-bold text-accent-800">
                {initials(party.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-800">
                  {party.name}
                </p>
                <p className="truncate text-xs text-ink-500">{party.role}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
