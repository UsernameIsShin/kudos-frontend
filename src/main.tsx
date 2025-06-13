import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import './shared/i18n/i18n.ts'

// QueryClient 생성 (중복 요청 제거 및 단기 캐싱으로 최적화)
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000, // 1초간 중복 요청 방지
            gcTime: 5000, // 5초간 캐시 유지 (메모리 효율성)
            refetchOnMount: false, // 마운트 시 자동 리페치 비활성화
            refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 비활성화
            refetchOnReconnect: true, // 네트워크 재연결 시 자동 재시도
            networkMode: 'always', // 네트워크 상태와 관계없이 실행
            retry: (failureCount, error: any) => {
                // 401, 403 에러는 재시도하지 않음
                if (error?.response?.status === 401 || error?.response?.status === 403) {
                    return false;
                }
                return failureCount < 2;
            },
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
) 