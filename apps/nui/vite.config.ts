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
      '@ui': '../../packages/ui/src',
      '@api': '../../packages/api/src',
      '@types': '../../packages/types/src',
    },
  },
});
