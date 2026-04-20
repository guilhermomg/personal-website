/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly GITHUB_USERNAME: string;
  readonly BLOB_READ_WRITE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
