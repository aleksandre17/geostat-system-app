/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_SIGN_URL: string;
  readonly VITE_API_BASE_URL: string
  // add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
