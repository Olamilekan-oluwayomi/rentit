/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "stats.html",
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    exclude: ['src/test/e2e/**', 'node_modules/**'],
    // Supabase's createClient throws at module load if the URL/key are
    // missing, which would fail any suite that imports the real client. These
    // placeholders keep tests hermetic — no real credentials, and no .env
    // required — so `vitest run` behaves the same on a laptop and in CI.
    // Suites that care about data mock ./shared/lib/supabase anyway.
    env: {
      VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'placeholder-publishable-key',
      VITE_VAPID_PUBLIC_KEY: 'placeholder-vapid-public-key',
      // Mirrors the free-tier default in README. Pinned explicitly so a
      // developer's local .env cannot silently change what tests exercise.
      VITE_IMAGE_TRANSFORMS: 'off',
    },
  },
});