import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            // Gracefully catch backend connection refusal so terminal doesn't spam stack traces
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                status: 'offline',
                message: 'Backend server on port 8001 is offline. Operating in client-side LocalStorage mode.',
              }));
            }
          });
        },
      },
    },
  },
});
