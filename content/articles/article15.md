---
id: "article15"
title: "JWT와 인증 전략"
kinds: ["스터디"]
stacks: ["JWT"]
date: "2026-04-29"
excerpt: "서버가 사용자의 로그인 상태를 어떻게 확인하고 유지하는지에 대한 전략..."
---

## 1. 🗺️ 개념 지도 (Overview)

### **한 줄 요약:**

```
서버가 사용자의 로그인 상태를 어떻게 확인하고 유지하는지에 대한 전략
```

### **이 주제가 왜 중요한가?**

- 로그인이 필요한 서비스라면 반드시 구현해야 하는 핵심 기능이다
- 어떤 전략을 쓰느냐에 따라 보안성과 사용자 경험이 크게 달라진다
- 면접에서 "JWT가 뭔가요?", "AccessToken과 RefreshToken을 왜 나눠서 쓰나요?" 같은 질문이 자주 나온다
- 지난 주에 공부한 브라우저 저장소(쿠키, localStorage)와 직접 연결되는 내용이다

**관련 키워드 (마인드맵 형태로 나열):**

```
[JWT와 인증 전략]
├── 인증(Authentication) vs 인가(Authorization)
├── JWT
│   ├── Header
│   ├── Payload
│   └── Signature
├── 인증 전략
│   ├── 단일 AccessToken
│   └── AccessToken + RefreshToken
│       ├── Silent Refresh
│       └── Refresh Token Rotation
└── 저장소 전략
    ├── 메모리(JS 변수)
    ├── localStorage
    └── HttpOnly 쿠키
```

## 배경지식 — 인증이 왜 필요한가?

> 
> 
> 
> HTTP는 기본적으로 상태를 저장하지 않는다(Stateless). 
> 요청이 끝나면 서버는 그 연결을 기억하지 않는다.
> 그래서 로그인을 했더라도 다음 요청을 보낼 때 
> "나 로그인한 사람이에요"라는 걸 매번 증명해야 한다.
> 이 증명 방식을 어떻게 설계하느냐가 인증 전략의 핵심이다.
> 

**인증 vs 인가:**

- **인증(Authentication)**: 이 사람이 누구인가? → 로그인 과정
- **인가(Authorization)**: 이 사람이 이걸 할 수 있는가? → 권한 확인

```json
로그인           → 인증 (본인 확인)
마이페이지 접근    → 인가 (로그인한 사람만 가능)
관리자 페이지      → 인가 (관리자 권한이 있는 사람만 가능)
```

## 배경지식 — JWT말고 다른 종류도 있을텐데 왜 JWT?

인증 방식이 JWT만 있는 건 아니다. 가장 전통적인 방식은 **세션 기반 인증이다.**

**세션 기반 인증:**

- 서버가 로그인 상태를 DB나 Redis에 저장
- 클라이언트는 세션 ID만 쿠키에 들고 다님
- 요청마다 서버가 저장소에서 세션 ID를 조회해서 누군지 확인

이 방식은 단순하고 토큰 무효화가 즉시 가능하다는 장점이 있지만, 서버가 여러 대로 늘어나면 문제가 생긴다. 각 서버가 세션 저장소를 공유해야 하고, 요청마다 DB를 조회해야 하는 비용도 부담이 된다.

현대 웹 서비스는 트래픽을 감당하기 위해 서버를 여러 대로 확장하는 구조가 일반적이다. JWT는 이 구조에 맞게 설계됐다. 

**JWT가 확장에 유리한 이유:** 

- 토큰 자체에 사용자 정보가 들어있어서 서버가 DB를 조회하지 않아도 됨
- 서버가 몇 대든 각각 독립적으로 토큰을 검증할 수 있음

```jsx
세션 방식  → 서버가 상태를 저장 (Stateful) → 확장에 불리
JWT 방식   → 토큰 자체에 정보 포함 (Stateless) → 확장에 유리
```

물론 JWT도 단점이 있다. 

**JWT의 단점:** 

- 한 번 발급하면 만료 전까지 서버가 무효화하기 어려움
- Payload가 누구나 디코딩할 수 있어서 민감한 정보를 담으면 안됨

