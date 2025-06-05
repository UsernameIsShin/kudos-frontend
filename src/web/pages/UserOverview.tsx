import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/shared/stores/authStore'
import { FileText, Calendar, TrendingUp, Clock } from 'lucide-react'
import logger from '@/shared/utils/logger'

export default function UserOverview() {
    const { t } = useTranslation(['common', 'user', 'overview'])
    const { user } = useAuthStore()

    const [userStats, setUserStats] = useState({
        documentsCreated: 45,
        tasksCompleted: 23,
        hoursWorked: 156,
        productivity: 88.5
    })

    const [recentActivities] = useState([
        { id: 1, action: t('user:overview.activities.documentAction'), item: '프로젝트 계획서.docx', time: t('common:time.hoursAgo', { count: 2 }), type: 'document' },
        { id: 2, action: t('user:overview.activities.taskAction'), item: 'UI 디자인 검토', time: t('common:time.hoursAgo', { count: 4 }), type: 'task' },
        { id: 3, action: t('user:overview.activities.meetingAction'), item: '주간 팀 미팅', time: t('common:time.daysAgo', { count: 1 }), type: 'meeting' },
        { id: 4, action: t('user:overview.activities.reportAction'), item: '월간 성과 보고서', time: t('common:time.daysAgo', { count: 2 }), type: 'report' },
    ])

    const [myData] = useState([
        { id: 1, project: '웹사이트 리뉴얼', status: t('common:status.inProgress'), progress: 75, dueDate: '2024-02-15' },
        { id: 2, project: '모바일 앱 개발', status: t('common:status.completed'), progress: 100, dueDate: '2024-01-30' },
        { id: 3, project: 'API 문서화', status: t('common:status.pending'), progress: 25, dueDate: '2024-02-20' },
        { id: 4, project: '데이터베이스 최적화', status: t('common:status.inProgress'), progress: 60, dueDate: '2024-02-10' },
    ])

    useEffect(() => {
        logger.debug("UserOverview mounted, user:", user);
        const timer = setTimeout(() => {
            setUserStats(prev => ({
                ...prev,
                productivity: Math.random() * 100
            }))
        }, 1000)

        return () => clearTimeout(timer)
    }, [user])

    const statCards = [
        {
            title: t('user:overview.stats.documentsCreated'),
            value: userStats.documentsCreated.toString(),
            icon: <FileText className="w-6 h-6" />,
            color: 'bg-blue-500',
            change: t('user:overview.stats.thisWeekChange', { count: 3 })
        },
        {
            title: t('user:overview.stats.tasksCompleted'),
            value: userStats.tasksCompleted.toString(),
            icon: <Calendar className="w-6 h-6" />,
            color: 'bg-green-500',
            change: t('user:overview.stats.thisWeekChange', { count: 5 })
        },
        {
            title: t('user:overview.stats.hoursWorked'),
            value: `${userStats.hoursWorked}h`,
            icon: <Clock className="w-6 h-6" />,
            color: 'bg-purple-500',
            change: t('user:overview.stats.thisWeekHoursChange', { count: 12 })
        },
        {
            title: t('user:overview.stats.productivity'),
            value: `${userStats.productivity.toFixed(1)}%`,
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-orange-500',
            change: t('user:overview.stats.thisWeekPercentageChange', { value: 2.3 })
        }
    ]

    const getStatusColor = (status: string) => {
        if (status === t('common:status.completed')) return 'bg-green-100 text-green-800'
        if (status === t('common:status.inProgress')) return 'bg-blue-100 text-blue-800'
        if (status === t('common:status.pending')) return 'bg-yellow-100 text-yellow-800'
        return 'bg-gray-100 text-gray-800'
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'document':
                return '📄'
            case 'task':
                return '✅'
            case 'meeting':
                return '🤝'
            case 'report':
                return '📊'
            default:
                return '📋'
        }
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {t('user:overview.title')}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {t('user:overview.greeting', { name: user?.userName || user?.userId })}
                    </p>
                </div>
                <button className="btn-primary">
                    {t('common:export')}
                </button>
            </div>

            {/* User Statistics */}
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
                {/* My Projects */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('user:overview.myData')}
                    </h3>

                    <div className="space-y-4">
                        {myData.map((project) => (
                            <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-sm font-medium text-gray-900">{project.project}</h4>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                                        {project.status}
                                    </span>
                                </div>

                                <div className="mt-2">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>진행률</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mt-2">
                                    마감일: {project.dueDate}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Personal Statistics Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('user:overview.myStats')}
                    </h3>

                    {/* Chart placeholder */}
                    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center text-gray-500">
                            <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                            <p>개인 통계 차트</p>
                            <p className="text-sm">Kendo UI Chart가 여기에 표시됩니다</p>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">95%</p>
                            <p className="text-xs text-blue-500">작업 완료율</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">4.8</p>
                            <p className="text-xs text-green-500">평균 평점</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('user:overview.recentActivitiesTitle')}
                </h3>

                <div className="space-y-3">
                    {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex-shrink-0 text-2xl">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {activity.action}: {activity.item}
                                </p>
                                <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 text-center">
                    <button className="btn-outline">
                        {t('user:overview.viewAllActivities')}
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('user:overview.quickActionsTitle')}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-blue-900">새 문서</p>
                    </button>

                    <button className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                        <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-900">일정 추가</p>
                    </button>

                    <button className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                        <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-purple-900">보고서</p>
                    </button>

                    <button className="p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                        <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-orange-900">시간 기록</p>
                    </button>
                </div>
            </div>
        </div>
    )
} 