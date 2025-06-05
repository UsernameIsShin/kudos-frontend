# 이미지 자산 관리 가이드

이 폴더는 React 컴포넌트에서 import하여 사용하는 이미지 자산들을 저장하는 곳입니다.

## 폴더 구조

### `icons/`

- 아이콘 이미지 (SVG, PNG)
- UI 요소에 사용되는 작은 아이콘들
- 예: 화살표, 체크마크, 메뉴 아이콘 등

### `logos/`

- 회사 로고, 브랜드 로고
- 다양한 사이즈의 로고 파일들
- 예: company-logo.png, brand-logo.svg

### `ui/`

- UI 관련 이미지들
- 버튼 배경, 테두리, 패턴 등
- 예: button-bg.png, pattern.svg

### `backgrounds/`

- 배경 이미지들
- 히어로 섹션, 카드 배경 등
- 예: hero-bg.jpg, card-bg.png

## 사용 방법

```typescript
// 아이콘 import
import starIcon from '@/assets/images/icons/star.svg';
import arrowIcon from '@/assets/images/icons/arrow-right.png';

// 로고 import
import companyLogo from '@/assets/images/logos/company-logo.png';

// UI 이미지 import
import buttonBg from '@/assets/images/ui/button-bg.png';

// 배경 이미지 import
import heroBg from '@/assets/images/backgrounds/hero-bg.jpg';

// 컴포넌트에서 사용
function MyComponent() {
  return (
    <div>
      <img src={companyLogo} alt="Company Logo" />
      <img src={starIcon} alt="Star" />
      <div style={{ backgroundImage: `url(${heroBg})` }}>
        Hero Section
      </div>
    </div>
  );
}
```

## 파일 명명 규칙

- **kebab-case** 사용: `user-profile.png`
- **의미있는 이름**: `login-button-icon.svg`
- **사이즈 표시** (필요시): `logo-small.png`, `logo-large.png`
- **상태 표시** (필요시): `button-normal.png`, `button-hover.png`

## 최적화 팁

1. **SVG 우선**: 아이콘은 가능한 SVG 형식 사용
2. **적절한 사이즈**: 실제 사용 크기에 맞는 이미지 준비
3. **압축**: 이미지 파일 크기 최적화
4. **WebP 고려**: 현대적인 이미지 포맷 사용 검토
