import { Link, useLocation } from "react-router-dom";
import getPathLabelMapping from "@/constants/pathLabelMapping";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import React from "react";

interface PageHeaderProps {
  // 필요 시 props로 children, 추가 요소, 타이틀 등 전달 가능
}

interface BreadcrumbPath {
  path: string;
  label: React.ReactNode;
}

// Breadcrumb 생성 함수 (복사)
const generateBreadcrumbs = (
  pathname: string,
  pathLabelMapping: Record<string, React.ReactNode>,
  homeLabel: React.ReactNode
): BreadcrumbPath[] => {
  const pathSegments = pathname.split("/").filter((segment) => segment);
  const breadcrumbs: BreadcrumbPath[] = [{ label: homeLabel, path: "/" }];

  let currentPath = "";
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const mappedLabel = pathLabelMapping[currentPath];
    if (
      mappedLabel === undefined ||
      mappedLabel === null ||
      mappedLabel === ""
    ) {
      continue;
    }
    const label =
      mappedLabel || segment.charAt(0).toUpperCase() + segment.slice(1);
    if (!breadcrumbs.find((bc) => bc.path === currentPath) || mappedLabel) {
      breadcrumbs.push({ label, path: currentPath });
    }
  }
  return breadcrumbs;
};

const PageHeader: React.FC<PageHeaderProps> = () => {
  const location = useLocation();
  const pathLabelMapping = getPathLabelMapping();
  const breadcrumbItems = generateBreadcrumbs(
    location.pathname,
    pathLabelMapping,
    <img
      src="/images/home-4-fill-1.png"
      alt="Home"
      style={{ width: 20, height: 20, verticalAlign: "middle" }}
    />
  );

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Breadcrumb className={cn("py-1")}>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={item.path}>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
