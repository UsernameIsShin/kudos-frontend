import { useTranslation } from 'react-i18next'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <div className="mx-auto w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary-600">404</span>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    페이지를 찾을 수 없습니다
                </h1>

                <p className="text-gray-600 mb-8">
                    요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
                    URL을 다시 확인해주세요.
                </p>

                {/* Action buttons */}
                <div className="space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto btn-outline flex items-center justify-center"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        이전 페이지
                    </button>

                    <a
                        href="/"
                        className="w-full sm:w-auto btn-primary flex items-center justify-center"
                    >
                        <Home size={16} className="mr-2" />
                        {t('navigation.home')}
                    </a>
                </div>

                {/* Additional help text */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        문제가 지속되면 관리자에게 문의해주세요.
                    </p>
                </div>
            </div>
        </div>
    )
} 