import { RouteObject } from 'react-router-dom';
import Layout from '@/shared/components/Layout';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import AdminDashboard from '@/admin/pages/AdminDashboard';
// import OtherAdminPage from '../pages/OtherAdminPage'; // 예시

const adminRoutes: RouteObject[] = [
    {
        path: "/admin",
        element: (
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Layout variant="admin" />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "dashboard",
                element: <AdminDashboard />
            },
            // {
            //     path: "settings",
            //     element: <OtherAdminPage />
            // },
        ]
    }
];

export default adminRoutes; 