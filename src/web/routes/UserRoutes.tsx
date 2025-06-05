import { RouteObject } from 'react-router-dom';
import Layout from '@/shared/components/Layout';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import UserOverview from '@/web/pages/UserOverview';
import PhotoPage from '@/web/pages/demo/PhotoPage';
import DatagridPage from '@/web/pages/demo/DatagridPage';
// import UserProfilePage from '../pages/UserProfilePage'; // 예시

const userRoutes: RouteObject[] = [
    {
        path: "/user",
        element: (
            <ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_MANAGER', 'ROLE_ADMIN']}> {/* ROLE_ADMIN도 접근 가능하도록 설정되어 있었음 */}
                <Layout variant="user" />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "overview",
                element: <UserOverview />
            },
            {
                path: "demo/photos",
                element: <PhotoPage />
            },
            {
                path: "demo/datagrid",
                element: <DatagridPage />
            },
            // {
            //     path: "settings",
            //     element: <UserProfilePage />
            // },
        ]
    }
];

export default userRoutes; 