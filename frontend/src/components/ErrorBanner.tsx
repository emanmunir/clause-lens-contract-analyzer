/** Dismissible error banner shown when a request fails. */
import { AlertIcon, CloseIcon } from './icons';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="animate-slide-in flex items-start gap-3 rounded-xl border border-high-border bg-high-bg px-4 py-3 text-sm text-high-text shadow-card"
    >
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">Analysis failed</p>
        <p className="mt-0.5 text-high-text/90">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="rounded-md p-1 text-high-text/70 transition-colors hover:bg-high-border/50 hover:text-high-text"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
