# 입생로랑 뷰티 리뉴얼 · 메인 페이지

`index.html`을 브라우저에서 열거나 정적 서버에서 제공하면 됩니다. 이미지, 아이콘, 글꼴은 `assets/`에서 불러옵니다.

- `scss/_shared.scss`에 Sass 변수와 믹스인을 관리합니다.
- `scss/_site.scss`와 `js/common.js`에 기본 레이아웃, 헤더, 푸터, 모바일 메뉴, 검색을 관리합니다.
- `scss/_page.scss`와 `js/main.js`에 메인 페이지의 배너, 아코디언, 서비스 탭, 영상 동작을 관리합니다.

서브 페이지에서는 `css/common.css`와 `js/common.js`를 불러오고 필요한 공통 UI 마크업을 사용합니다. 검색에 표시할 섹션에는 `id`와 `data-search-target`을 붙입니다. 하위 폴더에서는 CSS, JS, 이미지 및 메인 페이지 링크를 해당 페이지 기준 상대 경로로 설정합니다.

스타일을 수정한 후 CSS를 다시 생성할 수 있습니다.

```sh
npx --yes sass --no-source-map scss/common.scss:css/common.css scss/style.scss:css/style.css
```

메인 화면에는 Figma의 영상 레이어에서 내보낸 포스터를 사용합니다. 원본 영상을 추가할 경우 `assets/hero.mp4`를 저장하고 `js/assets.js`의 목록에 `'hero.mp4'`를 추가하면 음소거 상태로 자동 반복 재생됩니다. 모션 줄이기 설정에서는 재생 버튼으로 시작할 수 있습니다.

검색과 주요 메뉴는 이 페이지의 상품과 섹션에 연결됩니다. 매장 찾기, 로그인, 장바구니는 시안에 지정된 Figma 프로토타입 링크에 연결됩니다. Pretendard 라이선스는 `assets/Pretendard-LICENSE.txt`에 있습니다.
