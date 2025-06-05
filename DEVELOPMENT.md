# EumWeb V2 개발 가이드

## 아키텍처 개요

EumWeb V2는 모듈형 아키텍처를 채택하여 확장성과 유지보수성을 극대화했습니다.

### 디렉토리 구조 상세

```bash
src/
├── admin/                    # 관리자 모듈
│   ├── pages/               # 관리자 전용 페이지
│   ├── components/          # 관리자 전용 컴포넌트 (추후 확장)
│   └── hooks/               # 관리자 전용 훅 (추후 확장)
├── web/                     # 일반 사용자 모듈
│   ├── pages/               # 웹 페이지
│   ├── components/          # 웹 전용 컴포넌트 (추후 확장)
│   └── hooks/               # 웹 전용 훅 (추후 확장)
├── mobile/                  # 모바일 모듈 (추후 확장)
│   ├── pages/
│   └── components/
└── shared/                  # 공통 모듈
    ├── components/          # 재사용 가능한 컴포넌트
    ├── stores/              # 전역 상태 관리
    ├── types/               # TypeScript 타입 정의
    ├── api/                 # API 클라이언트
    ├── hooks/               # 공통 커스텀 훅
    ├── utils/               # 유틸리티 함수
    └── i18n/                # 국제화 설정
```

## 상태 관리 아키텍처

### Zustand 스토어 패턴

```typescript
// stores/authStore.ts
interface AuthState {
  // 상태 정의
  user: User | null
  accessToken: string | null
  // ...
}

interface AuthActions {
  // 액션 정의
  login: (credentials: LoginRequest) => Promise<LoginResponse>
  logout: () => void
  // ...
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 상태 및 액션 구현
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // 영속화할 상태 선택
      })
    }
  )
)
```

### 스토어 사용 패턴

```typescript
// 컴포넌트에서 사용
const MyComponent = () => {
  const { user, login, logout } = useAuthStore()
  
  // 특정 상태만 구독하여 리렌더링 최적화
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  
  return (
    // JSX
  )
}
```

## 라우팅 아키텍처

### Protected Route 패턴

```typescript
// App.tsx의 라우팅 구조
<Routes>
  {/* 공개 라우트 */}
  <Route path="/" element={<IntroductionPage />} />
  <Route path="/login" element={<LoginPage />} />
  
  {/* 보호된 라우트 - 중첩 라우팅 */}
  <Route path="/admin" element={
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <Layout variant="admin" />
    </ProtectedRoute>
  }>
    <Route path="dashboard" element={<AdminDashboard />} />
  </Route>
</Routes>
```

### 역할 기반 접근 제어 (RBAC)

```typescript
// ProtectedRoute.tsx
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()
  
  // 인증 확인
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }
  
  // 권한 확인
  const hasRequiredRole = allowedRoles.some(role => 
    user.roles.includes(role) || user.primaryRole === role
  )
  
  if (!hasRequiredRole) {
    return <AccessDeniedPage />
  }
  
  return <>{children}</>
}
```

## API 클라이언트 아키텍처

### Axios 인터셉터 패턴

```typescript
// shared/api/client.ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  timeout: 10000,
})

// 요청 인터셉터 - 토큰 자동 첨부
apiClient.interceptors.request.use((config) => {
  const token = getTokenFromStorage()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 응답 인터셉터 - 토큰 갱신 처리
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await handleTokenRefresh()
    }
    return Promise.reject(error)
  }
)
```

### API 서비스 레이어 패턴

```typescript
// services/authService.ts
export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
    return response.data
  }
  
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken
    })
    return response.data
  }
}
```

## 컴포넌트 설계 패턴

### 컴포넌트 구조

