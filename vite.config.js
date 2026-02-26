import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Better code splitting for optimal caching
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue-vendor'
            }
            if (id.includes('vue-router')) {
              return 'router-vendor'
            }
            // Other vendor libraries
            return 'vendor'
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Disable source maps for smaller bundle
    sourcemap: false,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for smaller bundle
    target: 'es2015',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router'],
    exclude: [],
  },
  // Server configuration for development
  server: {
    hmr: true,
    // Enable HTTP/2 for better performance
    http2: false, // Set to true if you have SSL certificate
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
