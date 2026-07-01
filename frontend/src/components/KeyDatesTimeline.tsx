/** Key dates rendered as a compact vertical timeline. */
import type { KeyDate } from '../types';
import { CalendarIcon } from './icons';

interface KeyDatesTimelineProps {
  keyDates: KeyDate[];
}

export function KeyDatesTimeline({ keyDates }: KeyDatesTimelineProps) {
  return (
    <section className="card p-5" aria-label="Key dates">
      <h2 className="section-title mb-4">
        <CalendarIcon className="h-4 w-4 text-ink-400" />
        Key dates
      </h2>
      {keyDates.length === 0 ? (
        <p className="text-sm text-ink-400">No dates identified.</p>
      ) : (
        <ol className="relative space-y-4 border-l border-ink-200 pl-5">
          {keyDates.map((entry, i) => (
            <li key={`${entry.label}-${i}`} className="relative">
              <span className="absolute -left-[1.4rem] top-1 flex h-3 w-3 items-center justify-center">
                <span className="h-3 w-3 rounded-full border-2 border-white bg-accent-500 shadow-card" />
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-semibold text-ink-800">{entry.label}</p>
                <p className="font-mono text-xs text-accent-700">{entry.date}</p>
              </div>
              {entry.note && (
                <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                  {entry.note}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