```typescript
// 1. 인터페이스 정의
interface ComponentProps {
  title: string
  isVisible?: boolean
  onAction?: () => void
}

// 2. 컴포넌트 구현
export default function Component({ 
  title, 
  isVisible = true, 
  onAction 
}: ComponentProps) {
  // 3. 훅 사용
  const { t } = useTranslation()
  const [localState, setLocalState] = useState<string>('')
  
  // 4. 이벤트 핸들러
  const handleClick = useCallback(() => {
    onAction?.()
  }, [onAction])
  
  // 5. 조건부 렌더링
  if (!isVisible) return null
  
  // 6. JSX 반환
  return (
    <div className="component-wrapper">
      <h2>{title}</h2>
      <button onClick={handleClick} className="btn-primary">
        {t('common.action')}
      </button>
    </div>
  )
}
```

### 레이아웃 컴포넌트 패턴

```typescript
// shared/components/Layout.tsx
interface LayoutProps {
  variant: 'admin' | 'user'
}

export default function Layout({ variant }: LayoutProps) {
  return (
    <div className="layout-container">
      {/* 사이드바 */}
      <Sidebar variant={variant} />
      
      {/* 메인 컨텐츠 */}
      <main className="main-content">
        <Header variant={variant} />
        <div className="content-area">
          <Outlet /> {/* 중첩 라우트 렌더링 */}
        </div>
      </main>
    </div>
  )
}
```

## 스타일링 시스템

### Tailwind CSS 커스텀 클래스

```css
/* src/index.css */
@layer components {
  .btn-primary {
    @apply bg-primary-500 hover:bg-primary-600 
           text-white font-medium py-2 px-4 
           rounded-md transition-colors 
           focus:outline-none focus:ring-2 focus:ring-primary-500;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm 
           border border-gray-200 p-6;
  }
  
  .input-field {
    @apply border border-gray-300 rounded-md px-3 py-2 
           focus:outline-none focus:ring-2 focus:ring-primary-500 
           focus:border-transparent;
  }
}
```

### 반응형 디자인 패턴

```typescript
// 반응형 그리드 예시
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map(item => (
    <div key={item.id} className="card">
      {/* 카드 내용 */}
    </div>
  ))}
</div>

// 반응형 사이드바
<div className={`
  fixed inset-y-0 left-0 z-50 w-64 
  transform transition-transform 
  lg:translate-x-0 lg:static lg:inset-0
  ${isOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
  {/* 사이드바 내용 */}
</div>
```

## 국제화 (i18n) 패턴

### 번역 파일 구조

```json
// locales/ko.json
{
  "common": {
    "save": "저장",
    "cancel": "취소",
    "loading": "로딩 중..."
  },
  "auth": {
    "login": "로그인",
    "logout": "로그아웃"
  },
  "dashboard": {
    "title": "대시보드",
    "stats": {
      "totalUsers": "총 사용자",
      "activeUsers": "활성 사용자"
    }
  }
}
```

### 번역 사용 패턴

```typescript
// 기본 사용
const { t } = useTranslation()
const title = t('dashboard.title')

// 네임스페이스 사용
const { t } = useTranslation('dashboard')
const statsTitle = t('stats.totalUsers')

// 매개변수 사용
const { t } = useTranslation()
const message = t('user.welcome', { name: user.name })
```

## 타입 시스템

### 도메인 타입 정의

```typescript
// shared/types/auth.ts
export interface User {
  id: string
  companyId: string
  userId: string
  name: string
  email?: string
  roles: Role[]
  primaryRole: Role
  createdAt: string
  updatedAt: string
}

export type Role = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_USER'

// API 요청/응답 타입
export interface LoginRequest {
  companyId: string
  userId: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
  expiresIn: number
}
```

### 유틸리티 타입 활용

```typescript
// 선택적 필드로 변환
type PartialUser = Partial<User>

// 특정 필드만 선택
type UserBasicInfo = Pick<User, 'id' | 'name' | 'email'>

// 특정 필드 제외
type UserWithoutDates = Omit<User, 'createdAt' | 'updatedAt'>

// 조건부 타입
type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}
```

## 성능 최적화

### React 최적화 패턴

```typescript
// 1. React.memo로 불필요한 리렌더링 방지
const ExpensiveComponent = React.memo(({ data }: { data: any[] }) => {
  return (
    <div>
      {data.map(item => <Item key={item.id} item={item} />)}
    </div>
  )
})

