---
id: "article5"
title: "DX(Developer Experience) 개선이란"
kinds: ["스터디"]
stacks: ["DX"]
date: "2026-02-16"
excerpt: "DX(Developer Experience)는 쉽게 말하면 \"이 도구 쓸 때 얼마나 편하냐\"의 문제라고 할 수 있다. 개발자가 도구, 플랫폼..."
---

## 1. DX란?

DX(Developer Experience)는 쉽게 말하면 **"이 도구 쓸 때 얼마나 편하냐"**의 문제라고 할 수 있다.

개발자가 도구, 플랫폼, 라이브러리, API를 사용할 때 느끼는 전반적인 경험을 말한다. 
UX가 사용자 경험이라면, DX는 개발자 경험이다.

### DX를 구성하는 요소들

1. **설치 및 설정** - 시작하기 얼마나 쉬운지
2. **문서화** - 필요한 정보를 얼마나 빨리 찾을 수 있는지
3. **에러 메시지** - 문제 생겼을 때 얼마나 친절하게 안내하는지
4. **성능** - 빌드, HMR 등이 얼마나 빠른지
5. **타입 지원** - 자동완성, 타입 추론이 잘 되는지
6. **커뮤니티** - 막혔을 때 도움 받기 쉬운지

> "좋은 개발자 경험은 개발자에게 도움이 될 뿐만 아니라 
효율성을 높이고 조직의 성과를 높이는 데 필수적입니다."
— [개발자 경험(Dex)이 주목받는 시대 - 요즘IT](https://yozm.wishket.com/magazine/detail/1436/)
> 

### 참고 자료

- [개발자 경험(Dex)이 주목받는 시대 - 요즘IT](https://yozm.wishket.com/magazine/detail/1436/)
- [웹 개발에서의 개발자 경험(DX) 이해하기](https://reactnext-central.xyz/blog/web-dev/developer-experience-in-web)
- [개발자 경험 개요 - dawnscapelab](https://www.dawnscapelab.com/developer-experience-overview/)

---

## 2. 왜 DX가 중요해졌나

### 프론트엔드 생태계의 복잡화

예전에는 HTML, CSS, JS 파일 몇 개면 웹사이트 하나 만들 수 있었다.

지금은 번들러, 트랜스파일러, 린터, 포매터, 테스트 도구 등 설정할 게 엄청 많아졌다. 
이렇게 도구가 많아지니까 **"어떤 도구가 쓰기 편한지"**가 선택의 중요한 기준이 됐다.

### 개발자 생산성 = 비즈니스 가치

Vercel CEO 길레르모 로치의 말:

> "우수한 개발자 경험은 개발자 생산성 향상으로 이어져 눈에 보이는 수익 창출 효과를 낸다."
— [공감도 지능이다: 개발자의 마음을 얻는 8가지 방법 - CIO](https://www.cio.com/article/3524329/%EA%B3%B5%EA%B0%90%EB%8F%84-%EC%A7%80%EB%8A%A5%EC%9D%B4%EB%8B%A4-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%EB%A7%88%EC%9D%8C%EC%9D%84-%EC%96%BB%EB%8A%94-8%EA%B0%80%EC%A7%80-%EB%B0%A9%EB%B2%95.html)
> 

이런 인식이 퍼지면서 Vercel, 토스페이먼츠 같은 기업들은 
DX 팀을 따로 만들어서 운영하고 있다고 한다.

### 좋은 DX를 가진 도구가 선택받는다

실제로 Vite가 Webpack을 대체해가는 이유도 "더 빠르고 설정이 간단해서"라고 할 수 있다. 
기능은 비슷한데 DX가 좋으니까 개발자들이 갈아타는 거다..!

### 참고 자료

- [번역: Vercel에서의 개발자 경험](https://jenn.page/developer-experience-at-vercel-kor/)
- [토스페이먼츠 - 개발자의 학습을 돕는 모든 것](https://velog.io/@tosspayments/%EA%B7%B8-%EB%A7%8E%EC%9D%80-%EA%B0%9C%EB%B0%9C-%EB%AC%B8%EC%84%9C%EB%8A%94-%EB%88%84%EA%B0%80-%EB%8B%A4-%EB%A7%8C%EB%93%A4%EC%97%88%EC%9D%84%EA%B9%8C-2-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%ED%95%99%EC%8A%B5%EC%9D%84-%EB%8F%95%EB%8A%94-%EB%AA%A8%EB%93%A0-%EA%B2%83)

---

## 3. DX 좋은/나쁜 예시 비교

### 3-1. 빌드 도구: Vite vs Webpack

Vite vs Webpack은 DX 차이를 보여주는 대표적인 예시다.

### 속도 차이

Webpack은 서버 시작할 때 **모든 파일을 미리 번들링**한다. 
프로젝트가 커지면 서버 켜는 데만 몇 십 초씩 걸린다.

Vite는 **필요한 파일만 그때그때 처리**하기 때문에 프로젝트가 아무리 커도 서버 시작이 빠르다.

AB180(에어브릿지) 팀의 실제 사례:

> "기존에 210초 정도 걸리던 빌드가 esbuild로 2.16초만에 끝났습니다."
— [Webpack → Vite: 번들러 마이그레이션 이야기 - AB180](https://engineering.ab180.co/stories/webpack-to-vite)
> 

| 측정 항목 | Webpack | Vite | 개선율 |
| --- | --- | --- | --- |
| 프로덕션 빌드 | 250초 | 90초 | **64% 감소** |
| 개발 서버 시작 | 수십 초 | 수 초 | **10배 이상** |

### 설정 복잡도

Webpack 설정은 보통 50~100줄 이상이다:

```jsx
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: { path: path.resolve(__dirname, 'dist'), filename: '[name].[contenthash].js' },
  module: {
    rules: [
      { test: /\\.jsx?$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\\.css$/, use: ['style-loader', 'css-loader'] },
      // ... 더 많은 설정
    ]
  },
  plugins: [new HtmlWebpackPlugin({ template: './public/index.html' })],
  devServer: { hot: true, port: 3000 }
};
```

Vite 설정은 보통 5줄 내외:

```tsx
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
```

같은 일을 하는데 하나는 설정하는 데에 30분 이상의 시간을 들여야하고, 
하나는 바로 시작할 수 있다. 이런 점이 DX 차이다.

### 참고 자료

- [Webpack → Vite: 번들러 마이그레이션 이야기 - AB180](https://engineering.ab180.co/stories/webpack-to-vite)
- [왜 Webpack은 느릴까? 최신 번들러들이 빠른 이유](https://duck-blog.vercel.app/blog/web/why-webpack-is-slow-and-why-new-bundlers-are-fast)
- [차세대 번들러 비교 및 분석 - bepyan](https://bepyan.github.io/blog/2023/bundlers)
- [Bonjour, Vite! (Vite 실무 적용기)](https://blog.hectodata.co.kr/bonjour-vite/)

---

### 3-2. 에러 메시지: 좋은 에러 vs 나쁜 에러

에러 메시지도 DX의 중요한 부분이다.

### 나쁜 에러 메시지

```
Error: Something went wrong
```

```
TypeError: Cannot read property 'map' of undefined
```

이런 에러 만나면 구글링부터 시작해야 한다. 
어디서 터진 건지, 뭘 고쳐야 하는지 전혀 알 수 없다.

### 좋은 에러 메시지 (Biome 예시)

```
file.ts:12:5 lint/correctness/noUnusedVariables ━━━━━━━━━━━

  ✖ 이 변수는 선언됐지만 사용되지 않습니다.

    10 │ function calculateTotal(items) {
    11 │   const TAX_RATE = 0.08;
  > 12 │   const unusedVar = "hello";
       │         ^^^^^^^^^
    13 │   return items.reduce((sum, item) => sum + item.price, 0);

  ℹ 사용하지 않는 변수는 리팩토링이 불완전하다는 신호일 수 있습니다.
```

좋은 에러 메시지의 특징:

1️⃣ **정확한 위치** - 파일명, 줄 번호, 컬럼까지 표시

2️⃣ **문제 코드 하이라이팅** - 어느 부분이 문제인지 바로 보임

3️⃣ **해결 힌트** - 왜 문제인지, 어떻게 하면 되는지 안내

Next.js도 개발 중 에러가 나면 브라우저에 친절한 에러 오버레이를 띄워준다. 
원본 코드 위치도 보여주고, 관련 문서 링크도 제공한다.

### 참고 자료

- [좋은 에러 메시지 쓰는 법 - jacking75](https://jacking75.github.io/ETC_write_good_error/)
- [React에서 에러를 "잘" 핸들링 해보자](https://yoonhaemin.com/tag/experience/react-error-handling/)

---

### 3-3. 문서화: 좋은 문서 vs 나쁜 문서

새로운 라이브러리 쓸 때 제일 먼저 보는 게 문서다. 
문서가 좋으면 30분 만에 적용하고, 문서가 안 좋으면 하루 종일 삽질할지도..!

### 좋은 문서의 조건

1. **Quick Start가 있다** - 5분 안에 뭔가 돌아가는 걸 볼 수 있음
2. **예제 코드가 있다** - 복붙해서 바로 실행 가능
3. **검색이 된다** - 원하는 내용을 바로 찾을 수 있음
4. **인터랙티브하다** - 문서 안에서 직접 코드를 수정하고 결과 확인 가능

### 좋은 예시: React 공식 문서

React 문서는 "이 페이지에서는 여러분이 매일 사용하게 될 React 개념의 80%를 소개합니다"라고 시작한다. 핵심부터 알려주는 거다. 
그리고 문서 안에서 직접 코드를 수정하고 결과를 볼 수 있다.

### 토스페이먼츠의 인터랙티브 튜토리얼

> "기존 튜토리얼 문서는 줄글과 예제 코드가 선형적으로 보여지고, 각 연동 단계의 결과물이 어떤 지 알 수 없었어요. 이런 경험을 개선하기 위해 튜토리얼을 인터렉티브하게 바꿨어요."
— [토스페이먼츠 - 개발자의 학습을 돕는 모든 것](https://velog.io/@tosspayments/%EA%B7%B8-%EB%A7%8E%EC%9D%80-%EA%B0%9C%EB%B0%9C-%EB%AC%B8%EC%84%9C%EB%8A%94-%EB%88%84%EA%B0%80-%EB%8B%A4-%EB%A7%8C%EB%93%A4%EC%97%88%EC%9D%84%EA%B9%8C-2-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%ED%95%99%EC%8A%B5%EC%9D%84-%EB%8F%95%EB%8A%94-%EB%AA%A8%EB%93%A0-%EA%B2%83)
> 

### 나쁜 문서의 특징

- API 레퍼런스만 있고 사용 예제가 없음
- 문서가 옛날 버전이라 지금 코드랑 안 맞음
- 검색이 안 되거나 결과가 이상함

### 참고 자료

- [React 공식 문서 (한글)](https://ko.react.dev/learn)
- [토스페이먼츠 - 개발자의 학습을 돕는 모든 것](https://velog.io/@tosspayments/%EA%B7%B8-%EB%A7%8E%EC%9D%80-%EA%B0%9C%EB%B0%9C-%EB%AC%B8%EC%84%9C%EB%8A%94-%EB%88%84%EA%B0%80-%EB%8B%A4-%EB%A7%8C%EB%93%A4%EC%97%88%EC%9D%84%EA%B9%8C-2-%EA%B0%9C%EB%B0%9C%EC%9E%90%EC%9D%98-%ED%95%99%EC%8A%B5%EC%9D%84-%EB%8F%95%EB%8A%94-%EB%AA%A8%EB%93%A0-%EA%B2%83)
- [문서 엔지니어링과 API 문서화 - LINE](https://engineering.linecorp.com/ko/blog/document-engineering-api-documentation/)

---

### 3-4. 타입 지원

요즘 TypeScript가 거의 기본이 되면서, 
라이브러리가 타입을 잘 지원하는지도 DX의 중요한 부분이 됐다.

### 타입 지원이 잘 되면

```tsx
const [count, setCount] = useState(0);

setCount("hello");  // ❌ IDE에서 바로 빨간 줄! 실행 전에 에러 발견
setCount(count + 1);  // ✅ 정상
```

- 자동완성이 잘 됨
- 잘못된 타입 넣으면 바로 에러 표시
- 함수에 마우스 올리면 파라미터 타입이 뭔지 보임

### 타입 지원이 안 되면

```tsx
import someLib from 'some-old-library';

someLib.doSomething(???);  // 파라미터가 뭔지 모름, 자동완성 안 됨
// 타입 에러가 런타임에서야 터짐
```

타입 없는 라이브러리 쓰면 매번 문서 찾아봐야 하고, 버그도 나중에 발견된다.

---

## 4. DX 개선 트렌드

요즘 DX 트렌드를 한 마디로 정리하면: **"더 빠르게, 더 간단하게"**

### 올인원 도구의 등장: Biome

ESLint + Prettier 조합은 다들 써봤겠지만, 
설정 파일만 4~5개이고 플러그인 충돌 잡느라 시간 다 간다..☠️

Biome은 린팅이랑 포매팅을 하나로 합친 거라고 한다. 설정 파일도 `biome.json` 하나면 끝.

### 성능 비교

| 작업 | ESLint/Prettier | Biome | 차이 |
| --- | --- | --- | --- |
| 린팅 (10,000파일) | 45.2초 | 0.8초 | **56배 빠름** |
| 포맷팅 | 12.1초 | 0.3초 | **40배 빠름** |

> "Lint 작업에서 ESLint: 16.32s, Biome: 0.79s로 약 **20배 더 빠른 성능**을 보여주었다."
— [Biome가 ESLint와 Prettier를 대체할 수 있을까? - 후니네 개발하우스](https://hooninedev.com/241201/)
> 

### Biome이 빠른 이유

Biome은 Rust로 만들어져서 네이티브로 돌아가고, 
파일을 한 번만 파싱해서 린팅+포매팅을 같이 처리한다. 
ESLint+Prettier는 각각 따로 파싱하니까 느릴 수밖에 없다.

### 바로 시작 지향

요즘 도구들은 **"설정 없이 바로 시작"**을 지향한다.

- **Vite**: `npm create vite`하면 바로 개발 시작
- **Turbopack**: Next.js 14+에서 기본 번들러
- **Bun**: 런타임 + 번들러 + 패키지 매니저 올인원

과거에는 "모든 걸 설정할 수 있어야 한다"가 미덕이었는데, 
지금은 "좋은 기본값으로 바로 시작"이 트렌드인 것 같다.

### 참고 자료

- [Biome: ESLint와 Prettier를 대체할 수 있을까?](https://pockit.tools/ko/blog/biome-eslint-prettier-migration-guide/)
- [완벽한 린터를 기다리지 않기로 했다 - 레몬베이스](https://blog.lemonbase.team/%EC%99%84%EB%B2%BD%ED%95%9C-%EB%A6%B0%ED%84%B0%EB%A5%BC-%EA%B8%B0%EB%8B%A4%EB%A6%AC%EC%A7%80-%EC%95%8A%EA%B8%B0%EB%A1%9C-%ED%96%88%EB%8B%A4-eslint-v9-%EB%A7%88%EC%9D%B4%EA%B7%B8%EB%A0%88%EC%9D%B4%EC%85%98-%EA%B7%B8%EB%A6%AC%EA%B3%A0-biome-%ED%95%98%EC%9D%B4%EB%B8%8C%EB%A6%AC%EB%93%9C-%EB%8F%84%EC%9E%85%EA%B8%B0-0a51bd5792f6)
- [Biome, ESLint와 Prettier의 대체](https://velog.io/@simjieun/Biome-ESLint%EC%99%80-Prettier%EC%9D%98-%EB%8C%80%EC%B2%B4)
- [Biome가 ESLint와 Prettier를 대체할 수 있을까? - 후니네 개발하우스](https://hooninedev.com/241201/)

---

## 5. 마무리

DX는 결국 **"개발할 때 얼마나 덜 고통받는가?"**의 문제다.

- 빌드 오래 걸리면 → 나쁜 DX
- 에러 메시지가 불친절하면 → 나쁜 DX
- 문서가 부실하면 → 나쁜 DX
- 설정이 복잡하면 → 나쁜 DX

새로운 도구나 라이브러리 선택할 때, 기능만 보지 말고 DX도 같이 고려해보면 좋겠다.

### AI가 추천해준 간단 체크리스트

이걸 참고해서 미래에 DX도 고려해보는 것도 좋을 것 같다!

- [ ]  설치/설정이 간단한가?
- [ ]  문서가 잘 되어 있는가?
- [ ]  에러 메시지가 친절한가?
- [ ]  속도가 빠른가?
- [ ]  타입 지원이 되는가?
