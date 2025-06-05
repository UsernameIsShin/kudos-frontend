import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, LogIn, Globe } from 'lucide-react'
import { useAuthStore } from '@/shared/stores/authStore'
import type { LoginRequest } from '@/shared/types/auth'
import { DEFAULT_COMPANY_ID } from '@/shared/config/company';
import logger from '@/shared/utils/logger';

export default function LoginPage() {
    const { t, i18n } = useTranslation(['common', 'auth'])
    const navigate = useNavigate()
    const { login, isLoading, error } = useAuthStore()

    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState<Omit<LoginRequest, 'companyID'> & { password: LoginRequest['password'] }>({
        userID: '',
        password: ''
    })

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ko' ? 'en' : 'ko'
        i18n.changeLanguage(newLang)
        localStorage.setItem('language', newLang)
        logger.debug(`Language changed to: ${newLang}`)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        logger.debug('Login form submitted with data:', formData)

        try {
            const loginData: LoginRequest = {
                companyID: DEFAULT_COMPANY_ID,
                userID: formData.userID,
                password: formData.password
            };
            const response = await login(loginData)
            logger.info('Login successful:', response)
            const userInfo = response.userInfo;

            const isAdmin = userInfo.roles && userInfo.roles.some(
                role => role === 'ADMIN' || role === 'ROLE_ADMIN'
            );

            if (isAdmin) {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/overview');
            }
        } catch (error) {
            logger.error('Login failed:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-bold text-primary-600 mb-2">
                            {t('app.title')}
                        </h1>
                    </Link>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        {t('auth:login')}
                    </h2>
                    <p className="text-gray-600">
                        {t('auth:loginPrompt')}
                    </p>
                </div>

                {/* Language Toggle */}
                <div className="flex justify-center">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
                    >
                        <Globe className="w-4 h-4 mr-2" />
                        {i18n.language === 'ko' ? t('languages.korean') : t('languages.english')}
                    </button>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-600">{typeof error === 'string' ? error : t('auth:loginError')}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="userID" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth:userId')}
                            </label>
                            <input
                                id="userID"
                                name="userID"
                                type="text"
                                required
                                value={formData.userID}
                                onChange={handleInputChange}
                                className="input-field w-full"
                                placeholder={t('auth:userIdPlaceholder')}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('auth:password')}
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="input-field w-full pr-10"
                                    placeholder={t('auth:passwordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary flex items-center justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    {t('auth:loggingIn')}
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <LogIn size={18} className="mr-2" />
                                    {t('auth:loginButton')}
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/"
                            className="text-sm text-primary-600 hover:text-primary-500"
                        >
                            ← {t('navigation.home')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
} 