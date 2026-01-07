import { defineConfig } from 'vite';
import nodePath from 'node:path';

export default defineConfig({
    root: nodePath.join(import.meta.dirname, 'frontend'),
    base: '',
    build: {
        outDir: nodePath.join(import.meta.dirname, 'frontend-dist'),
        emptyOutDir: true,
    },
});