import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    open: true,
    // Optional: Add basic headers in development
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false,           // Important: Don't expose source maps in production
    target: 'es2020',           // Smaller output, supported by every browser we care about
    cssCodeSplit: true,         // Each route chunk carries only the CSS it needs
    rollupOptions: {
      output: {
        // Optional: Make chunk names less predictable
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },

  // Define global constants
  define: {
    'import.meta.env.VITE_APP_NAME': JSON.stringify('axx-spaces'),
  },
});