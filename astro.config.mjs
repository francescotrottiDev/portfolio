import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',
  integrations: [mdx()],
  devToolbar: { enabled: false },
  // Set the real deployed origin to enable absolute canonical/social URLs.
  ...(process.env.SITE_URL ? { site: process.env.SITE_URL } : {}),
});
