/**
 * TypeScript interfaces mirroring the Clause Lens FastAPI backend response shapes.
 *
 * These types are the single source of truth for the analysis payload and must
 * stay in exact sync with the backend contract (see the POST /api/analyze schema).
 */

/** Severity level for an identified risk. */
export type RiskSeverity = 'high' | 'medium' | 'low';

/** The AI provider currently backing the API, reported by GET /api/health. */
export type Provider = 'anthropic' | 'mock';

/** Response of GET /api/health. */
export interface HealthResponse {
  status: string;
  provider: Provider;
}

/** A named entity that is a party to the contract. */
export interface Party {
  name: string;
  role: string;
}

/** A date of significance found in the contract (effective date, deadline, etc.). */
export interface KeyDate {
  label: string;
  date: string;
  note: string;
}

/** An obligation imposed on a party, with a pointer back to the source clause. */
export interface Obligation {
  party: string;
  obligation: string;
  clauseReference: string;
}

/** A risk the analyzer identified, color-coded by severity in the UI. */
export interface Risk {
  id: string;
  title: string;
  severity: RiskSeverity;
  clauseReference: string;
  explanation: string;
  recommendation: string;
}

/** A clause that is expected but absent from the contract. */
export interface MissingClause {
  clause: string;
  whyItMatters: string;
}

/** Full response of POST /api/analyze. */
export interface AnalysisResult {
  documentType: string;
  summary: string;
  parties: Party[];
  keyDates: KeyDate[];
  obligations: Obligation[];
  risks: Risk[];
  missingClauses: MissingClause[];
  mock: boolean;
}

/** Error body returned by the backend on failure (e.g. 502). */
export interface ApiErrorBody {
  detail: string;
}
