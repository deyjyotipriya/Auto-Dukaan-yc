import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    hmr: {
      clientPort: 443,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Reduce chunk size for better performance
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dropdown-menu', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
        }
      }
    }
  },
  // Re-enable optimization for lucide-react
  // optimizeDeps: {
  //   exclude: ['lucide-react'],
  // },
});
