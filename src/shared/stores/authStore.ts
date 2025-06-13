import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginRequest, LoginResponse, UserInfo } from '@/shared/types/auth'
import { apiClient } from '@/shared/api/client'
import logger from '@/shared/utils/logger'

interface AuthActions {
    login: (credentials: LoginRequest) => Promise<LoginResponse>
    logout: (options?: { skipServerCall?: boolean, reason?: string }) => void
    setUser: (user: UserInfo | null) => void
    setAccessToken: (accessToken: string | null) => void
    clearAuth: () => void
    initializeAuth: () => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
}

interface AppAuthState {
    user: UserInfo | null
    accessToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

type AuthStore = AppAuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            login: async (credentials: LoginRequest) => {
                set({ isLoading: true, error: null })

                try {
                    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
                    const { accessToken, userInfo } = response.data

                    logger.info('✅ 로그인 성공:', {
                        userId: userInfo?.userId,
                        hasAccessToken: !!accessToken,
                        tokenLength: accessToken?.length || 0,
                        responseStatus: response.status,
                        responseHeaders: response.headers,
                        setCookieHeader: response.headers['set-cookie'], // 쿠키 설정 여부 확인
                        allHeaderKeys: Object.keys(response.headers || {}),
                        requestConfig: {
                            url: response.config?.url,
                            baseURL: response.config?.baseURL,
                            withCredentials: response.config?.withCredentials
                        }
                    })

                    set({
                        user: userInfo,
                        accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    })


                    return response.data
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || 'Login failed'
                    set({
                        isLoading: false,
                        error: errorMessage
                    })
                    throw error
                }
            },

            logout: async (options?: { skipServerCall?: boolean, reason?: string }) => {
                const { accessToken } = get();
                const { skipServerCall = false, reason = 'manual' } = options || {};

                logger.info('🚪 로그아웃 시작:', {
                    reason,
                    skipServerCall,
                    hasAccessToken: !!accessToken,
                    userId: get().user?.userId
                });

                try {
                    // Refresh token 실패나 세션 만료로 인한 로그아웃인 경우 서버 호출 스킵
                    if (!skipServerCall && accessToken) {
                        logger.info('📤 서버 로그아웃 API 호출...');
                        await apiClient.post('/auth/logout');
                        logger.info('✅ 서버 로그아웃 완료');
                    } else {
                        logger.info('⏭️ 서버 로그아웃 API 호출 스킵:', {
                            reason: skipServerCall ? 'skipServerCall=true' : 'No access token'
                        });
                    }
                } catch (error: any) {
                    logger.error('❌ 서버 로그아웃 실패:', {
                        error: error.message,
                        status: error.response?.status
                    });
                } finally {
                    // 로컬 스토리지와 상태를 완전히 클리어
                    localStorage.removeItem('auth-storage');
                    set({
                        user: null,
                        accessToken: null,
                        isAuthenticated: false,
                        error: null
                    });

                    logger.info('🧹 클라이언트 인증 상태 클리어 완료');
                }
            },

            setUser: (user: UserInfo | null) => set({ user }),

            setAccessToken: (accessToken: string | null) => {
                logger.info('🔑 Access token 업데이트:', {
                    hasToken: !!accessToken,
                    tokenLength: accessToken?.length || 0,
                    userId: get().user?.userId
                })
                set({
                    accessToken,
                    isAuthenticated: !!accessToken && !!get().user,
                    error: null // 토큰 갱신 성공 시 에러 클리어
                })
            },

            clearAuth: () => {
                // 로컬 스토리지도 함께 클리어
                localStorage.removeItem('auth-storage');
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            initializeAuth: () => {
                const state = get()
                // 저장된 토큰과 사용자 정보가 모두 있을 때만 인증 상태로 설정
                if (state.accessToken && state.user && state.user.userId) {
                    set({ isAuthenticated: true, error: null })
                    logger.info('Auth initialized with stored token for user:', state.user.userId)
                } else {
                    // 불완전한 인증 정보가 있으면 클리어
                    if (state.accessToken || state.user) {
                        logger.warn('Incomplete auth data found, clearing...')
                        localStorage.removeItem('auth-storage');
                        set({
                            user: null,
                            accessToken: null,
                            isAuthenticated: false,
                            error: null
                        });
                    }
                }
            },

            setLoading: (loading: boolean) => set({ isLoading: loading }),

            setError: (error: string | null) => set({ error })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)
