import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/website': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return '/index.html';
          }
        },
      },
      '/admin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return '/index.html';
          }
        },
      },
      '/ontime': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return '/index.html';
          }
        },
      },
      '/products': 'http://localhost:3000',
      '/login': 'http://localhost:3000',
      '/register': 'http://localhost:3000',
      '/addUser': 'http://localhost:3000',
      '/addInventory': 'http://localhost:3000',
      '/updateInventory': 'http://localhost:3000',
      '/deleteInventory': 'http://localhost:3000',
      '/getInventory': 'http://localhost:3000',
      '/checkout': 'http://localhost:3000',
      '/getOrders': 'http://localhost:3000',
      '/getUsers': 'http://localhost:3000',
      '/public': 'http://localhost:3000',
    },
  },
});
