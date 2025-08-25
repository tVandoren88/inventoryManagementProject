import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from "path";


export default defineConfig({
    plugins: [react()],
    root: "src",
    publicDir: "public",
    build: {
        outDir: "../dist/", // Output to `dist/`
        emptyOutDir: true, // Clears `dist/` before building
        rollupOptions: {
          input: {
            main: resolve(__dirname, "src/index.html"), // Ensure `index.html` is included
          },
        },
    },
    server: {
        port: 5173,
    },
});
