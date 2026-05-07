import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const configuredBase = process.env.VITE_PUBLIC_BASE;

export default defineConfig({
  plugins: [react()],
  base: configuredBase ?? (repoName ? `/${repoName}/` : '/'),
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    outDir: 'dist-web',
    emptyOutDir: true
  }
});
