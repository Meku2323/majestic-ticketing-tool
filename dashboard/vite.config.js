import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5555 // This locks your custom dashboard to port 5555 permanently!
  }
});
