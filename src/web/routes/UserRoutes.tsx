import { RouteObject } from 'react-router-dom';
import Layout from '@/shared/components/Layout';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import UserOverview from '@/web/pages/demo/UserOverview';
import PhotoPage from '@/web/pages/demo/PhotoPage';
import DatagridPage from '@/web/pages/demo/DatagridPage';

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
                path: "demo/overview",
                element: <UserOverview />
            },
            {
                path: "demo/photos",
                element: <PhotoPage />
            },
            {
                path: "demo/datagrid",
                element: <DatagridPage />
            }
        ]
    }
];

export default userRoutes; 