그래서 보안이 극도로 중요한 서비스에서는 여전히 세션 방식을 쓰기도 한다. 그럼에도 **서버 확장성과 DB 조회 비용 절감** 덕분에 JWT가 현대 웹의 인증 표준으로 자리잡았고, 별다른 특수 요구사항이 없다면 대부분의 서비스에서 JWT를 사용한다.

그래서 이번 스터디에서는 JWT가 어떤 구조로 동작하는지, 그리고 실무에서 JWT를 어떻게 활용하는지 인증 전략 종류들을 살펴볼 예정!!

---

## 2. 📖 핵심 개념 정리

### 2-1. JWT (JSON Web Token)

**개념 설명 (내 말로):**

> 
> 
> 
> JWT는 사용자 정보를 JSON 형태로 담아 인코딩한 토큰이다.
> 서버가 로그인에 성공한 사용자에게 발급해주고, 이후 요청마다 이 토큰을 같이 보내면
> 서버가 토큰을 보고 누구인지 확인한다.
> 핵심은 서버가 별도로 상태를 저장하지 않아도 된다는 점이다. 토큰 자체에 정보가 들어있기 때문이다.
> 

**동작 원리 / 흐름:**

1. 사용자가 아이디/비밀번호로 로그인 요청
2. 서버가 확인 후 JWT 발급
3. 클라이언트가 토큰 저장
4. 이후 요청마다 헤더에 토큰 포함
5. 서버가 토큰의 Signature 검증 후 응답

**JWT 구조:**

JWT는 점(.)으로 구분된 세 파트로 이루어진다.

```jsx
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.abc123
      Header            Payload       Signature
```

- **Header**: 토큰 타입(JWT)과 서명에 사용한 알고리즘 정보
- **Payload**: 실제로 담고 싶은 데이터 (userId, role, 만료 시간 등)
- **Signature**: Header + Payload를 서버의 비밀 키로 서명한 값

```json
// Payload 예시 (디코딩하면 이런 JSON이 나옴)
{
  "userId": 1,
  "role": "user",
  "exp": 1700000000  // 만료 시간 (Unix timestamp)
}
```

### **핵심 포인트:**

- Payload는 Base64로 인코딩된 것이지 암호화가 아니다. 누구나 디코딩해서 내용을 볼 수 있다. 그래서 비밀번호 같은 민감한 정보는 절대 넣으면 안 된다.
- Signature는 서버만 알고 있는 비밀 키로 만들어진다. 누군가 Payload를 변조하면 Signature 검증에서 실패하기 때문에 무결성이 보장된다.
- 서버는 토큰을 저장하지 않는다. 요청이 올 때마다 Signature만 검증하면 되기 때문에 서버를 여러 대로 확장할 때 유리하다(Stateless).

---

### 2-2. 단일 AccessToken 전략

**개념 설명 (내 말로):**

> 가장 단순한 방식으로, 로그인 시 AccessToken 하나만 발급하고 모든 인증에 사용한다.
> 

**동작 원리 / 흐름:**

1. 사용자가 로그인
2. 서버가 AccessToken 발급
3. 클라이언트가 AccessToken 저장
4. 이후 모든 요청 헤더에 AccessToken 포함
5. 서버가 토큰 검증 후 응답

**실제 코드 예시:**

```jsx
// 요청 시 토큰을 헤더에 담아 보냄
fetch('/api/user', {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
});
```

### **핵심 포인트:**

- 만료 기간을 짧게 설정하면 보안은 좋지만 자주 로그인해야 하는 UX 문제가 생긴다
- 만료 기간을 길게 설정하면 편하지만 토큰이 탈취됐을 때 만료될 때까지 막을 방법이 없다
- JWT는 한 번 발급되면 서버가 무효화할 수 없다는 태생적인 한계가 있다

---

### 2-3. AccessToken + RefreshToken 전략

**개념 설명 (내 말로):**

> 
> 
> 
> 단일 토큰의 딜레마(짧으면 불편, 길면 위험)를 해결하기 위해 토큰을 두 개로 나눈 전략이다.
> AccessToken은 짧게 유지해서 보안을 높이고, RefreshToken으로 AccessToken을 재발급받아 UX를 유지한다.
> 

