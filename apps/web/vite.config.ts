import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4010',
    },
  },
  resolve: {
    alias: {
      '@ui': '../../packages/ui/src',
      '@api': '../../packages/api/src',
      '@types': '../../packages/types/src',
    },
  },
});
