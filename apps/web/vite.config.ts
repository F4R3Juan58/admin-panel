import path from 'path';
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
      '@ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@api': path.resolve(__dirname, '../../packages/api/src'),
      '@types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
});
