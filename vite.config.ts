import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Relative assets work at both /bringbackthedab.com/ and a custom-domain root.
export default defineConfig({ base: './', plugins: [react()] });
