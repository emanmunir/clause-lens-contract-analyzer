/** Top-of-dashboard card: document type + plain-English summary. */
import type { AnalysisResult } from '../types';
import { FileIcon } from './icons';

interface SummaryCardProps {
  documentType: AnalysisResult['documentType'];
  summary: AnalysisResult['summary'];
}

export function SummaryCard({ documentType, summary }: SummaryCardProps) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-ink-200/70 bg-gradient-to-r from-ink-900 to-ink-800 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-accent-200">
            <FileIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-200">
              Document type
            </p>
            <h2 className="text-lg font-bold tracking-tight">{documentType}</h2>
          </div>
        </div>
      </div>
      <div className="px-6 py-5">
        <p className="text-[15px] leading-relaxed text-ink-700">{summary}</p>
      </div>
    </section>
  );
}
