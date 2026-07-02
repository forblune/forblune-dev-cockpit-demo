import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves a project site under /<repo>/; the dev server stays at /.
  base: command === 'build' ? '/forblune-dev-cockpit-demo/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Forblune Dev Cockpit',
        short_name: 'cockpit',
        description:
          "AI-native personal dev cockpit — a public demo of a solo builder's mission control for mission, next action, agents, and infra.",
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: { host: true },
  // Unit tests cover the pure demo-data core + observer derivations (no DOM).
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
}))
