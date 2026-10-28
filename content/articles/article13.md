---
id: "article13"
title: "CORS"
kinds: ["스터디"]
stacks: ["CORS"]
date: "2026-04-08"
excerpt: "CORS 에러는 서버가 아니라 브라우저가 막는다. 동일 출처 정책이 생긴 이유부터 Preflight 요청, credentials 설정까지 정리했다."
---

## 1. 🗺️ 개념 지도 (Overview)

### **한 줄 요약:**

```
"브라우저가 다른 출처의 서버에 요청을 보낼 때, 서버가 그 요청을 허용했는지 확인하는 보안 메커니즘"
```

### **이 주제가 왜 중요한가?**

- 프론트엔드 개발 중 가장 자주 마주치는 에러 중 하나가 CORS 에러
- 단순히 에러를 해결하는 것을 넘어, **왜 이 정책이 존재하는지**까지 이해해야 함!
- SOP(동일 출처 정책)와 세트로 이해해야 하며, 보안 위협(CSRF)과도 연결되는 중요한 개념

**관련 키워드 (마인드맵 형태로 나열):**

```
[CORS]
├── Origin (출처)
│   ├── 프로토콜 (http/https)
│   ├── 호스트 (domain)
│   └── 포트 (port)
├── SOP (Same-Origin Policy)
│   └── CORS가 등장한 배경
├── 요청 유형
│   ├── Simple Request (단순 요청)
│   └── Preflight Request (예비 요청)
├── 주요 HTTP 헤더
│   ├── Access-Control-Allow-Origin        (모든 CORS 응답)
│   ├── Access-Control-Allow-Methods       (Preflight 응답 전용)
│   ├── Access-Control-Allow-Headers       (Preflight 응답 전용)
│   └── Access-Control-Allow-Credentials  (인증 정보 포함 요청)
└── 해결 방법
    ├── 서버에서 헤더 설정
    └── 프록시 서버 활용
```

---

## 2. 📖 핵심 개념 정리

### 2-1. Origin (출처)와 SOP (동일 출처 정책)

**개념 설명 (내 말로):**

> "출처(Origin)"는 URL의 프로토콜 + 호스트 + 포트를 합친 것이다. 이 셋이 모두 같아야 "같은 출처"이고, 하나라도 다르면 "다른 출처(Cross-Origin)"다.
> 
> SOP(Same-Origin Policy)는 브라우저가 기본적으로 가지고 있는 보안 정책으로, **스크립트가 다른 출처의 리소스에 접근하지 못하도록 막는다.** 이 정책 덕분에 내가 악성 사이트에 접속하더라도, 그 사이트의 스크립트가 내 은행 계좌 정보에 멋대로 접근하지 못한다.
> 
> CORS는 SOP의 제약을 **서버가 명시적으로 허용하는 방식으로** 완화하는 메커니즘이다.
> 

**동작 원리 / 흐름:**

1. 브라우저에서 다른 출처로 fetch 요청을 보낸다
2. 브라우저는 요청 헤더에 `Origin` 값을 자동으로 담는다
3. 서버는 응답 헤더에 `Access-Control-Allow-Origin`을 담아서 응답한다
4. 브라우저는 내 출처(Origin)가 서버가 허용한 출처 목록에 포함되는지 확인한다
5. 불일치하면 → 응답을 차단하고 콘솔에 CORS 에러를 표시한다

**실제 코드 예시:**

```jsx
// 개발자도구 콘솔에서 바로 실행해보기 가능

// ✅ 성공 케이스: naver.com 콘솔에서 실행
// jsonplaceholder는 Access-Control-Allow-Origin: * 을 응답 헤더에 설정한 공개 테스트 API
fetch("https://jsonplaceholder.typicode.com/posts/1")
  .then(res => res.json())
  .then(data => console.log("✅ 성공:", data));

// ❌ 실패 케이스: naver.com 콘솔에서 실행
// google.com은 CORS 헤더를 응답에 달지 않아서 브라우저가 차단
fetch("https://www.google.com")
  .then(res => res.text())
  .then(data => console.log("성공:", data))
  .catch(err => console.error("❌ CORS 에러:", err));

// 👉 Network 탭 → 각 요청 클릭 → Headers 탭 → Response headers 확인
// jsonplaceholder: Access-Control-Allow-Origin: https://현재사이트.com 존재 → 허용
//                  (요청의 Origin 헤더 값을 그대로 반영해주는 방식. 어느 출처에서 요청해도 허용됨)
// google.com:      Response headers 비어있음, "Provisional headers" 경고 → 차단
```

