# EumWeb V2 Frontend

## 프로젝트 개요

EumWeb V2는 React, TypeScript, Vite를 기반으로 한 현대적인 엔터프라이즈급 웹 애플리케이션입니다. 관리자, 일반 사용자, 모바일 영역을 지원하며 JWT 기반 인증과 역할 기반 접근 제어(RBAC)를 제공합니다.

## 주요 기능

### 🎨 **현대적인 UI/UX**

- **반응형 디자인**: 데스크톱, 태블릿, 모바일에서 완벽하게 작동
- **Material Design 기반**: Tailwind CSS v4.1+로 구현된 아름다운 인터페이스
- **다크/라이트 모드**: 사용자 취향에 맞는 테마 선택

### 🔐 **보안 및 인증**

- **JWT 기반 인증**: 안전한 토큰 기반 로그인 시스템
- **자동 토큰 갱신**: 무중단 사용자 경험
- **역할 기반 접근 제어**: ADMIN, MANAGER, USER 권한 관리

### 🌐 **국제화 (i18n)**

- **다국어 지원**: 한국어, 영어 지원
- **실시간 언어 변경**: 새로고침 없이 언어 전환
- **로컬 스토리지 연동**: 언어 설정 자동 저장

### 📊 **데이터 시각화**

- **Kendo UI 통합**: 고급 데이터 그리드 및 차트
- **실시간 대시보드**: 관리자용 통계 및 모니터링
- **개인화 리포트**: 사용자별 맞춤 데이터 분석

## 기술 스택

### **Frontend**

- **React 18+**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성 보장
- **Vite**: 빠른 개발 서버 및 빌드
- **Tailwind CSS 4.1+**: 유틸리티 기반 CSS 프레임워크
- **Zustand**: 경량 상태 관리
- **React Router**: SPA 라우팅
- **Axios**: HTTP 클라이언트
- **React i18next**: 국제화

### **UI 컴포넌트**

- **Lucide React**: 아이콘 라이브러리
- **Kendo UI for React**: 엔터프라이즈급 UI 컴포넌트

### **개발 도구**

- **Bun**: 고성능 JavaScript 런타임 및 패키지 매니저
- **ESLint**: 코드 품질 관리
- **PostCSS**: CSS 처리

## 설치 및 실행

### **사전 요구사항**

- Node.js 24+
- Bun 1.0+
- [Bun 설치주소](https://bun.sh/docs/installation)

### **설치**

```bash
# 의존성 설치
bun install
```

### **개발 서버 실행**

```bash
# 개발 서버 시작 (http://localhost:3000)
bun run dev
```

### **빌드**

```bash
# 프로덕션 빌드
bun run build

# 빌드 결과 미리보기
bun run preview
```

### **코드 품질 관리**

```bash
# ESLint 실행
bun run lint

# ESLint 자동 수정
bun run lint:fix

# TypeScript 타입 체크
bun run type-check
```

## 사용법

### **1. 메인 페이지 접속**

- `http://localhost:3010`에 접속하면 소개 페이지가 표시됩니다
- 언어 전환 버튼으로 한국어/영어를 선택할 수 있습니다

### **2. 로그인**

데모 계정을 사용하여 로그인할 수 있습니다:

**관리자 계정:**

- 사용자 ID: `admin`
- 비밀번호: `password123`

**일반 사용자 계정:**

- 사용자 ID: `eum`
- 비밀번호: `password123`

## 상태 관리

### **인증 상태 (authStore)**

```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
```

**주요 액션:**

- `login()`: 사용자 로그인
- `logout()`: 로그아웃
- `refreshTokens()`: 토큰 갱신
- `initializeAuth()`: 앱 시작시 인증 상태 복원

## API 통신

### **기본 설정**

- 기본 URL: `http://localhost:8081/api`
- 인증: Bearer Token (JWT)
- 자동 토큰 갱신: 401 에러시 자동 처리

### **주요 엔드포인트**

- `POST /auth/login`: 로그인
- `POST /auth/refresh`: 토큰 갱신
- `GET /users`: 사용자 목록 (관리자용)
- `GET /dashboard/stats`: 대시보드 통계

## 개발 가이드라인

### **컴포넌트 작성**

```typescript
// 타입스크립트 인터페이스 정의
interface ComponentProps {
  title: string
  isVisible?: boolean
}
 
### **스타일링**

```css
/* Tailwind CSS 유틸리티 클래스 사용 */
.btn-primary {
  @apply bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors;
}
```
