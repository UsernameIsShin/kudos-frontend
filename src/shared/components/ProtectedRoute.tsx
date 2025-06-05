import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/shared/stores/authStore'
import type { Role } from '@/shared/types/auth'

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles: Role[]
    redirectTo?: string
}

export default function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = '/login'
}: ProtectedRouteProps) {
    const { t } = useTranslation()
    const { isAuthenticated, user } = useAuthStore()

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to={redirectTo} replace />
    }

    // Check if user has required role (using only user.roles array)
    const hasRequiredRole = allowedRoles.some(allowedRole =>
        user.roles.includes(allowedRole)
    )

    if (!hasRequiredRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="mb-4">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('auth.accessDenied')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        이 페이지에 접근할 권한이 없습니다.
                    </p>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500">
                            현재 보유 권한: {user.roles.join(', ')}
                        </p>
                        <p className="text-sm text-gray-500">
                            필요 권한: {allowedRoles.join(', ')}
                        </p>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => window.history.back()}
                            className="btn-outline mr-3"
                        >
                            {t('common.back')}
                        </button>
                        <a href="/" className="btn-primary">
                            {t('navigation.home')}
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    return <>{children}</>
} 