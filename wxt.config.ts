import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'JWT Workbench',
    description: 'Encode, decode, and manage JWTs with reusable projects and a secret library',
    permissions: ['sidePanel', 'storage', 'clipboardRead'],
    action: {
      default_title: 'JWT Workbench',
    },
  },
});
