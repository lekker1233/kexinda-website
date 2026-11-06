import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './site.config.mjs';

export default defineConfig({
  ...(SITE.url ? { site: SITE.url } : {}),
  integrations: SITE.url ? [sitemap()] : [],
  trailingSlash: 'ignore',
});