### **핵심 포인트:**

- 출처 비교: `프로토콜 + 호스트 + 포트` 세 가지가 모두 일치해야 같은 출처
- `https://example.com`과 `http://example.com`은 **프로토콜이 달라** 다른 출처
- `http://example.com`과 `http://example.com:8080`은 **포트가 달라** 다른 출처
- CORS 에러는 **브라우저가 막는 것**이다. 요청 자체는 서버에 도달한다!

---

### 2-2. Simple Request (단순 요청)

**개념 설명 (내 말로):**

> 브라우저가 "이 정도는 위험하지 않겠다"고 판단해서, 예비 요청(Preflight) 없이 바로 본 요청을 보내는 방식이다. 요청을 보내고 난 뒤, 서버의 응답 헤더를 보고 CORS 정책 위반인지 확인한다.
> 

**동작 원리 / 흐름:**

1. 브라우저가 `Origin` 헤더를 붙여서 서버에 바로 요청
2. 서버가 응답 헤더에 `Access-Control-Allow-Origin` 포함해서 응답
3. 브라우저가 응답의 `Access-Control-Allow-Origin` 값을 확인
4. 허용되면 → 응답 데이터를 JS에서 사용 가능
5. 허용 안 되면 → 응답을 막고 CORS 에러 표시 (서버에는 이미 요청이 전달된 상태)

**단순 요청으로 인정받기 위한 조건(모두 충족해야 함):**

- ✅ 메서드: GET, HEAD, POST 중 하나
- ✅ 헤더: Accept, Accept-Language, Content-Language, Content-Type만 사용
- ✅ Content-Type: application/x-www-form-urlencoded, multipart/form-data, text/plain만 허용

**실제 코드 예시:**

```jsx
// 개발자도구 콘솔에서 바로 실행해보기 가능

// ✅ 단순 요청 (Simple Request): GET + 기본 헤더만 → Preflight 없이 바로 전송
// Network 탭에서 OPTIONS 요청 없이 GET 하나만 나가는 걸 확인할 수 있음
fetch("https://jsonplaceholder.typicode.com/posts/1")
  .then(res => res.json())
  .then(data => console.log("단순 요청 성공:", data));

// ❌ 단순 요청이 아닌 경우 (Preflight 발생):
// Content-Type: application/json → 단순 요청의 허용 Content-Type이 아니므로 Preflight 발생
// Network 탭에서 OPTIONS 요청이 먼저 나가는 걸 확인할 수 있음
fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "테스트", body: "내용", userId: 1 }),
})
  .then(res => res.json())
  .then(data => console.log("POST 성공:", data));
```

### **핵심 포인트:**

- 실무에서 REST API는 대부분 `Content-Type: application/json`을 사용 → 거의 대부분 Preflight가 발생한다고 봐도 무방함
- 단순 요청도 CORS 위반이면 응답이 차단된다. **요청 자체는 서버에 도달한다는 점**을 기억하자

---

### 2-3. Preflight Request (예비 요청)

**개념 설명 (내 말로):**

> 단순 요청(Simple Request) 조건을 벗어난 요청은 서버에 영향을 줄 수 있으니, 브라우저가 먼저 "이 요청 보내도 돼?"라고 서버에 물어보는 과정이다. OPTIONS 메서드로 예비 요청을 먼저 보내고, 서버가 허용하면 그때 본 요청을 보낸다.
> 
> Preflight가 발생하는 대표적인 경우: PUT/DELETE 메서드 사용, Content-Type이 `application/json`(단순 요청의 허용 Content-Type이 아님), `Authorization` 같은 커스텀 헤더 포함.
> 

**동작 원리 / 흐름:**

1. 브라우저가 `OPTIONS` 메서드로 예비 요청 전송
    - 요청 헤더에 `Access-Control-Request-Method`, `Access-Control-Request-Headers` 포함
2. 서버가 허용 가능한 메서드/헤더 목록을 응답 헤더에 담아서 응답
3. 브라우저가 예비 요청 응답을 확인 → 허용 여부 판단
4. 허용되면 → 실제 요청(본 요청) 전송
5. 서버가 본 요청에 응답

**실제 코드 예시:**

