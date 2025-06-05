import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'



// 정의할 네임스페이스 목록
// 파일 이름과 일치시킵니다 (예: common.json -> 'common' 네임스페이스)
const namespaces = ['common', 'auth', 'introduction', 'admin', 'user', 'demo']

i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'ko',
        ns: namespaces,
        defaultNS: 'common',
        debug: import.meta.env.DEV,

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
        },

        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
    })

export default i18n 