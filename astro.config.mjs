import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Deployment target is configured through environment variables so that local
// builds (and the browser test server) keep serving from the root, while the
// GitHub Pages workflow builds for https://<user>.github.io/<repo>/.
const site = process.env.SITE_URL;
const base = process.env.BASE_PATH;

export default defineConfig({
  output: 'static',
  integrations: [mdx()],
  devToolbar: { enabled: false },
  // Absolute origin enables canonical/social URLs.
  ...(site ? { site } : {}),
  // Sub-path deployments (GitHub Pages project sites) need a base path.
  ...(base ? { base } : {}),
});
