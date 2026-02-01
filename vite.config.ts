import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  server: {
    port: 5006,
    host: '0.0.0.0',
    strictPort: true,
  },
  preview: {
    port: 5006,
    host: '0.0.0.0',
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
});