```jsx
// Content-Type: application/json → Preflight 발생
// Network 탭에서 확인: OPTIONS 요청이 먼저, 그 다음 POST 요청 순으로 2개 나감
fetch("https://jsonplaceholder.typicode.com/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",  // 이 헤더 때문에 Preflight 발생
  },
  body: JSON.stringify({ title: "테스트" }),
})
  .then(res => res.json())
  .then(data => console.log("성공:", data));

// 브라우저가 내부에서 먼저 보내는 예비 요청 구조 (직접 보내는 게 아님, 브라우저가 자동으로 처리)
// OPTIONS https://jsonplaceholder.typicode.com/posts
// Origin: https://현재사이트.com
// Access-Control-Request-Method: POST
// Access-Control-Request-Headers: Content-Type
```

**실제 jsonplaceholder가 OPTIONS(Preflight) 요청에 응답하는 헤더:**

```jsx
/* Access-Control-Allow-Methods, Access-Control-Allow-Headers는 본 요청 응답이 아닌 Preflight 응답에 붙는 헤더임 */
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://현재사이트.com  /* 요청한 Origin을 그대로 반영 */
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, HEAD, PUT, PATCH, POST, DELETE
Access-Control-Allow-Headers: Content-Type
```

> 📌 `Access-Control-Max-Age`는 jsonplaceholder가 보내지 않는 헤더라 위 응답에는 없다.
> 서버에서 직접 설정할 때는 아래처럼 추가할 수 있다.
> 
> `Access-Control-Max-Age: 86400`
> 
> 이 값을 지정하면 브라우저가 그 시간(초) 동안 Preflight 결과를 캐싱해서 매번 OPTIONS 요청을 보내지 않아도 된다.
> 단, 브라우저마다 내부 상한이 있어서 설정값이 그대로 적용되지 않을 수 있다 (Chrome은 최대 7200초).
> 

### **핵심 포인트:**

- `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`는 Preflight(OPTIONS) 응답에만 붙는 헤더. 본 요청 응답에는 없음
- 개발자 도구 Network 탭에서 OPTIONS 요청으로 확인 가능
- Preflight 자체가 200 응답이어도, 허용된 출처/메서드가 맞지 않으면 CORS 에러 발생

---

## 3. 🔍 깊이 이해하기

### 왜 이렇게 설계됐을까? (Design Decision)

> 💡
>
> **흐름으로 이해하기**
> 브라우저에는 원래부터 SOP(동일 출처 정책)가 있었다. 그런데 웹이 발전하면서 프론트엔드와 백엔드가 다른 도메인에 있는 구조가 일반화되자, SOP 때문에 통신 자체가 안 되는 문제가 생겼다. 그래서 "SOP는 유지하되, 서버가 명시적으로 허용한 출처에 한해서만 예외를 허용하자"는 메커니즘으로 CORS가 등장했다.

> 📍
>
> **공식 문서 기준으로는 순서가 역전된다.** 
> SOP는 1995년부터 브라우저에 구현되어 있었지만 RFC 공식 문서로 정리된 건 2011년(RFC 6454)이고, CORS라는 이름은 2009년에 먼저 등장했다. 즉 실제 개념의 등장은 SOP → CORS 순이지만, 공식 문서화는 CORS → SOP 순이다.

- **SOP가 필요한 이유**: 악의적인 사이트가 사용자 브라우저를 통해 다른 사이트(은행, SNS 등)에 몰래 요청을 보내는 CSRF 공격을 막기 위함
- **CORS가 필요한 이유**: SOP가 너무 엄격하면 현대 웹 개발이 불가능하다. 프론트엔드와 백엔드가 다른 도메인에 있는 경우가 대부분이기 때문. CORS는 서버가 "나는 이 출처는 믿어"라고 명시적으로 선언하는 방식
- **Preflight가 필요한 이유**: 서버 데이터를 변경할 수 있는 요청(PUT/DELETE 등)은 한 번 서버에 도달하면 되돌릴 수 없다. Preflight를 통해 서버가 CORS를 인식하고 있는지 사전에 확인하여 의도치 않은 데이터 변경을 막기 위함
- **CORS는 브라우저 정책이다**: 서버 간 통신(Node.js에서 다른 서버로 fetch)에는 CORS가 적용되지 않는다. 오직 브라우저에서 시작된 요청에만 적용됨

### 다른 개념과의 비교

| 구분 | SOP (Same-Origin Policy) | CORS |
| --- | --- | --- |
| 정의 | 같은 출처의 리소스만 공유 가능하다는 브라우저 보안 정책 | SOP를 유지하면서, 서버가 허용한 범위 내에서만 예외적으로 다른 출처 접근을 허용하는 메커니즘 |
| 주체 | 브라우저가 자동으로 적용 | 서버가 응답 헤더를 설정, 브라우저가 확인 후 집행 |
| 역할 | 기본 제한 규칙 | SOP 안에서의 허용 예외 선언 |
| 해결 주체 | 변경 불가 (브라우저 내장 정책) | 서버에서 헤더 설정으로 해결 |

