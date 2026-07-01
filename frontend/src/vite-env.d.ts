/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Clause Lens FastAPI backend. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
