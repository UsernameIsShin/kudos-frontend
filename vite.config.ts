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
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        // React 관련 라이브러리
                        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                        // Kendo UI React 컴포넌트들 (가장 큰 용량을 차지할 것으로 예상)
                        'kendo-vendor': [
                            '@progress/kendo-react-grid',
                            '@progress/kendo-react-buttons',
                            '@progress/kendo-react-dateinputs',
                            '@progress/kendo-react-dropdowns',
                            '@progress/kendo-react-common',
                            '@progress/kendo-react-intl',
                            '@progress/kendo-data-query',
                            '@progress/kendo-licensing',
                            '@progress/kendo-theme-fluent'
                        ],
                        // Radix UI 컴포넌트들
                        'radix-vendor': [
                            '@radix-ui/react-dialog',
                            '@radix-ui/react-popover',
                            '@radix-ui/react-slot'
                        ],
                        // 국제화 관련 라이브러리들
                        'i18n-vendor': [
                            'i18next',
                            'i18next-browser-languagedetector',
                            'i18next-http-backend',
                            'react-i18next'
                        ],
                        // 유틸리티 및 기타 라이브러리
                        'utils-vendor': [
                            '@tanstack/react-query',
                            'axios',
                            'dayjs',
                            'zustand',
                            'embla-carousel-react',
                            'lucide-react',
                            'loglevel',
                            'uuid'
                        ]
                    }
                }
            },
            // chunk 크기 경고 임계값 조정 (기본값: 500KB)
            chunkSizeWarningLimit: 1000,
        }
    }
}); 