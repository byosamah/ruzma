import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'vendor-form';
            }
            
            // Query libraries
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'utils-date';
            }
            
            // Charts (heavy feature)
            if (id.includes('recharts') || id.includes('d3')) {
              return 'feature-charts';
            }
            
            // Supabase
            if (id.includes('@supabase')) {
              return 'backend-supabase';
            }
            
            // PDF generation (if used)
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'feature-pdf';
            }
            
            // Other utilities
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('nanoid')) {
              return 'utils-misc';
            }
            
            // Remaining vendor code
            return 'vendor-other';
          }
          
          // Application chunks by feature
          if (id.includes('/pages/Analytics') || id.includes('/components/Analytics')) {
            return 'feature-analytics';
          }
          
          if (id.includes('/pages/Profile') || id.includes('/components/Profile')) {
            return 'feature-profile';
          }
          
          if (id.includes('/pages/Projects') || id.includes('/components/Projects') || 
              id.includes('/components/CreateProject') || id.includes('/components/EditProject')) {
            return 'feature-projects';
          }
          
          if (id.includes('/pages/Invoices') || id.includes('/components/Invoices') || 
              id.includes('/components/CreateInvoice')) {
            return 'feature-invoices';
          }
          
          if (id.includes('/pages/Clients') || id.includes('/components/Clients')) {
            return 'feature-clients';
          }
          
          // Shared components in main chunk
          if (id.includes('/components/shared') || id.includes('/lib/')) {
            return 'shared';
          }
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js']
  }
}));
