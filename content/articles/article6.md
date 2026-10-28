---
id: "article6"
title: "컴포넌트 렌더 전 데이터 로더(Loader)"
kinds: ["스터디"]
stacks: ["React Router"]
date: "2026-01-31"
excerpt: "useEffect로 데이터를 가져올 때 생기는 문제와, 렌더 전에 데이터를 준비하는 React Router Loader를 언제 쓰면 좋은지에 대한 정리"
---

<!-- TODO: 변환 못 한 블록 (목차) -->

## 1. 왜 Loader가 필요할까?

### 기존 방식의 문제점

React에서 데이터를 가져오는 가장 흔한 방식은 `useEffect` 안에서 fetch하는 것임.

```tsx
function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/api/user/123')
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;

  return <div>{user.name}</div>;
}
```

이 방식은 동작하지만 몇 가지 문제가 있음.

#### **문제 1: 렌더 → fetch → 재렌더 흐름**

1. 컴포넌트가 먼저 렌더링됨 (loading 상태)
2. useEffect 실행 → fetch 시작
3. 데이터 도착 → 상태 업데이트 → 재렌더링

이 흐름 때문에 사용자는 항상 "깜빡임"을 경험함. 페이지 이동할 때마다 스피너가 잠깐 보이는 현상.

#### **문제 2: useEffect 안에서 setState는 권장되지 않음**

React 공식 문서에서는 데이터 fetching을 useEffect에서 하는 것에 대해 이렇게 말함:

