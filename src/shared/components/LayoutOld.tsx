import React, { useState } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X, User, LogOut, Globe } from "lucide-react";
import { useAuthStore } from "@/shared/stores/authStore";
import logger from "@/shared/utils/logger";
import KendoLocalizationProvider from "@/shared/components/KendoLocalizationProvider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface LayoutProps {
  variant: "admin" | "user";
}

interface BreadcrumbPath {
  path: string;
  label: string;
}

const getPathLabelMapping = (t: Function): Record<string, string> => ({
  "/": t("common:navigation.home"),
  "/admin": t("common:navigation.admin"),
  "/admin/dashboard": t("admin:dashboard.title"),
  "/user": t("common:navigation.userSpace"),
  "/user/overview": t("user:overview.title"),
  "/user/demo": t("common:navigation.demo"),
  "/user/demo/photos": t("demo:photoPage.title"),
  "/user/demo/datagrid": t("demo:dataGridPage.title"),
  "/user/demo/datagrid-rq": "React Query DataGrid",
});

const generateBreadcrumbs = (
  pathname: string,
  pathLabelMapping: Record<string, string>,
  homeLabel: string
): BreadcrumbPath[] => {
  const pathSegments = pathname.split("/").filter((segment) => segment);
  const breadcrumbs: BreadcrumbPath[] = [{ label: homeLabel, path: "/" }];

  let currentPath = "";
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const mappedLabel = pathLabelMapping[currentPath];
    const label =
      mappedLabel || segment.charAt(0).toUpperCase() + segment.slice(1);
    if (!breadcrumbs.find((bc) => bc.path === currentPath) || mappedLabel) {
      breadcrumbs.push({ label, path: currentPath });
    }
  }
  return breadcrumbs;
};

export default function Layout({ variant }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, i18n } = useTranslation([
    "common",
    "admin",
    "user",
    "demo",
    "auth",
  ]);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const pathLabelMapping = getPathLabelMapping(t);
  const breadcrumbItems = generateBreadcrumbs(
    location.pathname,
    pathLabelMapping,
    t("common:navigation.home")
  );

  const handleLogout = () => {
    logout({ reason: "manual_user_action" });
    navigate("/login");
    logger.info("User logged out manually");
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "ko" ? "en" : "ko";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
    logger.debug(`Language changed to: ${newLang}`);
  };

  const adminMenuItems = [
    { label: t("admin:dashboard.title"), href: "/admin/dashboard", icon: "📊" },
  ];

  const userMenuItems = [
    {
      label: t("user:overview.title"),
      href: "/user/demo/overview",
      icon: "📈",
    },
    {
      label: t("common:navigation.photoPageLink"),
      href: "/user/demo/photos",
      icon: "📸",
    },
    {
      label: t("common:navigation.dataGridPageLink"),
      href: "/user/demo/datagrid",
      icon: "🗂️",
    },
  ];

  const menuItems = variant === "admin" ? adminMenuItems : userMenuItems;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
                transform transition-transform lg:translate-x-0 lg:static lg:inset-0
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link to="/" className="text-xl font-bold text-primary-600">
            {t("common:app.title")}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="mt-6 flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                location.pathname.startsWith(item.href)
                  ? "bg-gray-100 text-primary-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.userName || user?.userId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Breadcrumb className={cn("py-1")}>
                <BreadcrumbList>
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={item.path}>
                      <BreadcrumbItem>
                        {index === breadcrumbItems.length - 1 ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={item.path}>{item.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbItems.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleLanguage}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                title={
                  i18n.language === "ko" ? "Switch to English" : "한국어로 변경"
                }
              >
                <Globe size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="p-1 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600"
                title={t("auth:logout")}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <KendoLocalizationProvider>
            <Outlet />
          </KendoLocalizationProvider>
        </main>
      </div>
    </div>
  );
}
