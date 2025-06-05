import { RouteObject } from 'react-router-dom';
import IntroductionPage from '@/web/pages/IntroductionPage';
import LoginPage from '@/web/pages/LoginPage';
// NotFoundPage는 App.tsx에서 전역적으로 처리하므로 여기서는 제외합니다.

const publicRoutes: RouteObject[] = [
    {
        path: "/",
        element: <IntroductionPage />
    },
    {
        path: "/login",
        element: <LoginPage />
    }
];

export default publicRoutes; 