> "Fetching data with Effects is a popular way to fetch data, but it's very manual and has significant downsides."
— [React 공식 문서: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect#fetching-data)
> "Effect로 데이터를 가져오는 것은 흔한 방법이지만, 매우 수동적이고 큰 단점들이 있습니다."
> 

구체적인 문제점들:

- **Race Condition**: 여러 번 빠르게 클릭하면 응답 순서가 뒤바뀔 수 있음
- **Waterfall**: 부모-자식 컴포넌트가 순차적으로 fetch하면 느려짐
- **네트워크 낭비**: 컴포넌트가 마운트될 때마다 매번 fetch
- **코드 반복**: loading, error, data 상태를 매번 만들어야 함

#### **문제 3: 레이아웃 시프트**

Loading 화면에서 실제 콘텐츠로 바뀔 때 화면 높이가 달라지면 레이아웃이 밀립니다. 사용자 경험이 나빠지고 CLS(Cumulative Layout Shift) 점수가 나빠집니다.

#### **문제 4: 네비게이션 중 취소가 어려움**

사용자가 다른 페이지로 이동해도 이전 페이지의 fetch가 계속 진행됨. 그래서 cleanup 함수를 직접 구현해야 함

```tsx
useEffect(() => {
  let cancelled = false;
  
  fetch('/api/user')
    .then(res => res.json())
    .then(data => {
      if (!cancelled) {  // 이미 다른 페이지로 이동했으면 무시
        setUser(data);
      }
    });
  
  return () => {
    cancelled = true;  // cleanup 함수
  };
}, []);
```

매번 이런 코드를 작성하는 것은 번거롭고 실수하기 쉽다!

#### Loader가 해결하는 것

React Router의 Loader는 이런 순서로 동작:

```tsx
1. 사용자가 링크 클릭
2. Loader 함수가 먼저 실행 → 데이터 가져오기
3. 데이터가 준비되면
4. 컴포넌트 렌더링 (데이터와 함께)
```

핵심 차이는 컴포넌트가 화면에 그려지기 전에 필요한 데이터를 미리 준비해둔다는 것!

- React Router 공식 문서의 설명:
    
    > "Route loaders are called before the route component renders and provide data to the component through useLoaderData."
    — [React Router 공식 문서: loader](https://reactrouter.com/en/main/route/loader)
    > 번역: "Route loader는 컴포넌트가 렌더되기 전에 호출되고, `useLoaderData`를 통해 컴포넌트에 데이터를 제공합니다."
    > 

---

### 2. Loader의 동작 원리

#### 실행 시점과 흐름

React Router v6.4 이상에서는 Data APIs라는 기능을 제공. Loader는 이 기능의 핵심…!

**전체 흐름:**

```
[사용자가 링크 클릭]
   ↓
[React Router가 URL과 매칭되는 route 찾기]
   ↓
[해당 route의 loader 함수 실행] ⭐ 요기가 핵심!
   ↓
[loader가 데이터를 반환하면 메모리에 저장]
   ↓
[컴포넌트 렌더링 시작]
   ↓
[컴포넌트에서 useLoaderData()로 데이터 접근]
```

#### React Router의 Loader

Loader는 route 설정에 함수로 등록:

```tsx
const router = createBrowserRouter([
  {
    path: '/user/:id',
    element: <UserProfile />,
    loader: userLoader,  // ← 이 함수가 먼저 실행됨
  }
]);
```

**여러 route가 중첩되어 있으면?**

부모와 자식 route의 loader가 **동시에** 실행

```tsx
const router = createBrowserRouter([
  {
    path: '/',
    loader: rootLoader,  // ← 이것과
    element: <Root />,
    children: [
      {
        path: 'user/:id',
        loader: userLoader,  // ← 이것 두 개가 병렬로 실행됨!
        element: <UserProfile />
      }
    ]
  }
]);
```

순차적으로 기다리지 않고 동시에 실행되기 때문에 빠름.

- React Router 공식 문서:
    
    > "All route loaders are called in parallel to maximize data loading performance."
    — [React Router 공식 문서: loader](https://reactrouter.com/en/main/route/loader)
    > 번역: "모든 route loader는 병렬로 호출되어 데이터 로딩 성능을 최대화합니다."
    > 

---

### 3. 기본 사용법

#### loader 함수 작성

loader는 그냥 일반 함수. 데이터를 가져와서 반환하면 됨:

```tsx
// src/loaders/userLoader.ts
import { LoaderFunctionArgs } from 'react-router-dom';

export interface User {
  id: string;
  name: string;
  email: string;
}

export async function userLoader({ params }: LoaderFunctionArgs): Promise<User> {
  const response = await fetch(`/api/users/${params.id}`);
  
  if (!response.ok) {
    throw new Response('User not found', { status: 404 });
  }
  
  return response.json();
}
```

**코드 설명:**

- `LoaderFunctionArgs`: React Router가 제공하는 타입, loader 함수가 받는 인자의 타입.
- `params`: URL에서 추출한 파라미터. `/user/:id`의 `:id` 부분.
- 에러가 발생하면 `throw`로 던짐. 나중에 `errorElement`가 받아서 처리.

#### useLoaderData 훅

컴포넌트에서는 `useLoaderData()` 훅으로 loader가 반환한 데이터를 받음:

```tsx
// src/pages/UserProfile.tsx
import { useLoaderData } from 'react-router-dom';
import { User } from '../loaders/userLoader';

export default function UserProfile() {
  const user = useLoaderData() as User;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**주의사항:**

`useLoaderData()`는 `unknown` 타입을 반환해 TypeScript를 사용한다면 `as User`처럼 타입 단언이 필요.

#### 라우터 설정

loader와 컴포넌트를 route에 연결해야 함:

```tsx
// src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import UserProfile from './pages/UserProfile';
import { userLoader } from './loaders/userLoader';

const router = createBrowserRouter([
  {
    path: '/user/:id',
    element: <UserProfile />,
    loader: userLoader,  // loader 등록
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

이제 사용자가 `/user/123`으로 이동하면:

1. `userLoader` 함수 실행 → `/api/users/123` 호출
2. 데이터 도착
3. `UserProfile` 컴포넌트 렌더링 (데이터와 함께)

#### 에러 처리

loader에서 에러가 발생하면 `errorElement`가 렌더됨:

```tsx
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

function ErrorPage() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
      </div>
    );
  }
  
  return <div>알 수 없는 에러가 발생했습니다.</div>;
}

// 라우터 설정
const router = createBrowserRouter([
  {
    path: '/user/:id',
    element: <UserProfile />,
    loader: userLoader,
    errorElement: <ErrorPage />,  // 에러 시 이 컴포넌트 렌더
  }
]);
```

**동작 방식:**

loader에서 `throw`로 에러를 던지면 → React Router가 가장 가까운 `errorElement`를 찾아서 렌더함.

- React Router 공식 문서:
    
    > "When errors are thrown in loaders, React Router will render the route's errorElement."
    — [React Router 공식 문서: errorElement](https://reactrouter.com/en/main/route/error-element)
    > 번역: "loader에서 에러가 발생하면, React Router는 route의 `errorElement`를 렌더합니다."
    > 

---

### 4. Loader vs useEffect 비교

#### 실행 시점 차이

**useEffect 방식:**

```tsx
function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/user/123')
      .then(res => res.json())
      .then(data => setUser(data))
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Loading...</div>;  // 항상 먼저 보임
  return <div>{user?.name}</div>;
}
```

**실행 순서:**

```tsx
1. 컴포넌트 렌더 → "Loading..." 표시
2. useEffect 실행
3. fetch 시작
4. 데이터 도착
5. setState로 상태 업데이트
6. 컴포넌트 다시 렌더 → 실제 데이터 표시
```

**Loader 방식:**

```tsx
// loader
export async function userLoader() {
  const response = await fetch('/api/user/123');
  return response.json();
}

// component
function UserProfile() {
  const user = useLoaderData() as User;
  return <div>{user.name}</div>;  // 데이터와 함께 첫 렌더
}
```

**실행 순서:**

```tsx
1. 사용자가 링크 클릭
2. loader 실행 → fetch 시작
3. 데이터 도착
4. 컴포넌트 렌더 (데이터와 함께)
```

#### 주요 차이점 정리

| 항목 | useEffect | Loader |
| --- | --- | --- |
| **실행 시점** | 컴포넌트 렌더 **후** | 컴포넌트 렌더 **전** |
| **Loading 표시** | 직접 만들어야 함 | React Router가 자동 관리 |
| **에러 처리** | try-catch + state | errorElement |
| **취소 처리** | cleanup 함수 직접 구현 | 자동으로 취소됨 |
| **깜빡임** | 항상 발생 | 없음 |
| **병렬 로딩** | 직접 구현 필요 | 자동 |
| **코드 양** | 많음 (boilerplate) | 적음 |

#### React가 권장하는 방식

React 공식 문서에서는 데이터 fetching에 대해 이렇게 말함:

> "If you use a framework, use its data fetching mechanism. Modern React frameworks like Next.js and Remix have built-in data fetching mechanisms that are more efficient than fetching data in Effects."
— [React 공식 문서: Fetching Data](https://react.dev/reference/react/useEffect#fetching-data-with-effects)
> 번역: "프레임워크를 사용한다면, 프레임워크의 데이터 fetching 메커니즘을 사용하세요. Next.js나 Remix 같은 현대적인 React 프레임워크는 Effect에서 데이터를 가져오는 것보다 효율적인 내장 데이터 fetching 메커니즘을 가지고 있습니다."
> 

React Router의 Loader가 바로 이런 "내장 메커니즘"이라고 할 수 있음.

---

### 5. 고급 기능

#### params와 request 활용

loader 함수는 두 가지 유용한 정보를 받을 수 있음:

```tsx
import { LoaderFunctionArgs } from 'react-router-dom';

export async function productLoader({ params, request }: LoaderFunctionArgs) {
  // 1. URL params 읽기
  const productId = params.id;  // /product/:id 의 :id
  
  // 2. Query string 읽기
  const url = new URL(request.url);
  const sortBy = url.searchParams.get('sort');  // ?sort=price
  const filter = url.searchParams.get('filter');  // &filter=sale
  
  // 3. 실제 데이터 가져오기
  const response = await fetch(
    `/api/products/${productId}?sort=${sortBy}&filter=${filter}`
  );
  
  return response.json();
}
```

**실제 사용 예시:**

- URL: `/product/123?sort=price&filter=sale`

```tsx
→ params.id = "123"
→ searchParams.get('sort') = "price"
→ searchParams.get('filter') = "sale"
```

#### defer를 이용한 스트리밍

모든 데이터가 다 준비될 때까지 기다리지 않고, 빠른 데이터는 먼저 보여주고 느린 데이터는 나중에 보여줄 수도 있음:

```tsx
import { defer } from 'react-router-dom';

export async function dashboardLoader() {
  // 빠른 데이터는 await로 기다림
  const userInfo = await fetch('/api/user').then(r => r.json());
  
  // 느린 데이터는 await 하지 않고 Promise 그대로 전달
  const analytics = fetch('/api/analytics').then(r => r.json());
  
  return defer({
    userInfo,      // 바로 사용 가능
    analytics,     // Promise (나중에 해결됨)
  });
}
```

컴포넌트에서는 `Suspense`로 감싸서 받음..!

```tsx
import { Await, useLoaderData } from 'react-router-dom';
import { Suspense } from 'react';

function Dashboard() {
  const data = useLoaderData() as {
    userInfo: User;
    analytics: Promise<Analytics>;
  };
  
  return (
    <div>
      {/* 즉시 렌더 */}
      <h1>Welcome, {data.userInfo.name}</h1>
      
      {/* 느린 데이터는 Suspense로 감싸서 나중에 렌더 */}
      <Suspense fallback={<div>분석 데이터를 불러오는 중...</div>}>
        <Await resolve={data.analytics}>
          {(analytics) => <AnalyticsChart data={analytics} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

**언제 유용한가?**

- 사용자 정보는 빠르게 가져올 수 있는데, 분석 데이터는 느린 경우
- 필수 정보는 먼저 보여주고, 부가 정보는 천천히 보여줘도 되는 경우
- React Router 공식 문서:
    
    > "defer allows you to defer values returned from loaders by passing promises instead of resolved values."
    — [React Router 공식 문서: defer](https://reactrouter.com/en/main/fetch/redirect)
    > 번역: "`defer`는 resolved된 값 대신 promise를 전달하여 loader에서 반환하는 값을 지연시킬 수 있게 합니다."
    > 

#### redirect 활용

loader에서 다른 페이지로 리다이렉트할 수 있습니다. 인증 확인 등에 유용합니다:

```tsx
import { redirect, LoaderFunctionArgs } from 'react-router-dom';

export async function protectedLoader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser();
  
  if (!user) {
    // 로그인 안 되어 있으면 로그인 페이지로
    // 원래 가려던 URL을 저장해둠
    const params = new URLSearchParams();
    params.set('from', new URL(request.url).pathname);
    return redirect('/login?' + params.toString());
  }
  
  // 로그인 되어 있으면 데이터 반환
  return { user };
}
```

React Router 공식 문서:

> "redirect is a helper that creates a Response that will redirect the user to another route."
— [React Router 공식 문서: redirect](https://reactrouter.com/en/main/utils/defer)
> 번역: "`redirect`는 사용자를 다른 route로 리다이렉트할 Response를 생성하는 헬퍼입니다."
> 

---

---

### 7. 실무 선택 기준

#### Loader를 써야 하는 경우

**1. 페이지를 보기 위해 꼭 필요한 데이터**

사용자 프로필, 상품 상세 정보처럼 "이 데이터가 없으면 페이지를 보여줄 수 없는" 경우!

```tsx
// Loader가 적합
export async function productDetailLoader({ params }: LoaderFunctionArgs) {
  const product = await fetch(`/api/products/${params.id}`).then(r => r.json());
  return product;
}
```

**2. URL로 데이터가 결정되는 경우**

블로그 포스트, 사용자 프로필 등 URL 파라미터로 어떤 데이터를 가져올지 결정되는 경우!

```tsx
// Loader가 적합
// /post/123 → 123번 포스트 가져오기
export async function postLoader({ params }: LoaderFunctionArgs) {
  return fetch(`/api/posts/${params.id}`).then(r => r.json());
}
```

**3. 인증이 필요한 페이지**

로그인 확인과 데이터 로딩을 한번에 처리할 때..!

```tsx
// Loader가 적합
export async function dashboardLoader() {
  const user = await checkAuth();
  if (!user) {
    return redirect('/login');
  }
  
  const data = await fetch('/api/dashboard').then(r => r.json());
  return { user, data };
}
```

**4. 목록에서 상세로 이동**

게시글 목록 → 게시글 상세, 상품 목록 → 상품 상세 같은 네비게이션도..!

```tsx
// Loader가 적합
const router = createBrowserRouter([
  {
    path: '/products',
    element: <ProductList />
  },
  {
    path: '/products/:id',
    element: <ProductDetail />,
    loader: productDetailLoader  // 상세 페이지는 loader 사용
  }
]);
```

#### useEffect를 써야 하는 경우

**1. 사용자가 무언가를 한 후에 데이터가 필요한 경우**

검색, 필터링, 정렬처럼 사용자 인터랙션 후에 데이터를 가져오는 경우:

```tsx
// useEffect가 적합
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = async () => {
    const data = await fetch(`/api/search?q=${query}`).then(r => r.json());
    setResults(data);
  };
  
  return (
    <div>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
      />
      <button onClick={handleSearch}>검색</button>
      {results.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}
```

**2. 실시간으로 업데이트되는 데이터**

채팅, 주식 가격, 알림처럼 계속 변하는 데이터일 때

```tsx
// useEffect가 적합
function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket('/chat');
    
    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages(prev => [...prev, newMessage]);
    };
    
    return () => ws.close();
  }, []);
  
  return (
    <div>
      {messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
    </div>
  );
}
```

**3. 조건에 따라 데이터를 가져올지 말지 결정**

토글을 켜야만 데이터를 가져오는 경우도 여기에 해당함

```tsx
// useEffect가 적합
function Dashboard() {
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    if (showStats && !stats) {
      fetch('/api/stats')
        .then(r => r.json())
        .then(setStats);
    }
  }, [showStats, stats]);
  
  return (
    <div>
      <button onClick={() => setShowStats(true)}>
        통계 보기
      </button>
      {showStats && stats && <StatsChart data={stats} />}
    </div>
  );
}
```

**4. 주기적으로 업데이트해야 하는 데이터**

5초마다, 1분마다 새로운 데이터를 가져오는 경우!

```tsx
// useEffect가 적합
function StockPrice() {
  const [price, setPrice] = useState(0);
  
  useEffect(() => {
    const fetchPrice = async () => {
      const data = await fetch('/api/stock-price').then(r => r.json());
      setPrice(data.price);
    };
    
    // 처음 한번 실행
    fetchPrice();
    
    // 5초마다 실행
    const interval = setInterval(fetchPrice, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return <div>현재 가격: ${price}</div>;
}
```

#### 간단한 판단 기준

**이렇게 판단하면 조금 더 간단:**

| 질문 | Loader | useEffect |
| --- | --- | --- |
| 이 데이터가 없으면 페이지를 못 보여주나? | ✅ | ❌ |
| URL이 바뀌면 데이터도 바뀌나? | ✅ | ❌ |
| 사용자가 버튼을 눌러야 데이터를 가져오나? | ❌ | ✅ |
| 데이터가 계속 변하나? (실시간) | ❌ | ✅ |
| 조건에 따라 데이터를 가져올지 말지 결정하나? | ❌ | ✅ |

**가장 간단한 규칙:**

- "페이지를 열자마자 꼭 있어야 하는 데이터" → **Loader**
- "사용자가 뭔가 한 후에 필요한 데이터" → **useEffect**

---

### 8. 주의사항

#### 1. Loader는 client-side routing에서만 동작

Loader는 React Router가 페이지 이동을 처리할 때만 실행됨:

```tsx
// ✅ Loader가 실행됨
<Link to="/user/123">User Profile</Link>
navigate('/user/123');

// ❌ Loader가 실행 안 됨 (브라우저가 새로고침)
<a href="/user/123">User Profile</a>
window.location.href = '/user/123';
```

**이유:**

브라우저 새로고침은 서버에 새 요청을 보내는 것으로, React Router는 관여할 수 없다..!

#### 2. Loader는 React 컴포넌트가 아님

loader 함수 안에서 React 훅을 사용할 수 없습니다:

```tsx
// ❌ 이렇게 하면 에러
export async function userLoader() {
  const user = useUser();  // ❌ 훅은 컴포넌트에서만!
  return user;
}

// ✅ 이렇게 해야 함
export async function userLoader() {
  const token = localStorage.getItem('token');  // ✅ 일반 JS는 OK
  const response = await fetch('/api/user', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
}
```

#### 3. 타입 안전성

`useLoaderData()`는 `unknown` 타입을 반환하므로 타입 단언이 필요:

```tsx
// ❌ 타입 에러 발생
function UserProfile() {
  const user = useLoaderData();
  return <div>{user.name}</div>;  // ❌ user: unknown
}

// ✅ 타입 단언 필요
function UserProfile() {
  const user = useLoaderData() as User;
  return <div>{user.name}</div>;  // ✅
}
```

더 안전하게 하려면 타입 가드를 만들 수 있는데, 아래와 같이 만들 수 있음..!

```tsx
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'email' in data
  );
}

function UserProfile() {
  const data = useLoaderData();
  
  if (!isUser(data)) {
    throw new Error('Invalid user data');
  }
  
  // 이제 data는 User 타입
  return <div>{data.name}</div>;
}
```

#### 4. 캐싱 고려

기본적으로 React Router는 매번 loader를 실행하게 됨..! 같은 페이지를 여러 번 방문하면 매번 API 요청이 발생함:

```tsx
// 문제 상황
<Link to="/user/123">Profile</Link>  // API 요청!
<Link to="/posts">Posts</Link>
<Link to="/user/123">Profile</Link>  // 또 API 요청!
```

간단한 캐싱을 구현할 수 있음.:

```tsx
// src/utils/cache.ts
const cache = new Map<string, { 
  data: any; 
  timestamp: number 
}>();

const CACHE_TIME = 5 * 60 * 1000; // 5분

export function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  
  // 5분이 지났으면 만료
  if (Date.now() - item.timestamp > CACHE_TIME) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}
```

```tsx
// loader에서 사용
import { getCached, setCache } from '../utils/cache';

export async function userLoader({ params }: LoaderFunctionArgs) {
  const cacheKey = `user-${params.id}`;
  
  // 캐시 확인
  const cached = getCached<User>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // 캐시 없으면 API 호출
  const user = await fetch(`/api/users/${params.id}`).then(r => r.json());
  
  // 캐시에 저장
  setCache(cacheKey, user);
  
  return user;
}
```

#### 5. 병렬 loader의 에러 처리

여러 loader가 있을 때 하나라도 실패하면 전체가 에러 페이지로 이동함

```tsx
const router = createBrowserRouter([
  {
    path: '/dashboard',
    loader: essentialLoader,  // 이게 실패하면
    element: <Dashboard />,
    errorElement: <ErrorPage />,  // 여기로 이동
    children: [
      {
        path: 'stats',
        loader: statsLoader,  // 이건 실행 안 됨
        element: <Stats />
      }
    ]
  }
]);
```

**해결 방법:**

필수가 아닌 데이터는 `defer` + `Suspense`로 처리하면 부분 실패를 허용할 수 있다-!

```tsx
export async function dashboardLoader() {
  // 필수 데이터는 await
  const essential = await fetch('/api/essential').then(r => r.json());
  
  // 선택 데이터는 Promise로 (실패해도 OK)
  const optional = fetch('/api/optional')
    .then(r => r.json())
    .catch(() => null);  // 실패하면 null
  
  return defer({
    essential,
    optional
  });
}
```

---

### 참고 자료

#### 공식 문서

- [React Router: loader](https://reactrouter.com/en/main/route/loader)
- [React Router: useLoaderData](https://reactrouter.com/en/main/hooks/use-loader-data)
- [React Router: defer](https://reactrouter.com/en/main/utils/defer)
- [React Router: redirect](https://reactrouter.com/en/main/fetch/redirect)
- [React Router: errorElement](https://reactrouter.com/en/main/route/error-element)
- [React 공식 문서: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React 공식 문서: Fetching Data](https://react.dev/reference/react/useEffect#fetching-data-with-effects)

#### MDN 문서

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

```markdown
const router = createBrowserRouter([
  {
    path: '/',
    loader: rootLoader,      // ← 이것과
    element: <Root />,
    children: [
      {
        path: 'user/:id',
        loader: userLoader,  // ← 이것이 병렬로 실행됨
        element: <UserProfile />,
      },
    ],
  },
]);
```
