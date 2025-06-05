import { BrowserRouter as Router, useRoutes } from 'react-router-dom'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'


import NotFoundPage from '@/shared/components/NotFoundPage'

import { useAuthStore } from '@/shared/stores/authStore'

import adminRoutes from '@/admin/routes/AdminRoutes'
import userRoutes from '@/web/routes/UserRoutes'
import publicRoutes from '@/shared/routes/PublicRoutes'

// AppRoutes 컴포넌트: useRoutes를 사용하여 라우트 객체를 렌더링
function AppRoutes() {
    const allRoutes = [
        ...publicRoutes,
        ...adminRoutes,
        ...userRoutes,
        // 일치하는 경로가 없을 때 보여줄 404 라우트 (가장 마지막에 위치)
        { path: "*", element: <NotFoundPage /> }
    ]
    const element = useRoutes(allRoutes)
    return element
}

function App() {
    const { i18n } = useTranslation()
    const { initializeAuth } = useAuthStore()

    useEffect(() => {
        // Initialize authentication state from localStorage
        initializeAuth()

        // Initialize language from localStorage
        const savedLanguage = localStorage.getItem('language') || 'ko'
        i18n.changeLanguage(savedLanguage)
    }, [initializeAuth, i18n])

    const future = {
        v7_relativeSplatPath: true,
        v7_startTransition: true
    }

    return (
        <Router future={future}>
            <AppRoutes />
        </Router>
    )
}

export default App 