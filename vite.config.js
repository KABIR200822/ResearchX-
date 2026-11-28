import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project from /ResearchX/.
// Vercel serves it from the domain root.
const base = process.env.VERCEL ? '/' : '/ResearchX/';

export default defineConfig({
  base,
  plugins: [react()],
});
