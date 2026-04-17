import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['pumpprice-favicon.svg', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Pumpprice',
        short_name: 'Pumpprice',
        description: 'Pumpprice: Route-based fuel savings',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'pumpprice-favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pumpprice-favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    allowedHosts: true,
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  },
  preview: {
    allowedHosts: true
  }
})
