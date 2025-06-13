import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/shared/types/auth'
import { useAuthStore } from '@/shared/stores/authStore'
import logger from '@/shared/utils/logger'

// 세션 만료 메시지를 표시하고 5초 후 로그인 페이지로 이동하는 헬퍼
const showSessionExpiredCountdown = (message: string, seconds = 5) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    // 이미 표시 중이면 중복으로 생성하지 않음
    if (document.getElementById('session-expired-modal')) return

    const overlay = document.createElement('div')
    overlay.id = 'session-expired-modal'
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 1.5rem;
        z-index: 9999;
    `

    const msgEl = document.createElement('div')
    msgEl.textContent = message

    const counterEl = document.createElement('div')
    counterEl.style.marginTop = '1rem'
    counterEl.textContent = String(seconds)

    overlay.appendChild(msgEl)
    overlay.appendChild(counterEl)
    document.body.appendChild(overlay)

    const timer = setInterval(() => {
        seconds -= 1
        if (seconds <= 0) {
            clearInterval(timer)
            window.location.href = '/login'
        } else {
            counterEl.textContent = String(seconds)
        }
    }, 1000)
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // HttpOnly 쿠키를 주고받기 위해 필요
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const { accessToken, user, isAuthenticated } = useAuthStore.getState()

        // 인증이 필요하지 않은 요청들
        const noAuthRequired = ['/auth/login', '/auth/refresh', '/auth/register', '/auth/forgot-password']
        const isAuthNotRequired = noAuthRequired.some(path => config.url?.includes(path))

        // 인증된 상태이고 토큰이 있으며, 인증이 필요한 요청인 경우에만 토큰 추가
        if (accessToken && user && isAuthenticated && !isAuthNotRequired) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        // Refresh token 요청 시 상세 로깅
        if (config.url?.includes('/auth/refresh')) {
            logger.info('📤 Refresh token 요청 전송:', {
                url: config.url,
                fullUrl: `${config.baseURL}${config.url}`,
                method: config.method?.toUpperCase(),
                withCredentials: config.withCredentials,
                headers: {
                    'Content-Type': config.headers['Content-Type'],
                    'Accept': config.headers['Accept'],
                    'Authorization': config.headers['Authorization'] ? '***Bearer token present***' : 'None'
                },
                timestamp: new Date().toISOString()
            })
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle token refresh
// ⚠️ 주의사항: HTTP-only 쿠키 기반 refresh token 사용 시
// 1. 서버에서 refresh token을 HTTP-only 쿠키로 설정해야 함
// 2. withCredentials: true 설정 필수
// 3. 로그아웃 시 서버에서 쿠키를 삭제하므로, refresh 실패 시에는 서버 logout API 호출 금지
// 4. CORS 설정에서 credentials: true 허용 필요
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

        // 인증이 필요하지 않은 요청들 (토큰 갱신 로직 제외)
        const noAuthRequired = ['/auth/login', '/auth/refresh', '/auth/register', '/auth/forgot-password']
        const isAuthNotRequired = noAuthRequired.some(path => originalRequest.url?.includes(path))

        // Handle 401 errors (token expired) - but skip for auth-related requests
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthNotRequired && authStore.accessToken) {
            logger.warn('🔑 401 에러 감지 - Refresh token 시도:', {
                originalUrl: originalRequest.url,
                hasAccessToken: !!authStore.accessToken,
                isAuthenticated: authStore.isAuthenticated,
                user: authStore.user?.userId,
                errorMessage: (error.response?.data as any)?.message || error.message
            })
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
                logger.info('🔄 Refresh token 시작:', {
                    originalUrl: originalRequest.url,
                    hasAccessToken: !!authStore.accessToken,
                    refreshEndpoint: '/auth/refresh',
                    withCredentials: true,
                    baseURL: import.meta.env.VITE_API_BASE_URL,
                    userAgent: navigator.userAgent.substring(0, 100)
                })

                const refreshResponse = await axios.post('/auth/refresh', {}, {
                    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
                    withCredentials: true, // HttpOnly 쿠키 전송
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                })

                logger.info('✅ Refresh token 응답 성공:', {
                    status: refreshResponse.status,
                    responseData: refreshResponse.data,
                    hasAccessToken: !!refreshResponse.data?.accessToken,
                    responseKeys: Object.keys(refreshResponse.data || {})
                })

                // 응답 구조 검증
                if (!refreshResponse.data || !refreshResponse.data.accessToken) {
                    throw new Error(`Invalid refresh response structure: ${JSON.stringify(refreshResponse.data)}`)
                }

                const newAccessToken = refreshResponse.data.accessToken

                // authStore 상태 업데이트
                authStore.setAccessToken(newAccessToken)

                // 원본 요청에 새 토큰 적용
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                // 대기 중인 요청들 처리
                processQueue(null, newAccessToken)

                logger.info('🚀 Refresh token 완료, 원본 요청 재시도:', {
                    newTokenLength: newAccessToken.length,
                    originalRequestUrl: originalRequest.url
                })

                return apiClient(originalRequest)
            } catch (refreshError: any) {
                logger.error('❌ Refresh token 실패:', {
                    error: refreshError.message,
                    status: refreshError.response?.status,
                    statusText: refreshError.response?.statusText,
                    responseData: refreshError.response?.data,
                    responseHeaders: refreshError.response?.headers,
                    requestConfig: {
                        url: refreshError.config?.url,
                        method: refreshError.config?.method,
                        withCredentials: refreshError.config?.withCredentials,
                        baseURL: refreshError.config?.baseURL
                    },
                    refreshUrl: '/auth/refresh',
                    hasCredentials: true,
                    cookieHint: 'HTTP-only 쿠키가 전송되지 않았을 가능성이 높습니다. debugCookies() 함수로 확인하세요.'
                })

                processQueue(refreshError, null)

                // authStore에서 로그아웃 처리 (서버 API 호출 스킵 - 이미 refresh token이 유효하지 않음)
                authStore.logout({
                    skipServerCall: true,
                    reason: 'refresh_token_failed'
                })

                // 현재 페이지가 로그인 페이지가 아닌 경우에만 알림 및 리다이렉트
                if (!window.location.pathname.includes('/login')) {
                    // refresh 실패 원인에 따른 다른 메시지
                    let message = '세션이 만료되었습니다. 다시 로그인해 주세요.'
                    if (refreshError.response?.status === 401) {
                        message = 'Refresh Token이 만료되었습니다. 다시 로그인해 주세요.'
                    } else if (refreshError.response?.status === 403) {
                        message = '인증 권한이 없습니다. 다시 로그인해 주세요.'
                    } else if (!refreshError.response) {
                        message = '서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.'
                    }

                    // 세션 만료 메시지를 표시하고 5초 후 로그인 페이지로 이동
                    showSessionExpiredCountdown(message)
                }

                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // 401 에러이지만 refresh token을 시도하지 않는 경우 로그
        if (error.response?.status === 401) {
            logger.warn('⚠️ 401 에러 발생 - Refresh token 시도 안함:', {
                originalUrl: originalRequest.url,
                hasAccessToken: !!authStore.accessToken,
                isRetry: !!originalRequest._retry,
                isAuthNotRequired,
                noAuthRequiredPaths: ['/auth/login', '/auth/refresh', '/auth/register', '/auth/forgot-password'],
                reason: !authStore.accessToken ? 'No access token' :
                    originalRequest._retry ? 'Already retried' :
                        isAuthNotRequired ? 'Auth not required for this endpoint' : 'Unknown'
            })
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