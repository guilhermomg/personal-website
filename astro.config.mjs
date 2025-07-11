// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://gonzalez.dev.br',
  integrations: [
    tailwind(),
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          fr: 'fr',
          pt: 'pt'
        }
      }
    })
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'pt'],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
