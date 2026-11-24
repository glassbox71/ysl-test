# 입생로랑 뷰티 리뉴얼 · 메인 페이지

`index.html`을 브라우저에서 열거나 정적 서버에서 제공하면 됩니다. 이미지, 아이콘, 글꼴은 `assets/`에서 불러옵니다.

- `index.html`에 메인 페이지 콘텐츠와 이미지 경로를 관리합니다.
- `scss/_page.scss`에 페이지 스타일을 관리합니다.
- `js/main.js`에 메뉴, 검색, 캐러셀, 서비스 탭 동작을 관리합니다.

스타일을 수정한 후 CSS를 다시 생성할 수 있습니다.

```sh
npx --yes sass --no-source-map scss/style.scss css/style.css
```

메인 화면에는 Figma의 영상 레이어에서 내보낸 포스터를 사용합니다. 원본 영상을 추가할 경우 `assets/hero.mp4`를 저장하고 `js/assets.js`의 목록에 `'hero.mp4'`를 추가하면 재생 버튼이 표시됩니다.

검색과 주요 메뉴는 이 페이지의 상품과 섹션에 연결됩니다. 매장 찾기, 로그인, 장바구니는 시안에 지정된 Figma 프로토타입 링크에 연결됩니다. Pretendard 라이선스는 `assets/Pretendard-LICENSE.txt`에 있습니다.