| 구분 | Simple Request | Preflight Request |
| --- | --- | --- |
| 예비 요청 | 없음 (바로 본 요청) | 있음 (OPTIONS → 본 요청) |
| 조건 | GET/HEAD/POST + 안전한 헤더만 | 그 외 모든 경우 |
| 실무 빈도 | 낮음 (application/json이면 해당 안 됨) | 높음 (대부분의 REST API) |
| 서버 도달 | 요청이 서버에 도달함 | Preflight만 먼저 도달, 허용 후 본 요청 전달 |

### 실무에서는 어떻게 쓰이나?

- **개발 환경에서 가장 흔한 케이스**: 프론트 `localhost:3000` ↔ 백엔드 `localhost:8080` 
→ 포트가 다르면 CORS 발생. Vite/CRA의 proxy 설정으로 해결하는 경우가 많음
- **배포 후**: 프론트 `https://my-app.com` ↔ 백엔드 `https://api.my-app.com` 
→ 서브도메인이 달라 CORS 발생. 서버에서 `Access-Control-Allow-Origin: https://my-app.com` 설정으로 해결
- **쿠키/인증 정보 포함 요청**: `credentials: 'include'` 옵션 사용 시, 서버에서 `Access-Control-Allow-Credentials: true` + `Access-Control-Allow-Origin`을 `*`가 아닌 특정 출처로 지정해야 함
- **CDN/외부 폰트/이미지**: `<img>`, `<link>`, `<script>` 태그는 CORS 대상이 아님. 문제는 JS에서 `fetch`로 가져올 때 발생

**나의 경험:**

- 프론트엔드를 `localhost:5173`에서 개발하면서 백엔드 API를 `localhost:3000`으로 호출할 때 포트가 달라 CORS 에러가 났다. 개발 환경에서는 Vite의 proxy 설정으로, 배포 환경에서는 서버에서 허용 출처를 명시적으로 지정해 해결했다.

---

## 4. ❓ 스스로 묻고 답하기

### 기본 질문

- **Q1. CORS가 무엇인지 설명해주세요.**
    
    > A: CORS는 브라우저가 다른 출처(Cross-Origin)의 서버로 요청을 보낼 때, 서버가 그 요청을 허용했는지 확인하는 메커니즘입니다. 브라우저는 기본적으로 동일 출처 정책(SOP)에 의해 다른 출처로의 요청을 제한하는데, 서버가 응답 헤더에 `Access-Control-Allow-Origin`을 설정하면 브라우저가 이를 확인하고 허용 여부를 결정합니다.
    > 
- **Q2. 출처(Origin)는 어떻게 구분하나요?**
    
    > A: 출처는 프로토콜 + 호스트 + 포트 세 가지의 조합입니다. 이 중 하나라도 다르면 다른 출처로 간주됩니다. 예를 들어 `http://example.com`과 `https://example.com`은 프로토콜이 달라 다른 출처이고, `http://example.com`과 `http://example.com:8080`은 포트가 달라 다른 출처입니다.
    > 
- **Q3. CORS 에러가 발생했을 때 어떻게 해결하나요?**
    
    > A: CORS는 서버 측에서 해결해야 합니다. 서버의 응답 헤더에 `Access-Control-Allow-Origin`을 설정해서 허용할 출처를 명시하면 됩니다. 개발 환경에서는 Vite나 webpack-dev-server의 proxy 설정을 사용해 브라우저가 다른 출처로 직접 요청하지 않도록 우회하는 방법도 있습니다.
    > 

---

### 심화 질문

- **Q4. Preflight 요청이 무엇이고, 언제 발생하나요?**
    
    > A: Preflight는 브라우저가 본 요청을 보내기 전에 OPTIONS 메서드로 서버에 "이 요청 보내도 돼?"라고 먼저 확인하는 예비 요청입니다. PUT/DELETE 메서드를 사용하거나, Content-Type이 application/json이거나, Authorization 같은 커스텀 헤더를 사용할 때 발생합니다. 서버가 Preflight에 허용 응답을 주면 그때 본 요청을 보냅니다. `Access-Control-Max-Age` 헤더로 Preflight 결과를 캐싱해서 매번 재전송을 방지할 수도 있습니다.
    > 
