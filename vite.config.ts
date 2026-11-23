import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const django = env.VITE_DJANGO_TARGET || 'http://127.0.0.1:8011';
  const proxy = {
    '/api': { target: django, changeOrigin: true, rewrite: (url: string) => url.replace(/^\/api(?=\/|$)/, '') },
    '/media/': { target: django, changeOrigin: true },
  };
  return {
  base: env.VITE_BASE_PATH || '/',
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  server: { host: '127.0.0.1', port: 5199, proxy },
  preview: { proxy },
  build: {
    manifest: true,
    target: 'es2022',
    cssCodeSplit: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
            },
            // Всё ниже нужно только админке блога и грузится лениво.
            { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/ },
            { name: 'editor', test: /node_modules[\\/](@tiptap|prosemirror[^\\/]*|@floating-ui|linkifyjs|orderedmap|rope-sequence|w3c-keyname|markdown-it|entities)[\\/]/ },
            { name: 'transliteration', test: /node_modules[\\/]transliteration[\\/]/ },
          ],
        },
      },
    },
  },
  };
});
