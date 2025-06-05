import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isDevelopment = mode === 'development';

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@/components': path.resolve(__dirname, './src/components'),
                '@/lib': path.resolve(__dirname, './src/lib'),
                '@/assets': path.resolve(__dirname, './src/assets'),
                '@/admin': path.resolve(__dirname, './src/admin'),
                '@/web': path.resolve(__dirname, './src/web'),
                '@/mobile': path.resolve(__dirname, './src/mobile'),
                '@/shared': path.resolve(__dirname, './src/shared'),
                '@/public': path.resolve(__dirname, './public')
            },
        },
        server: {
            port: 3010,
            host: true,
        },
        preview: {
            port: 3010,
            host: true,
        },
        define: {
            __DEV__: isDevelopment,
            __PROD__: !isDevelopment,
        }
    }
}); 