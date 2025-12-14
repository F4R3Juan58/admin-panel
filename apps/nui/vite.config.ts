import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '../../fivem/qb-admin-nui/html',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@api': path.resolve(__dirname, '../../packages/api/src'),
      '@types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
});