**각 토큰의 역할:**

| 토큰 | 만료 기간 | 역할 | 저장 위치 |
| --- | --- | --- | --- |
| AccessToken | 짧게 (15분~1시간) | 실제 API 요청 인증에 사용 | 메모리(JS 변수) |
| RefreshToken | 길게 (7일~30일) | AccessToken 재발급 요청에만 사용 | HttpOnly 쿠키 |

**동작 원리 / 흐름:**

```jsx
1. 로그인
   → 서버가 AccessToken + RefreshToken 발급
   → AccessToken은 메모리에, RefreshToken은 HttpOnly 쿠키에 저장

2. API 요청
   → 헤더에 AccessToken 담아서 요청
   → 서버가 검증 후 응답

3. AccessToken 만료
   → 서버가 401 응답
   → 클라이언트가 RefreshToken으로 재발급 요청
   → 서버가 새 AccessToken 발급
   → 재발급받은 AccessToken으로 원래 요청 재시도

4. RefreshToken도 만료
   → 로그아웃 처리, 다시 로그인 필요
```

**Silent Refresh:**

> AccessToken이 만료된 후 재발급하면 요청이 잠깐 끊기는 느낌이 날 수 있다.
Silent Refresh는 만료되기 직전에 미리 재발급 요청을 보내서 사용자가 끊김을 느끼지 못하게 하는 방식이다.
> 

```json
// AccessToken 만료 1분 전에 미리 재발급 요청
// 만료 시간은 서버가 Payload의 exp 값으로 전달해줌
const exp = JSON.parse(atob(accessToken.split('.')[1])).exp;
const now = Math.floor(Date.now() / 1000);
const REFRESH_BEFORE = 60; // 만료 1분 전

setTimeout(() => {
  refreshAccessToken();
}, (exp - now - REFRESH_BEFORE) * 1000);
```

**Refresh Token Rotation:**

> 
> 
> 
> RefreshToken도 탈취될 수 있다. 이를 방어하기 위한 전략이다.
> AccessToken을 재발급할 때 RefreshToken도 같이 새로 발급하고, 기존 RefreshToken은 폐기한다.
> 만약 탈취된 RefreshToken으로 재발급 요청이 오면, 이미 폐기된 토큰이므로 서버가 감지하고 모든 세션을 무효화할 수 있다.
> 

```json
정상적인 흐름:
RefreshToken A → AccessToken 재발급 + RefreshToken B 발급 → A 폐기

탈취 감지:
해커가 RefreshToken A로 재발급 요청
→ A는 이미 폐기된 토큰
→ 서버: 누군가 탈취한 토큰을 쓰고 있다고 판단
→ 해당 사용자의 모든 RefreshToken 무효화
```

### **핵심 포인트:**

- RefreshToken을 HttpOnly 쿠키에 저장하는 이유: JS로 접근이 불가능해서 XSS 공격으로 탈취할 수 없다
- AccessToken을 메모리에 저장하는 이유: localStorage보다 XSS에 안전하다. 새로고침 시 사라지는 단점은 RefreshToken으로 재발급받아 해결한다
- RefreshToken은 재발급 API에만 사용하고, 일반 API 요청에는 절대 사용하지 않는다

---

### 2-4. 저장소 전략 정리

**개념 설명 (내 말로):**

> 
> 
> 
> 어디에 저장하느냐에 따라 XSS와 CSRF 중 어떤 공격에 취약한지가 달라진다.
> 완벽한 저장소는 없고, 트레이드오프를 이해하고 선택해야 한다.
> 

**주요 공격 종류:**

- **XSS**: 공격자가 악성 JS 코드를 심어서 토큰을 탈취하는 공격
- **CSRF**: 외부 사이트에서 사용자 모르게 요청을 보내는 공격 (쿠키가 자동 전송되는 특성 악용)

**저장소별 비교:**

