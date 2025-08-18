import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Or other framework plugin

export default defineConfig({
  plugins: [react()],
  base: '/path-finding_visualization/'
});