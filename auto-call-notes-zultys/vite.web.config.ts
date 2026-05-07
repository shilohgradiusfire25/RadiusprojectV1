import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const configuredBase = process.env.VITE_PUBLIC_BASE;

export default defineConfig({
  plugins: [react()],
  base: configuredBase ?? (repoName ? `/${repoName}/` : '/'),
  build: {
    outDir: 'dist-web',
    emptyOutDir: true
  }
});