- **Q5. `Access-Control-Allow-Origin: *`과 특정 출처 지정의 차이는 무엇인가요?**
    
    > A: `*`은 모든 출처의 요청을 허용하는 와일드카드입니다. 단, 쿠키나 Authorization 헤더 같은 인증 정보(credentials)가 포함된 요청에서는 `*`를 사용할 수 없습니다. `credentials: 'include'` 옵션을 사용한다면 서버에서 `Access-Control-Allow-Credentials: true`와 함께 특정 출처를 명시해야 합니다. 보안 측면에서도 공개 API가 아니라면 와일드카드보다 허용할 출처를 명시하는 것이 좋습니다.
    > 

---

### 🧨 헷갈리기 쉬운 질문

- **Q6. CORS는 브라우저 보안 정책인데, 서버에서 해결하는 이유가 뭔가요?**
    
    > A: CORS 정책은 브라우저가 실행하지만, 어떤 출처를 허용할지는 서버가 결정합니다. 서버가 허용 출처를 응답 헤더에 명시하면 브라우저가 그 규칙에 따라 허용 여부를 결정하는 구조입니다. 프론트엔드에서 헤더를 임의로 수정해 우회하는 건 불가능하고, 서버에서 헤더를 올바르게 설정하는 것이 근본적인 해결입니다. 또한, Node.js에서 다른 서버로 fetch를 보내는 서버 간 통신에는 CORS가 적용되지 않는다는 점도 이와 같은 맥락입니다.
    > 
- **Q7. Preflight 응답이 200인데도 CORS 에러가 나는 이유가 뭔가요?**
    
    > A: 브라우저는 Preflight의 HTTP 상태 코드(200 여부)가 아니라, 응답 헤더에 담긴 `Access-Control-Allow-Origin` 등의 값이 실제 요청의 출처/메서드/헤더와 일치하는지를 보고 허용 여부를 판단합니다. 200이 와도 허용 헤더가 없거나 값이 맞지 않으면 CORS 에러가 발생합니다.
    > 

---

## 5. 📝 나만의 요약 노트

### 오늘 이 주제에서 가장 중요한 것 3가지

1. **CORS 에러는 브라우저가 막는 것이다** → 요청은 이미 서버에 도달했을 수 있다. 해결은 서버에서.
2. **Preflight는 서버를 보호하기 위한 사전 확인이다** → OPTIONS 먼저 보내고, 허용되면 본 요청 전송
3. **credentials 포함 요청은** `*`  **못 씀** → 반드시 특정 출처 명시 + `Access-Control-Allow-Credentials: true` 필요

### 헷갈렸던 부분 & 해결

| 헷갈린 것 | 알고 보니 |
| --- | --- |
| `*` 로 설정하면 다 해결되는 줄 알았다 | credentials 사용 시 `*` 불가. 특정 출처 명시해야 함 |
| CORS 적용 범위를 잘 몰랐다 | CORS는 브라우저 정책. 서버 to 서버는 해당 없음 |
| Preflight 응답이 200인데 에러가 났다 | 200 여부가 아니라 응답 헤더의 내용(허용 출처/메서드)을 보고 판단한다 |
| CORS 에러가 서버 문제인 줄 알았다 | 실제로는 브라우저가 응답을 막는 것. 정책은 브라우저가 실행하고, 허용 설정은 서버에서 한다 |

---

## 6. 📚 참고 자료

| 자료 | 링크 | 추천 이유 |
| --- | --- | --- |
| MDN - CORS | [https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) | 가장 공신력 있는 공식 문서. 시나리오별 상세 설명 |
| ko.javascript.info - CORS | [https://ko.javascript.info/fetch-crossorigin](https://ko.javascript.info/fetch-crossorigin) | 한국어 설명, 단계별 흐름이 깔끔함 |
| 에반의 블로그 - CORS는 왜 우리를 힘들게 할까 | [https://evan-moon.github.io/2020/05/21/about-cors/](https://evan-moon.github.io/2020/05/21/about-cors/) | 국내 개발자 블로그 |
| 토스페이먼츠 - CORS 개념 | [https://docs.tosspayments.com/resources/glossary/cors](https://docs.tosspayments.com/resources/glossary/cors) | IT 기업의 공신력 있는 설명. 개념 정리가 깔끔함 |
| 토스페이먼츠 - 결제창에서 CORS 대응하기 | [https://docs.tosspayments.com/blog/payment-window-cors-error](https://docs.tosspayments.com/blog/payment-window-cors-error) | 결제 리다이렉트 시 origin 불일치로 CORS 에러 나는 실제 실무 케이스 |
