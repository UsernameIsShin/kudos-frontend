import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginRequest, LoginResponse, UserInfo } from '@/shared/types/auth'
import { apiClient } from '@/shared/api/client'
import logger from '@/shared/utils/logger'

interface AuthActions {
    login: (credentials: LoginRequest) => Promise<LoginResponse>
    logout: () => void
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

            logout: async () => {
                const { accessToken } = get();
                try {
                    if (accessToken) {
                        await apiClient.post('/auth/logout');
                    }
                } catch (error) {
                    logger.error('Server logout failed:', error);
                } finally {
                    set({
                        user: null,
                        accessToken: null,
                        isAuthenticated: false,
                        error: null
                    });
                }
            },

            setUser: (user: UserInfo | null) => set({ user }),

            setAccessToken: (accessToken: string | null) =>
                set({ accessToken, isAuthenticated: !!accessToken }),

            clearAuth: () => set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
                error: null
            }),

            initializeAuth: () => {
                const state = get()
                if (state.accessToken && state.user) {
                    set({ isAuthenticated: true })
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