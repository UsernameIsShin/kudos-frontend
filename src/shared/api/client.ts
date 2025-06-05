import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/shared/types/auth'
import { useAuthStore } from '@/shared/stores/authStore'
import logger from '@/shared/utils/logger'

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // HttpOnly 쿠키를 주고받기 위해 필요
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const { accessToken } = useAuthStore.getState()
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle token refresh
let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
        const authStore = useAuthStore.getState()

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
            if (isRefreshing) {
                // 이미 토큰 갱신 중이면, 현재 요청을 큐에 추가
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return apiClient(originalRequest)
                }).catch(err => {
                    return Promise.reject(err)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const refreshResponse = await axios.post('/auth/refresh', {}, {
                    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
                    withCredentials: true, // HttpOnly 쿠키 전송
                })
                logger.info('Token refresh response:', refreshResponse.data)
                const newAccessToken = refreshResponse.data.accessToken
                authStore.setAccessToken(newAccessToken)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                processQueue(null, newAccessToken)
                return apiClient(originalRequest)
            } catch (refreshError: any) {
                processQueue(refreshError, null)
                authStore.logout() // refresh도 실패하면 로그아웃
                // 사용자에게 알림 표시
                alert('세션이 만료되었습니다. 다시 로그인해 주세요.')
                // 로그인 페이지로 리다이렉트
                window.location.href = '/login'
                logger.error('Token refresh failed:', refreshError)
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Handle other errors
        const errorData = error.response?.data as any
        const apiError: ApiError = {
            message: errorData?.message || error.message || 'An error occurred',
            status: error.response?.status || 500,
            code: errorData?.code,
            details: errorData
        }

        return Promise.reject(apiError)
    }
)

export default apiClient 