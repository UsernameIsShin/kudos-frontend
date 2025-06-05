export interface User {
    id: string
    companyId: string
    userId: string
    name: string
    email?: string
    roles: Role[]
    primaryRole: Role
    createdAt: string
    updatedAt: string
}

export type Role = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_USER'

export interface LoginRequest {
    companyID: string
    userID: string
    password: string
}

export interface UserInfo {
    companyId: string
    userId: string
    userName: string
    email: string
    department: string
    roles: string[]
}

export interface LoginResponse {
    accessToken: string
    userInfo: UserInfo
}

export interface RefreshTokenRequest {
    refreshToken: string
}

export interface RefreshTokenResponse {
    accessToken: string
    expiresIn: number
}

export interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

export interface ApiError {
    message: string
    status: number
    code?: string
    details?: unknown
} 