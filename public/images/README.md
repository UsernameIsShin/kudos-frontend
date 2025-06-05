# Public 이미지 자산 관리 가이드

이 폴더는 정적 이미지 자산들을 저장하는 곳입니다.
이곳의 이미지들은 번들링되지 않고 그대로 서빙됩니다.

## 언제 사용하나요?

### ✅ 적합한 경우

- 런타임에 동적으로 로드되는 이미지
- 사용자가 업로드한 이미지
- SEO 관련 이미지 (favicon, og:image)
- 매우 큰 이미지 파일
- 외부 API에서 참조하는 이미지

### ❌ 부적합한 경우  

- 컴포넌트에서 직접 import하는 이미지
- UI 아이콘이나 로고
- 번들링과 최적화가 필요한 이미지

## 추천 폴더 구조

```bash
public/images/
├── favicons/          # 파비콘 관련 파일들
├── social/            # 소셜 미디어 이미지 (og:image 등)
├── uploads/           # 사용자 업로드 이미지
├── static/            # 정적 컨텐츠 이미지
└── placeholders/      # 플레이스홀더 이미지
```

## 사용 방법

### 1. 정적 경로로 참조

```typescript
function MyComponent() {
  return (
    <div>
      {/* 기본 사용법 */}
      <img src="/images/static/banner.jpg" alt="Banner" />
      
      {/* 절대 경로 방식 */}
      <img src={`${window.location.origin}/images/static/logo.png`} alt="Logo" />
    </div>
  );
}
```

### 2. 동적 경로 생성

```typescript
function UserProfile({ userId }: { userId: string }) {
  const avatarUrl = `/images/uploads/avatars/${userId}.jpg`;
  
  return (
    <img 
      src={avatarUrl} 
      alt="User Avatar"
      onError={(e) => {
        // 기본 이미지로 대체
        e.currentTarget.src = '/images/placeholders/default-avatar.png';
      }}
    />
  );
}
```

### 3. CSS에서 사용

```css
.hero-section {
  background-image: url('/images/static/hero-bg.jpg');
}

.icon-success {
  background-image: url('/images/icons/success.svg');
}
```

### 4. Meta 태그에서 사용

```html
<!-- index.html에서 -->
<link rel="icon" type="image/svg+xml" href="/images/favicons/favicon.svg" />
<meta property="og:image" content="/images/social/og-image.jpg" />
```

## 파일 명명 규칙

- **kebab-case** 사용: `hero-banner.jpg`
- **의미있는 이름**: `privacy-policy-banner.png`
- **버전 관리** (필요시): `logo-v2.png`
- **크기 표시** (필요시): `thumbnail-150x150.jpg`

## 주의사항

1. **캐싱**: 파일명이 같으면 브라우저가 캐시를 사용할 수 있음
2. **보안**: 민감한 정보가 포함된 이미지는 저장하지 말 것  
3. **용량**: 큰 파일은 성능에 영향을 줄 수 있음
4. **접근성**: alt 텍스트 필수 제공

## 파비콘 설정 예시

```html
<!-- index.html -->
<link rel="icon" type="image/svg+xml" href="/images/favicons/favicon.svg" />
<link rel="icon" type="image/png" href="/images/favicons/favicon.png" />
<link rel="apple-touch-icon" href="/images/favicons/apple-touch-icon.png" />
```
