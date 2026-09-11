import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (!res.headersSent && res.writeHead) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy connection error', details: err.message }));
            }
          });
        },
      },
      '/website': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return '/index.html';
          }
        },
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (!res.headersSent && res.writeHead) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy connection error', details: err.message }));
            }
          });
        },
      },
      '/admin': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return '/index.html';
          }
        },
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (!res.headersSent && res.writeHead) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy connection error', details: err.message }));
            }
          });
        },
      },
      '/ontime': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return '/index.html';
          }
        },
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (!res.headersSent && res.writeHead) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy connection error', details: err.message }));
            }
          });
        },
      },
      '/products': 'http://127.0.0.1:3000',
      '/login': 'http://127.0.0.1:3000',
      '/register': 'http://127.0.0.1:3000',
      '/addUser': 'http://127.0.0.1:3000',
      '/addInventory': 'http://127.0.0.1:3000',
      '/updateInventory': 'http://127.0.0.1:3000',
      '/deleteInventory': 'http://127.0.0.1:3000',
      '/getInventory': 'http://127.0.0.1:3000',
      '/checkout': 'http://127.0.0.1:3000',
      '/getOrders': 'http://127.0.0.1:3000',
      '/getUsers': 'http://127.0.0.1:3000',
      '/public': 'http://127.0.0.1:3000',
    },
  },
});
