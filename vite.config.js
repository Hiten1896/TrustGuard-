import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('exifr') || id.includes('fflate') || id.includes('jsqr') || id.includes('suncalc')) return 'forensic-engines';
            return 'vendor';
          }
        }
      }
    }
  },
});