| 저장 위치 | XSS 취약 | CSRF 취약 | 특징 |
| --- | --- | --- | --- |
| 메모리(JS 변수) | △ (공격 난이도 높음) | ❌ | 새로고침 시 사라짐 |
| localStorage | ✅ | ❌ | 영구 저장, JS로 접근 가능 |
| HttpOnly 쿠키 | ❌ | ✅ | JS 접근 불가, 자동 전송 |

**권장 조합:**

- AccessToken  → 메모리 (XSS로 읽기 어려움)
- RefreshToken → HttpOnly 쿠키 + SameSite=Strict (CSRF 방어)

---

## 3. 🔍 깊이 이해하기

### 왜 이렇게 설계됐을까? (Design Decision)

- HTTP가 Stateless라는 특성 때문에 매 요청마다 인증이 필요하다. 
세션 방식은 서버가 상태를 저장해야 해서 서버가 여러 대로 늘어나면 세션 공유 문제가 생긴다. 
JWT는 토큰 자체에 정보를 담아 서버가 상태를 저장하지 않아도 되는 Stateless 방식으로 이 문제를 해결했다.
- 단일 토큰의 보안/UX 트레이드오프를 해결하기 위해 AccessToken + RefreshToken 방식이 나왔다. 
짧게 유효한 AccessToken으로 보안을 높이고, RefreshToken으로 자동 재발급해서 사용자 경험을 유지한다.

### 다른 개념과의 비교

| 구분 | 세션 기반 인증 | JWT 기반 인증 |
| --- | --- | --- |
| 상태 저장 위치 | 서버 (DB, Redis) | 클라이언트 (토큰 자체) |
| 서버 확장성 | 낮음 (세션 공유 필요) | 높음 (토큰만 검증) |
| 토큰 무효화 | 즉시 가능 (서버에서 삭제) | 어려움 (만료까지 유효) |
| 주요 사용처 | 레거시 서비스 | 현대 웹/앱 서비스 |

### 실무에서는 어떻게 쓰이나?

- 대부분의 현대 웹 서비스는 JWT + AccessToken/RefreshToken 조합을 사용한다
- axios interceptor를 활용해 AccessToken 만료 시 자동으로 재발급 요청을 보내고 원래 요청을 재시도하는 패턴을 많이 쓴다
- 보안이 중요한 서비스일수록 Refresh Token Rotation을 적용한다

```jsx
// axios interceptor로 자동 재발급 처리
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      await refreshAccessToken(); // RefreshToken으로 재발급
      return axios(error.config); // 원래 요청 재시도
    }
    return Promise.reject(error);
  }
);
```

---

## 4. 🎤 구두 설명 연습

> 면접관 앞에서 말하듯이 작성. 읽는 용도가 아니라 **말하는 연습**을 위한 섹션
> 

### "JWT가 무엇인가요?" 질문에 대한 답변 스크립트

```
[도입 - 핵심 정의 먼저]
JWT는 사용자 정보를 JSON 형태로 담아 인코딩한 토큰입니다.
서버가 로그인한 사용자에게 발급해주고, 이후 요청마다 이 토큰을 함께 보내
서버가 누구인지 확인하는 데 사용합니다.

[부연 - 왜/어떻게]
JWT는 Header, Payload, Signature 세 파트로 구성됩니다.
Payload에 userId나 권한 같은 정보를 담고, Signature로 변조 여부를 검증합니다.
서버가 별도로 상태를 저장하지 않아도 토큰만으로 검증이 가능해
서버를 여러 대로 확장할 때 유리한 Stateless 방식입니다.

[마무리 - 주의점]
다만 Payload는 암호화가 아닌 인코딩이라 누구나 내용을 볼 수 있고,
한 번 발급된 토큰은 만료 전까지 서버가 무효화하기 어렵다는 한계가 있습니다.
```

### ⏱️ 1분 요약 버전

> 면접관이 바쁠 때, 딱 1분 안에 설명하는 버전
> 

```
JWT는 사용자 정보를 담은 토큰으로, 서버가 상태를 저장하지 않아도 되는 Stateless 인증 방식입니다.
Header, Payload, Signature로 구성되며 Signature로 변조를 검증합니다.
단일 토큰은 탈취 시 대응이 어려워, 짧게 유효한 AccessToken과
재발급용 RefreshToken을 나눠 쓰는 방식이 일반적입니다.
```

