import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['pouchdb', 'pouchdb-find', 'crypto-pouch']
  },
  resolve: {
    alias: {
      'pouchdb': 'pouchdb/dist/pouchdb.js'
    }
  }
});
