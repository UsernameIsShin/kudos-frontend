import React from "react";

const getPathLabelMapping = (): Record<string, React.ReactNode> => ({
  "/": (
    <img
      src="/images/home-4-fill-1.png"
      alt="Home"
      style={{
        width: 20,
        height: 20,
        display: "inline",
        verticalAlign: "middle",
      }}
    />
  ),
  "/admin": "관리자 영역",
  "/admin/dashboard": "관리자 페이지",
  "/user": "",
  "/user/overview": "사용자 개요",
  "/user/assets": "투자자산 현황",
  "/user/assets/overview": "자산현황",
  "/user/assets/photos": "기간별 투자현황",
  "/user/portfolio": "포트폴리오 관리",
  "/user/unions": "조합 관리",
  "/user/approvals": "결재 문서",
  "/user/settings": "관리자 설정",
});

export default getPathLabelMapping;
