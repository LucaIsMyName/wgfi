import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { visualizer } from 'rollup-plugin-visualizer'

const ReactCompilerConfig = {
  // React Compiler configuration
  target: '19' as const,
}

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', ReactCompilerConfig],
        ],
      },
    }),
    // Bundle analyzer - only runs during build
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: false,
      template: 'treemap', // Interactive treemap visualization
    }),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Mapbox GL - large mapping library (1.68 MB)
          'mapbox': ['mapbox-gl'],
          // VisX - data visualization libraries
          'visx': [
            '@visx/axis',
            '@visx/event',
            '@visx/group',
            '@visx/legend',
            '@visx/responsive',
            '@visx/scale',
            '@visx/shape',
            '@visx/tooltip',
          ],
          // Radix UI - component primitives
          'radix': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
          ],
          // Core vendor libraries
          'vendor': ['react', 'react-dom'],
          // Router
          'router': ['react-router-dom'],
        },
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
