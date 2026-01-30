/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly GITHUB_USERNAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
