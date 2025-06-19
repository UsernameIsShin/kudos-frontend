import { RouteObject } from "react-router-dom";
import Layout from "@/shared/components/Layout";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import UserOverview from "@/web/pages/assets/UserOverview";
import PhotoPage from "@/web/pages/assets/PhotoPage";
import DatagridPage from "@/web/pages/assets/DatagridPage";

const userRoutes: RouteObject[] = [
  {
    path: "/user",
    element: (
      <ProtectedRoute
        allowedRoles={["ROLE_USER", "ROLE_MANAGER", "ROLE_ADMIN"]}
      >
        {" "}
        {/* ROLE_ADMIN도 접근 가능하도록 설정되어 있었음 */}
        <Layout variant="user" />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "assets/overview",
        element: <UserOverview />,
      },
      {
        path: "assets/photos",
        element: <PhotoPage />,
      },
      {
        path: "assets/datagrid",
        element: <DatagridPage />,
      },
    ],
  },
];

export default userRoutes;
