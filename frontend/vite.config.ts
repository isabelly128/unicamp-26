import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Single build — main.tsx routes between MemberApp and App (staff)
  // based on window.location.pathname at runtime
  build: {
    outDir: 'dist',
  },
});