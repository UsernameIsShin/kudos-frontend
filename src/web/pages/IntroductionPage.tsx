import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Globe, Shield, Smartphone, BarChart3, Users, Zap } from 'lucide-react'
import logger from '@/shared/utils/logger'

export default function IntroductionPage() {
    const { t, i18n } = useTranslation(['common', 'introduction'])

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ko' ? 'en' : 'ko'
        i18n.changeLanguage(newLang)
        localStorage.setItem('language', newLang)
        logger.debug(`Language changed to: ${newLang}`)
    }

    const features = [
        {
            icon: <Smartphone className="w-6 h-6" />,
            title: t('introduction:features.responsive'),
            description: t('introduction:features.responsive_desc')
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: t('introduction:features.auth'),
            description: t('introduction:features.auth_desc')
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: t('introduction:features.rbac'),
            description: t('introduction:features.rbac_desc')
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: t('introduction:features.i18n'),
            description: t('introduction:features.i18n_desc')
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: t('introduction:features.charts'),
            description: t('introduction:features.charts_desc')
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: t('introduction:features.performance'),
            description: t('introduction:features.performance_desc')
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-primary-600">
                                {t('app.title')}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                <Globe className="w-4 h-4 mr-2" />
                                {i18n.language === 'ko' ? t('languages.korean') : t('languages.english')}
                            </button>

                            <Link
                                to="/login"
                                className="btn-primary"
                            >
                                {t('navigation.login')}
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-16 md:py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        {t('introduction:title')}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 mb-4">
                        {t('introduction:subtitle')}
                    </p>

                    <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
                        {t('introduction:description')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            className="btn-primary text-lg px-8 py-3"
                        >
                            {t('introduction:cta.login')}
                        </Link>
                        <button className="btn-outline text-lg px-8 py-3">
                            {t('introduction:cta.demo')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {t('introduction:features.title')}
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            {t('introduction:features.description_main')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-24 bg-primary-600 text-white">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        {t('introduction:cta.start_now_title')}
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        {t('introduction:cta.start_now_desc')}
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-md hover:bg-gray-50 transition-colors"
                    >
                        {t('introduction:cta.login')}
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            {t('app.title')}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {t('app.description')}
                        </p>
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} EumWeb V2. {t('common:builtWith')} React, TypeScript, and Vite.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
} 