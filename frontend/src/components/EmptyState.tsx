/**
 * Onboarding view shown before the first analysis: a short pitch, the three
 * things Clause Lens surfaces, and a one-click "try a sample contract" action.
 */
import { AlertIcon, ChecklistIcon, MissingIcon, SparkleIcon } from './icons';

interface EmptyStateProps {
  /** Load + immediately analyze the bundled sample contract. */
  onTrySample: () => void;
  /** Disabled while a request is already running. */
  disabled: boolean;
}

const FEATURES = [
  {
    icon: AlertIcon,
    title: 'Risk radar',
    body: 'Severity-ranked flags with the exact clause and a plain-English fix.',
  },
  {
    icon: ChecklistIcon,
    title: 'Obligations & dates',
    body: 'Who owes what, and every deadline pulled onto one timeline.',
  },
  {
    icon: MissingIcon,
    title: 'Missing clauses',
    body: 'What a well-drafted contract of this type would include, but yours does not.',
  },
] as const;

export function EmptyState({ onTrySample, disabled }: EmptyStateProps) {
  return (
    <section className="card animate-fade-in-up flex flex-col items-center px-6 py-12 text-center sm:py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
        <SparkleIcon className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-bold tracking-tight text-ink-900">
        Turn dense legalese into a clear brief
      </h2>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        Upload or paste a contract and Clause Lens returns a structured
        breakdown — summary, parties, risks, obligations, and the gaps worth
        a second look.
      </p>

      <button
        type="button"
        onClick={onTrySample}
        disabled={disabled}
        className="btn-primary mt-6"
      >
        <SparkleIcon className="h-4 w-4" />
        Try a sample contract
      </button>

      <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-ink-200/70 bg-ink-50/50 p-4 text-left"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-accent-700 shadow-card">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-800">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-500">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
