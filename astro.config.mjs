// @ts-check
import { defineConfig } from 'astro/config';
import auth from 'auth-astro';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://deredaya.com',

  integrations: [
    auth()
  ],
  output: 'server',
  adapter: vercel(),
});