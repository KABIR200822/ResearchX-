import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves this project from /ResearchX/, not the domain root.
  base: '/ResearchX/',
  plugins: [react()],
});
