/**
 * The input surface: a tabbed panel offering either drag-and-drop file upload
 * (.pdf / .docx / .txt) or a paste-text area, plus the Analyze action with its
 * loading state. The panel owns only local input state; submission is delegated
 * to the parent via callbacks.
 */
import { useCallback, useRef, useState } from 'react';
import { FileIcon, SparkleIcon, TextIcon, UploadIcon } from './icons';

/** Accepted upload extensions, kept in one place for the input + validation. */
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt'] as const;
const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(',');

type InputMode = 'upload' | 'paste';

interface InputPanelProps {
  /** Whether an analysis request is currently in flight. */
  loading: boolean;
  /** Progress text to display next to the spinner while loading. */
  progressText: string;
  /** Submit a pasted-text analysis. */
  onAnalyzeText: (text: string) => void;
  /** Submit a file-upload analysis. */
  onAnalyzeFile: (file: File) => void;
  /** Load the bundled sample contract into the paste area. */
  onLoadSample: () => void;
  /** Controlled value of the paste-text area (lifted so "try sample" can fill it). */
  pastedText: string;
  /** Update the paste-text value. */
  onPastedTextChange: (value: string) => void;
}

/** Return true when the filename ends in one of the accepted extensions. */
function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function InputPanel({
  loading,
  progressText,
  onAnalyzeText,
  onAnalyzeFile,
  onLoadSample,
  pastedText,
  onPastedTextChange,
}: InputPanelProps) {
  const [mode, setMode] = useState<InputMode>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = useCallback((file: File) => {
    if (!hasAcceptedExtension(file.name)) {
      setSelectedFile(null);
      setFileError('Unsupported file type. Upload a .pdf, .docx, or .txt file.');
      return;
    }
    setFileError(null);
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) acceptFile(file);
    },
    [acceptFile],
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) acceptFile(file);
    },
    [acceptFile],
  );

  const canSubmit = mode === 'upload' ? selectedFile !== null : pastedText.trim().length > 0;

  const handleSubmit = useCallback(() => {
    if (loading || !canSubmit) return;
    if (mode === 'upload' && selectedFile) {
      onAnalyzeFile(selectedFile);
    } else if (mode === 'paste') {
      onAnalyzeText(pastedText);
    }
  }, [
    canSubmit,
    loading,
    mode,
    onAnalyzeFile,
    onAnalyzeText,
    pastedText,
    selectedFile,
  ]);

  return (
    <section className="card p-5 sm:p-6" aria-label="Contract input">
      {/* Tab switcher */}
      <div className="mb-5 inline-flex rounded-xl border border-ink-200 bg-ink-50 p-1">
        <TabButton
          active={mode === 'upload'}
          onClick={() => setMode('upload')}
          icon={<UploadIcon className="h-4 w-4" />}
          label="Upload file"
        />
        <TabButton
          active={mode === 'paste'}
          onClick={() => setMode('paste')}
          icon={<TextIcon className="h-4 w-4" />}
          label="Paste text"
        />
      </div>

      {mode === 'upload' ? (
        <div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload a contract file by dropping it here or pressing Enter to browse"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
              isDragging
                ? 'border-accent-500 bg-accent-50'
                : 'border-ink-200 bg-ink-50/60 hover:border-accent-300 hover:bg-accent-50/40'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-accent-600 shadow-card">
              <UploadIcon className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-semibold text-ink-800">
              Drag &amp; drop your contract here
            </p>
            <p className="mt-1 text-sm text-ink-500">
              or <span className="font-medium text-accent-700">browse</span> to choose a file
            </p>
            <p className="mt-3 text-xs text-ink-400">
              Supports PDF, DOCX, and TXT
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_ATTR}
              className="sr-only"
              onChange={handleFileInput}
            />
          </div>

          {selectedFile && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                <FileIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-800">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-ink-400">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
                className="text-xs font-medium text-ink-500 hover:text-high-text"
              >
                Remove
              </button>
            </div>
          )}

          {fileError && (
            <p className="mt-3 text-sm text-high-text">{fileError}</p>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="contract-text" className="sr-only">
            Paste contract text
          </label>
          <textarea
            id="contract-text"
            value={pastedText}
            onChange={(e) => onPastedTextChange(e.target.value)}
            placeholder="Paste the full contract text here — clauses, headings, and all."
            spellCheck={false}
            className="scroll-slim h-56 w-full resize-y rounded-xl border border-ink-200 bg-white px-4 py-3 font-mono text-[13px] leading-relaxed text-ink-800 placeholder:text-ink-400 focus:border-accent-400"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
            <button
              type="button"
              onClick={onLoadSample}
              className="font-medium text-accent-700 hover:text-accent-800"
            >
              Load sample contract
            </button>
            <span>{pastedText.trim().length.toLocaleString()} characters</span>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-400">
          Your document is sent to your own backend for analysis. Not legal advice.
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          className="btn-primary min-w-[160px]"
        >
          {loading ? (
            <>
              <Spinner />
              <span>{progressText}</span>
            </>
          ) : (
            <>
              <SparkleIcon className="h-4 w-4" />
              <span>Analyze contract</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-white text-ink-900 shadow-card'
          : 'text-ink-500 hover:text-ink-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z"
      />
    </svg>
  );
}

/** Format a byte count as a compact human-readable string. */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
