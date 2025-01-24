import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Configuration plus agressive de la surveillance des fichiers
    watch: {
      usePolling: true,
      interval: 100,
      binaryInterval: 300,
      ignored: ['!**/node_modules/**']
    },
    // Configuration précise du HMR pour Docker
    hmr: {
      // Le host doit être accessible depuis le navigateur
      clientPort: 5173,
      // Nous forçons le protocole WebSocket
      protocol: 'ws',
      // Temps d'attente plus long pour la reconnexion
      timeout: 120000,
      // Nous nous assurons que le HMR est toujours activé
      overlay: true
    }
  }
});