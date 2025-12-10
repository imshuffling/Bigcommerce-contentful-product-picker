import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Enables Jest-like global test functions (test, expect)
    environment: 'jsdom', // Simulates a browser for component tests
    setupFiles: './src/setupTests.ts', // Equivalent to Jest's setup file
  },
  base: '',
  build: {
    outDir: 'dist',
  },
  server: {
    host: 'localhost',
    port: 3001,
    strictPort: true,
    // Contentful requires HTTPS for app iframes, but will allow HTTP for localhost in development
    // If you need HTTPS locally, uncomment the https option below
    // https: {
    //   key: fs.readFileSync('./.cert/key.pem'),
    //   cert: fs.readFileSync('./.cert/cert.pem'),
    // },
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});