// 2. useCallback으로 함수 재생성 방지
const Component = () => {
  const handleClick = useCallback((id: string) => {
    // 처리 로직
  }, [])
  
  return <button onClick={() => handleClick('1')}>Click</button>
}

// 3. useMemo로 비싼 계산 캐시
const Component = ({ items }: { items: Item[] }) => {
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0)
  }, [items])
  
  return <div>{expensiveValue}</div>
}
```

### 상태 선택 최적화

```typescript
// Zustand에서 특정 상태만 구독
const Component = () => {
  // ✅ 좋은 방법 - isAuthenticated가 변경될 때만 리렌더링
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  
  // ❌ 나쁜 방법 - 전체 상태 변경시 리렌더링
  const { isAuthenticated } = useAuthStore()
  
  return <div>{isAuthenticated ? 'Logged in' : 'Not logged in'}</div>
}
```

## 에러 처리 패턴

### Error Boundary

```typescript
// shared/components/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    
    return this.props.children
  }
}
```

### API 에러 처리

```typescript
// hooks/useApi.ts
export function useApi<T>(apiCall: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const execute = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [apiCall])
  
  return { data, loading, error, execute }
}
```

## 테스팅 전략

### 컴포넌트 테스트 패턴

```typescript
// __tests__/LoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../LoginPage'

// 테스트 래퍼
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('LoginPage', () => {
  it('로그인 폼이 렌더링된다', () => {
    render(<LoginPage />, { wrapper: TestWrapper })
    
    expect(screen.getByLabelText(/회사 ID/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/사용자 ID/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument()
  })
  
  it('유효한 데이터로 로그인할 수 있다', async () => {
    const mockLogin = jest.fn().mockResolvedValue({})
    
    render(<LoginPage />, { wrapper: TestWrapper })
    
    fireEvent.change(screen.getByLabelText(/회사 ID/i), {
      target: { value: 'company1' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /로그인/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        companyId: 'company1',
        userId: '',
        password: ''
      })
    })
  })
})
```

### 스토어 테스트 패턴

```typescript
// __tests__/authStore.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../stores/authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
  })
  
  it('초기 상태가 올바르다', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
  
  it('로그인이 성공적으로 동작한다', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.login({
        companyId: 'company1',
        userId: 'admin',
        password: 'admin123'
      })
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).not.toBeNull()
  })
})
```

## 개발 워크플로우

### Git 브랜치 전략

```bash
# 기능 개발
git checkout -b feature/user-dashboard
git add .
git commit -m "feat: 사용자 대시보드 기본 구조 추가"

# 버그 수정
git checkout -b fix/login-validation
git commit -m "fix: 로그인 폼 유효성 검사 오류 수정"

# 핫픽스
git checkout -b hotfix/security-patch
git commit -m "hotfix: XSS 취약점 수정"
```

### 커밋 메시지 컨벤션

```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포매팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 프로세스 또는 보조 도구 변경
```

### 코드 리뷰 체크리스트

- [ ] 타입 안전성 확보
- [ ] 접근성 고려 (ARIA 라벨, 키보드 네비게이션)
- [ ] 반응형 디자인 적용
- [ ] 에러 처리 구현
- [ ] 로딩 상태 처리
- [ ] 국제화 적용
- [ ] 성능 최적화 (memo, callback 등)
- [ ] 테스트 코드 작성

## 배포 및 모니터링

### 환경 변수 관리

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8081/api
VITE_LOG_LEVEL=debug

# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_LOG_LEVEL=error
```

### 빌드 최적화

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@progress/kendo-react-grid', '@progress/kendo-react-charts'],
        }
      }
    }
  }
})
```

이 개발 가이드를 참고하여 EumWeb V2 프로젝트를 효율적으로 개발하고 유지보수할 수 있습니다.
