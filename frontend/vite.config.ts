import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const sourcePath = (path: string) => fileURLToPath(new URL(`./src/${path}`, import.meta.url));

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'cross-system-reasoning',
              test: /features[\\/]cross-system-reasoning[\\/]/,
            },
          ],
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': sourcePath(''),
      '@app': sourcePath('app'),
      '@pages': sourcePath('pages'),
      '@features': sourcePath('features'),
      '@widgets': sourcePath('widgets'),
      '@entities': sourcePath('entities'),
      '@shared': sourcePath('shared'),
      '@styles': sourcePath('styles'),
      '@assets': sourcePath('assets'),
      '@hooks': sourcePath('hooks'),
      '@services': sourcePath('services'),
      '@store': sourcePath('store'),
      '@router': sourcePath('router'),
      '@types': sourcePath('types'),
      '@config': sourcePath('config'),
      '@utils': sourcePath('utils'),
    },
  },
});
