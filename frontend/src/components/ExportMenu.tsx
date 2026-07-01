/** Export dropdown: download the current analysis as Markdown or JSON. */
import { useEffect, useRef, useState } from 'react';
import type { AnalysisResult } from '../types';
import { downloadJson, downloadMarkdown } from '../lib/export';
import { DownloadIcon } from './icons';

interface ExportMenuProps {
  result: AnalysisResult;
}

export function ExportMenu({ result }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="btn-ghost"
      >
        <DownloadIcon className="h-4 w-4" />
        Export
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade-in-up absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-panel"
        >
          <MenuItem
            label="Download Markdown"
            hint=".md"
            onClick={() => {
              downloadMarkdown(result);
              setOpen(false);
            }}
          />
          <MenuItem
            label="Download JSON"
            hint=".json"
            onClick={() => {
              downloadJson(result);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  label: string;
  hint: string;
  onClick: () => void;
}

function MenuItem({ label, hint, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-ink-700 transition-colors hover:bg-ink-50"
    >
      <span className="font-medium">{label}</span>
      <span className="tag-mono">{hint}</span>
    </button>
  );
}
