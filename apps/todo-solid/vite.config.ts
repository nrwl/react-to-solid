import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/todo-web-solid',
  plugins: [
    solidPlugin(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
