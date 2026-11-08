/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// `@` is the desktop app's own source (git submodule in desktop/), so the mobile app runs the same code, not a copy.
const desktopSrc = fileURLToPath(new URL('./desktop/src', import.meta.url))

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  publicDir: 'desktop/public',
  resolve: { alias: { '@': desktopSrc } },
  server: {
    port: 5173,
    strictPort: true,
    // Phones load the dev build over the network (tauri android/ios dev sets TAURI_DEV_HOST).
    host: process.env.TAURI_DEV_HOST || true,
    watch: { ignored: ['**/src-tauri/**', '**/desktop/src-tauri/**'] },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
