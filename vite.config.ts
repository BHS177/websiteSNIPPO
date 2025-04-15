import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8081,
    strictPort: true,
    hmr: {
      overlay: false // Disable the HMR overlay to reduce overhead
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'framer-motion'],
          'ui': ['@radix-ui/react-toast', '@radix-ui/react-dialog']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    exclude: ['@radix-ui/react-toast']
  },
  plugins: [
    react({
      plugins: [],
      swcOptions: {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
              development: mode === 'development',
              refresh: mode === 'development'
            }
          }
        }
      }
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
