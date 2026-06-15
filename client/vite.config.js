import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          markdown: ['react-markdown', 'remark-gfm', 'react-syntax-highlighter'],
          pdf: ['@react-pdf-viewer/core', '@react-pdf-viewer/default-layout', 'pdfjs-dist'],
        }
      },
      onwarn(warning, warn) {
        // Suppress "use of eval" warnings from pdfjs-dist
        if (warning.code === 'EVAL' && warning.id && warning.id.includes('pdfjs-dist')) {
          return;
        }
        warn(warning);
      }
    }
  }
});