---

## 5. ❓ 예상 면접 질문 & 답변

> 각 질문에 대해 **STAR 구조** 혹은 **두 문장 요약**으로 작성
> 

### 기본 질문

- **Q1. JWT란 무엇인가요?**
    
    > A: 사용자 정보를 JSON 형태로 담아 인코딩한 토큰입니다. Header, Payload, Signature 세 파트로 구성되며, 서버가 상태를 저장하지 않아도 Signature 검증만으로 인증이 가능한 Stateless 방식입니다.
    > 
- **Q2. AccessToken과 RefreshToken을 왜 나눠서 쓰나요?**
    
    > A: AccessToken만 사용하면 보안과 UX 사이에서 트레이드오프가 생깁니다. 만료를 짧게 하면 보안은 좋지만 자주 로그인해야 하고, 길게 하면 편하지만 탈취 시 대응이 어렵습니다. AccessToken은 짧게 유지해 보안을 높이고, RefreshToken으로 자동 재발급해 UX를 유지하기 위해 나눠서 사용합니다.
    > 
- **Q3. RefreshToken은 어디에 저장하는 게 좋은가요?**
    
    > A: HttpOnly 쿠키에 저장하는 걸 권장합니다. HttpOnly 쿠키는 JS로 접근이 불가능해서 XSS 공격이 성공해도 토큰을 읽어갈 수 없습니다. 쿠키는 CSRF에 취약할 수 있는데, SameSite=Strict 옵션을 함께 설정하면 외부 사이트에서 오는 요청에 쿠키가 포함되지 않아 CSRF도 방어할 수 있습니다.
    > 

---

### 심화 질문 (꼬리질문 대비)

- **Q4. JWT의 Payload는 암호화되나요?**
    
    > A: 아닙니다. Base64로 인코딩된 것이라 누구나 디코딩해서 내용을 볼 수 있습니다. 그래서 비밀번호 같은 민감한 정보는 절대 Payload에 담으면 안 됩니다. 변조를 막는 건 Signature이고, 내용을 숨기려면 별도의 암호화가 필요합니다.
    > 
- **Q5. Refresh Token Rotation이 무엇인가요?**
    
    > A: AccessToken을 재발급할 때 RefreshToken도 함께 새로 발급하고 기존 토큰을 폐기하는 전략입니다. 탈취된 RefreshToken으로 재발급 요청이 오면 이미 폐기된 토큰이므로 서버가 감지하고 해당 사용자의 모든 세션을 무효화할 수 있습니다.
    > 

---

### 🧨 함정/난이도 높은 질문

- **Q6. JWT는 서버에서 강제로 로그아웃시킬 수 없나요?**
    
    > A: 기본적으로는 어렵지만 RefreshToken을 서버 DB에서 관리하는 방식으로 절충할 수 있습니다. RefreshToken을 DB에 저장해두면 로그아웃 요청이 왔을 때 해당 토큰을 삭제하면 되고, 이후 AccessToken이 만료되면 재발급이 안 되니 사실상 로그아웃이 됩니다. 그래서 AccessToken 만료 기간을 짧게 유지하는 게 핵심입니다. 무효화된 토큰 목록을 관리하는 블랙리스트 방식도 있지만, 요청마다 DB를 조회해야 해서 Stateless 장점이 사라지기 때문에 잘 쓰지 않습니다.
    > 
- **Q7. AccessToken을 localStorage에 저장하면 안 되나요?**
    
    > A: 저장 자체는 가능하지만 보안상 권장하지 않습니다. localStorage는 JS로 접근 가능해서 XSS 공격이 성공하면 토큰이 그대로 탈취됩니다. 메모리(JS 변수)에 저장하면 XSS가 성공해도 변수명을 알아야 접근할 수 있어 난이도가 올라갑니다. 새로고침 시 사라지는 단점은 RefreshToken으로 재발급받아 해결할 수 있습니다.
    > 

---
