import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Activity, TrendingUp, Database } from 'lucide-react'
import logger from '@/shared/utils/logger'

// Kendo UI imports (placeholder for now)
// import { Grid, GridColumn } from '@progress/kendo-react-grid'
// import { Chart, ChartSeries } from '@progress/kendo-react-charts'

export default function AdminDashboard() {
    const { t } = useTranslation(['common', 'admin', 'dashboard'])
    const [stats, setStats] = useState({
        totalUsers: 1234,
        activeUsers: 987,
        totalSessions: 5678,
        growth: 12.5
    })

    const [users] = useState([
        { id: 1, name: '홍길동', email: 'hong@example.com', role: t('admin:roles.user'), status: t('common:status.active'), lastLogin: '2024-01-15' },
        { id: 2, name: '김철수', email: 'kim@example.com', role: t('admin:roles.manager'), status: t('common:status.active'), lastLogin: '2024-01-14' },
        { id: 3, name: '박영희', email: 'park@example.com', role: t('admin:roles.user'), status: t('common:status.inactive'), lastLogin: '2024-01-10' },
        { id: 4, name: '이민수', email: 'lee@example.com', role: t('admin:roles.user'), status: t('common:status.active'), lastLogin: '2024-01-15' },
    ])

    const [activities] = useState([
        { time: t('common:time.minutesAgo', { count: 30 }), user: '홍길동', action: t('admin:activities.login'), details: 'Web 브라우저에서 로그인' },
        { time: t('common:time.minutesAgo', { count: 35 }), user: '김철수', action: t('admin:activities.dataEdit'), details: '사용자 프로필 업데이트' },
        { time: t('common:time.minutesAgo', { count: 40 }), user: '박영희', action: t('admin:activities.fileUpload'), details: '문서.pdf 업로드 완료' },
        { time: t('common:time.minutesAgo', { count: 45 }), user: '이민수', action: t('admin:activities.reportGen'), details: '월간 통계 보고서 생성' },
    ])

    useEffect(() => {
        logger.debug("AdminDashboard mounted")
        // Simulate data loading
        const timer = setTimeout(() => {
            setStats(prev => ({
                ...prev,
                growth: Math.random() * 20
            }))
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const statCards = [
        {
            title: t('admin:dashboard.stats.totalUsers'),
            value: stats.totalUsers.toLocaleString(),
            icon: <Users className="w-6 h-6" />,
            color: 'bg-blue-500',
            change: '+5.2%'
        },
        {
            title: t('admin:dashboard.stats.activeUsers'),
            value: stats.activeUsers.toLocaleString(),
            icon: <Activity className="w-6 h-6" />,
            color: 'bg-green-500',
            change: '+8.1%'
        },
        {
            title: t('admin:dashboard.stats.totalSessions'),
            value: stats.totalSessions.toLocaleString(),
            icon: <Database className="w-6 h-6" />,
            color: 'bg-purple-500',
            change: '+12.3%'
        },
        {
            title: t('admin:dashboard.stats.growth'),
            value: `${stats.growth.toFixed(1)}%`,
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-orange-500',
            change: '+2.1%'
        }
    ]

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    {t('admin:dashboard.title')}
                </h1>
                <button className="btn-primary">
                    {t('common:refresh')}
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.color} text-white`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users Table */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('admin:dashboard.users')}
                    </h3>

                    {/* Simple table (will be replaced with Kendo Grid) */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        이름
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        권한
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        상태
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        마지막 로그인
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'Active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {user.lastLogin}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('admin:dashboard.activities')}
                    </h3>

                    {/* Simple chart placeholder (will be replaced with Kendo Chart) */}
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center text-gray-500">
                            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                            <p>Kendo UI Chart will be displayed here</p>
                            <p className="text-sm">활동 통계 차트</p>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">최근 활동</h4>
                        {activities.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                        {activity.user} - {activity.action}
                                    </p>
                                    <p className="text-xs text-gray-500">{activity.details}</p>
                                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Analytics */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    시스템 통계
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900">서버 상태</h4>
                        <p className="text-2xl font-bold text-blue-600 mt-2">정상</p>
                        <p className="text-xs text-blue-500 mt-1">응답시간: 120ms</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-900">데이터베이스</h4>
                        <p className="text-2xl font-bold text-green-600 mt-2">연결됨</p>
                        <p className="text-xs text-green-500 mt-1">쿼리시간: 45ms</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-900">메모리 사용률</h4>
                        <p className="text-2xl font-bold text-purple-600 mt-2">68%</p>
                        <p className="text-xs text-purple-500 mt-1">8GB / 12GB</p>
                    </div>
                </div>
            </div>
        </div>
    )
} 