import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'authApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Login': './src/pages/Login.tsx',
        './Signup': './src/pages/Signup.tsx',
        './Sessions': './src/pages/Sessions.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^7.9.5',
        },
        zustand: {
          singleton: true,
          requiredVersion: '^5.0.0',
        },
        '@tanstack/react-query': {
          singleton: true,
          requiredVersion: '^5.0.0',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@react-stack/shared-ui': path.resolve(__dirname, '../../packages/shared-ui/src'),
      '@react-stack/shared-hooks': path.resolve(__dirname, '../../packages/shared-hooks/src'),
      '@react-stack/shared-utils': path.resolve(__dirname, '../../packages/shared-utils/src'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5174,
    strictPort: true,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
