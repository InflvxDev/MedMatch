// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // URL pública del sitio (usada para canonical, Open Graph y sitemap).
  // Cámbiala por tu dominio definitivo si difiere.
  site: 'https://medmatch.pages.dev',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],
  adapter: cloudflare()
});