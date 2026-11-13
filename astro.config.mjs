// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { siteOrigin, siteBase, withBase } from './src/config/paths.ts';

const noindexPaths = ['/cookies/', '/privacy/', '/terms/'];

export default defineConfig({
  site: siteOrigin,
  base: siteBase,
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !noindexPaths.map(withBase).includes(new URL(page).pathname),
    }),
  ],
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
