// Makes the app icons (for phones and browsers) from public/icon.svg.
// Run again after changing the icon: npx pwa-assets-generator
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    // iPhone home-screen icon on the same dark background as the app.
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#16171d' } },
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#16171d' } },
  },
  images: ['public/icon.svg'],
})
