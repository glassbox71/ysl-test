# 입생로랑 뷰티 리뉴얼 · 메인 페이지

압축을 풀고 `index.html`을 열면 됩니다. 일반 정적 서버와 VS Code Live Server에서도 동일하게 열 수 있습니다. 실행 시 필요한 외부 스크립트나 CDN은 없습니다.

| 경로 | 역할 |
| --- | --- |
| `index.html` | 시맨틱 HTML과 메인 화면 콘텐츠 |
| `scss/style.scss`, `scss/_page.scss` | Sass 진입점과 페이지 스타일 원본 |
| `css/style.css` | 브라우저가 읽는 CSS |
| `js/main.js` | 모바일 메뉴, 검색, 캐러셀, 서비스 탭, 미디어 |
| `js/assets.js` | 포함된 로컬 에셋 파일 이름 |
| `assets/` | 첨부받은 원본 PNG |

SCSS 수정 후 프로젝트 폴더에서 CSS를 다시 생성할 수 있습니다.

```sh
npx --yes sass --no-source-map scss/style.scss css/style.css
```

## 적용한 원본

| 원본 이름 | 프로젝트 파일 | 적용 위치 |
| --- | --- | --- |
| 향수4.png | libre-4.png | 리브르 르 퍼퓸 |
| 향수5.png | libre-5.png | 리브르 앱솔루트 플라틴 |
| 향수6.png | libre-6.png | 리브르 로 뉘 |
| Rectangle 660.png | service-engraving.png | 립스틱 각인 |
| Rectangle 662.png | service-virtual.png | 가상 메이크업 |
| beautyclub_image-230616-v2 1.png | service-wrapping.png | 스페셜 포장 |

## 추가 에셋 연결

다음 이름으로 `assets/`에 파일을 복사한 뒤 `js/assets.js` 배열에 파일명을 추가합니다. 원본이 없는 위치는 배경색과 기존 텍스트로 표시됩니다.

| 위치 | 파일명 또는 Figma 내보내기 대상 |
| --- | --- |
| 첫 화면 | `hero-poster.png`, `hero-logo.svg`, `hero.mp4` |
| 카테고리 | `category-makeup.png`, `category-fragrance.png`, `category-skincare.png` |
| 리브르 제품 | 향수1·2·3 레이어 → `libre-1.png` ~ `libre-3.png` |
| 리브르 캠페인 | 로제 누운 사진 레이어 → `libre-campaign.png` |
| 베스트 상품 | `best-cushion.png`, `best-libre.png`, `best-serum.png`, `best-lipstick.png`, `best-glaze.png` |
| 룩북 사진 | 왼쪽부터 `look-1.png` ~ `look-7.png` |

룩북 사진처럼 이미지 자체가 추가 정보를 전달하는 경우 `index.html`의 해당 룩에 설명을 보완합니다. 영상은 원본 파일 연결 후 재생 버튼으로 시작하며 초기에는 정지 상태입니다. 음성이나 의미 있는 시각 정보가 추가된 영상이라면 대체 콘텐츠를 함께 적용합니다.

이 프로젝트는 메인 페이지 구현입니다. 메뉴는 메인 페이지의 콘텐츠로 이동하며, 검색은 페이지에 포함된 상품과 섹션을 대상으로 동작합니다.
