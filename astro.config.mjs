import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://skullspace.ca',
  trailingSlash: 'always',
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
