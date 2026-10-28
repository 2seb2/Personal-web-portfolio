---
id: "article16"
title: "React Fiber & 동시성"
kinds: ["스터디"]
stacks: ["React"]
date: "2026-04-13"
excerpt: "React는 Fiber 아키텍처로 렌더링 작업을 작은 단위로 나눠 중단·재개할 수 있게 하고, 내부 Scheduler와 Lane 기반 우선순위로..."
---

## 1. 🗺️ 개념 지도 (Overview)

### **한 줄 요약:**

```
React는 Fiber 아키텍처로 렌더링 작업을 작은 단위로 나눠 중단·재개할 수 있게 하고,
내부 Scheduler와 Lane 기반 우선순위로 업데이트 순서를 조율해
메인 스레드 블로킹 없이 사용자 입력 응답성을 유지한다.
```

### **이 주제가 왜 중요한가?**

- React 18의 `useTransition`, `Suspense`, `startTransition`이 왜 생겼는지를 이해하려면 Fiber를 알아야 함
- "React는 왜 렌더링이 빠른가?"라는 면접 질문에 "Virtual DOM 때문"이라는 답보단, Virtual DOM이 불필요한 DOM 조작을 줄여 성능에 기여하고, Fiber가 그 위에서 스케줄링까지 더해 추가 성능 향상을 이뤘다는 맥락을 함께 설명하면 좋음
- 성능 최적화(useMemo, useCallback, React.memo)를 제대로 쓰려면 React가 어떻게 렌더링을 결정하는지 알아야 함

**관련 키워드 (마인드맵 형태로 나열):**

```
[React Fiber & 동시성]
├── 기존 Stack Reconciler의 문제
│   ├── 재귀 호출 → 중간 중단 불가
│   └── 메인 스레드 블로킹 → 프레임 드롭
├── Fiber 아키텍처
│   ├── Fiber Node — 컴포넌트/작업 단위를 표현하는 내부 데이터 구조
│   │   ├── 트리 구조 (child / sibling / return)
│   │   └── 두 개의 트리 (current / workInProgress)
│   ├── Reconciliation (재조정)
│   │   ├── Render Phase — 중단 가능, 비동기
│   │   └── Commit Phase — 중단 불가, 동기
│   └── 내부 Scheduler
│       └── 우선순위 Lane 기반 스케줄링
└── Concurrent Features (React 18)
    ├── useTransition — transition update 표시
    ├── useDeferredValue — 값의 반응을 지연
    └── Suspense — 비동기 렌더링 경계
```

**이 주제 들어가기 전에, 이해하기 좋게 한 번 더 정리해본 배경지식입니다!:**

### 배경 지식 — 브라우저 렌더링 파이프라인과 프레임 (참고용, 선택)

> React가 왜 "메인 스레드 블로킹"을 신경 쓰는지 이해하려면 브라우저가 화면을 그리는 방식을 먼저 알아야 한다.
> 

브라우저는 화면을 초당 60프레임(60fps)으로 그린다. 1프레임에 허용된 시간은 약 **16.67ms**다. 이 16.67ms 안에 JavaScript 실행, 스타일 계산, 레이아웃, 페인트가 전부 완료되어야 한다.

```
[브라우저 렌더링 파이프라인 — 한 프레임 16.67ms 안에]

JS 실행 → 스타일 계산 → 레이아웃 → 페인트 → 합성

JS 실행이 16.67ms를 초과하면?
→ 브라우저가 다음 프레임을 그릴 시간이 없음
→ 화면 업데이트가 지연됨 (프레임 드롭)
```

**메인 스레드**: JavaScript 실행과 DOM 조작은 같은 스레드에서 처리된다. JS가 오래 실행되는 동안 브라우저는 클릭, 스크롤, 입력 이벤트를 처리하지 못한다.

```
[메인 스레드 블로킹 예시]

① 사용자가 검색창에 입력
② React가 3000개 리스트 항목 렌더링 시작
③ JS가 50ms 동안 메인 스레드를 점유
④ 그동안 입력 이벤트가 대기 상태로 쌓임
⑤ 50ms 후 렌더링이 완료되고 나서야 입력도 반영됨
```

이 문제를 해결하기 위해 React가 도입한 것이 **Fiber 아키텍처**와 **concurrent features**다.

### 배경 지식 — 재귀와 콜 스택 (참고용, 선택)

> Fiber 이전 React(Stack Reconciler)의 문제를 이해하려면 재귀 호출의 특성을 알아야 한다.
> 

재귀 함수는 한 번 시작하면 콜 스택이 전부 해소될 때까지 실행된다. JavaScript의 콜 스택은 개발자가 직접 제어할 수 없기 때문에 중간에 실행을 멈출 방법이 없다.

```
[재귀 호출의 특성]

renderComponent(App)
  └─ renderComponent(Header)
       └─ renderComponent(Nav)
            └─ ... (콜 스택이 다 풀릴 때까지 중단 불가)
```

컴포넌트 트리가 깊고 넓을수록 재귀 호출이 많아지고, 그 시간 동안 메인 스레드는 완전히 점유된다.

---

## 2. 📖 핵심 개념 정리

### 2-1. Fiber 아키텍처

**개념 설명 (내 말로):**

> Fiber는 React 16에서 도입된 내부 재조정 구조다. 렌더링 작업을 **Fiber Node**라는 단위로 나눠, 각 단위 사이에 실행을 중단하고 나중에 재개할 수 있게 만드는 것이 핵심이다. 콜 스택에 의존하는 재귀 대신 링크드 리스트를 사용하면 "다음에 처리할 노드" 위치를 변수로 저장할 수 있어 중단/재개가 가능해진다.
> 

**Fiber Node:**

Fiber Node는 각 컴포넌트 인스턴스와 그 작업 상태를 담는 내부 데이터 구조다. 세 포인터로 서로 연결된 트리를 형성한다.

```
        App (Fiber Node)
        ├── child ──→ Header (Fiber Node)
        │              ├── child ──→ Nav (Fiber Node)
        │              │              └── return ──→ Header
        │              └── return ──→ App
        └── child ──→ Main (Fiber Node)
                       ├── sibling ──→ Footer (Fiber Node)
                       └── return ──→ App

child   : 첫 번째 자식 노드를 가리킴
sibling : 다음 형제 노드를 가리킴
return  : 부모 노드를 가리킴 (작업 완료 후 돌아갈 위치)
```

**두 개의 트리 — current와 workInProgress:**

```
current 트리                workInProgress 트리
(현재 커밋된 트리.          (다음 렌더를 준비하는 트리.
 지금 화면에 표시 중)        Commit 전까지 DOM에 반영 안 됨)

① current 기반으로 workInProgress 생성
② workInProgress에서 변경 사항 계산 (Render Phase)
③ 계산 완료 → DOM에 반영 (Commit Phase)
④ workInProgress가 새로운 current가 됨
```

더 높은 우선순위 업데이트가 생기면 workInProgress를 폐기하고 재시작한다. current는 항상 커밋된 상태를 유지하므로 화면은 정상 상태를 유지한다.

---

### 2-2. Render Phase와 Commit Phase

**개념 설명 (내 말로):**

> Fiber는 렌더링을 두 단계로 분리한다. 중단이 가능한 Render Phase와 절대 중단할 수 없는 Commit Phase다. 이 분리 덕분에 중간에 작업을 취소하거나 우선순위를 바꿀 수 있다.
> 

**Render Phase:**

각 컴포넌트를 호출해 어떤 UI를 그려야 하는지 계산하는 단계. DOM에 직접 접근하지 않는다.

```
① 컴포넌트 함수 실행 → 새 출력(React element) 계산
② 이전 Fiber와 비교 → 변경 필요 여부 판단
③ 변경이 필요한 경우 effect 태그 표시 (삽입/업데이트/삭제)
④ Scheduler가 남은 시간 확인 → 부족하면 중단, 다음 기회에 재개
```

**Render Phase는 순수해야 한다.** 중단 후 재실행될 수 있어 같은 컴포넌트 함수가 여러 번 호출될 수 있다.

```jsx
function Component() {
  fetch('/api/data'); // ❌ 중단/재실행 시 중복 요청 발생
  return <div />;
}

function Component() {
  useEffect(() => {
    fetch('/api/data'); // ✅ Commit 이후 실행 보장
  }, []);
  return <div />;
}
```

**Commit Phase:**

Render Phase에서 계산한 변경 사항을 실제 DOM에 반영하는 단계. 한 번 시작하면 중단 없이 동기로 완료된다.

```
① 실제 DOM 조작 수행 (삽입, 업데이트, 삭제)
② useLayoutEffect 실행 (DOM 변경 직후, 페인트 전, 동기)
③ 브라우저 페인트
④ useEffect 실행 (페인트 후, 비동기)
```

**두 단계 비교:**

| 구분 | Render Phase | Commit Phase |
| --- | --- | --- |
| 중단 가능 여부 | 가능 | 불가 (동기) |
| 주요 작업 | 컴포넌트 호출 → 변경 계산 | 실제 DOM 반영 |
| 사이드 이펙트 허용 | ❌ | ✅ |
| useLayoutEffect | X | O (페인트 전, 동기) |
| useEffect | X | O (페인트 후, 비동기) |

---

### 2-3. 내부 Scheduler와 우선순위 (Lane)

**개념 설명 (내 말로):**

> Scheduler는 어떤 작업을 언제 실행할지 결정한다. React는 업데이트에 우선순위(Lane)를 부여하고, 더 높은 우선순위 업데이트가 들어오면 진행 중인 작업을 중단하고 먼저 처리한다.
> 

```
[우선순위 Lane — 높을수록 먼저 처리]

SyncLane              (가장 높음) — 클릭, 포커스 같은 이산 이벤트
InputContinuousLane               — 드래그, 스크롤 같은 연속 이벤트
DefaultLane                       — 일반적인 setState
TransitionLane                    — startTransition으로 표시된 업데이트
IdleLane              (가장 낮음) — 처리가 가장 나중으로 미뤄지는 작업
```

높은 우선순위 업데이트가 들어오면 진행 중인 Render Phase를 중단하고 workInProgress를 폐기한 뒤, 높은 우선순위 작업을 먼저 처리하고 낮은 우선순위 작업을 재시작한다.

> **참고**: React는 내부적으로 별도의 Scheduler 패키지(`packages/scheduler`)를 사용한다. `requestIdleCallback`은 탭 비활성 시 호출 빈도가 줄어드는 제약이 있어 채택하지 않았고, `MessageChannel` 기반의 자체 구현을 사용한다.
> 

---

### 2-4. Concurrent Features (React 18)

**개념 설명 (내 말로):**

> React 18은 Fiber의 중단/재개 능력을 개발자가 활용할 수 있도록 API를 제공한다. 이 기능들을 통틀어 **concurrent features**라고 부른다. ("Concurrent Mode"는 React 18의 공식 명칭이 아님)
> 

**useTransition:**

특정 상태 업데이트를 TransitionLane으로 표시한다. 더 높은 우선순위 업데이트가 들어오면 중단되고 나중에 재개된다.

```jsx
const [isPending, startTransition] = useTransition();

const handleChange = (e) => {
  setQuery(e.target.value);           // SyncLane — 즉시 처리

  startTransition(() => {
    setResults(filterHeavyList(...)); // TransitionLane — 중단 가능
  });
};

// isPending: transition 작업 진행 중 여부
{isPending ? <Spinner /> : <ResultList />}
```

**useDeferredValue:**

값 자체를 받아 지연된 버전을 반환한다. prop처럼 업데이트 호출을 직접 제어할 수 없을 때 사용한다.

```jsx
const deferredQuery = useDeferredValue(query);
// query는 즉시 반영, deferredQuery는 긴급 업데이트가 없을 때 반영
<HeavyResultList query={deferredQuery} />
```

| 구분 | useTransition | useDeferredValue |
| --- | --- | --- |
| 표시 대상 | 상태 업데이트 자체를 transition으로 표시 | prop/값의 반응을 지연 |
| 사용 시점 | 업데이트 호출을 직접 제어할 수 있을 때 | prop처럼 호출 시점을 직접 제어 못 할 때 |
| isPending | 제공됨 | 없음 |

---

## 3. 🔍 깊이 이해하기

### 왜 이렇게 설계됐을까? (Design Decision)

- **왜 재귀 대신 링크드 리스트인가?**
재귀는 콜 스택에 쌓이기 때문에 개발자가 직접 중단할 수 없다. 링크드 리스트의 포인터는 힙 메모리의 일반 객체 참조라서, "다음에 처리할 Fiber Node" 참조를 변수에 저장해두면 언제든 중단하고 이어서 실행할 수 있다.
- **Render Phase가 순수해야 하는 이유**
높은 우선순위 업데이트가 생기면 workInProgress를 폐기하고 Render Phase를 재시작한다. 사이드 이펙트가 있으면 같은 컴포넌트 함수가 여러 번 실행될 때 이펙트가 중복된다. React 18 Strict Mode가 개발 환경에서 렌더링을 의도적으로 두 번 실행하는 것도 이 때문이다.
- **current / workInProgress 두 트리를 쓰는 이유**
계산 중인 workInProgress가 화면에 노출되면 부분적으로만 업데이트된 UI가 보인다. current는 항상 커밋 완료 상태를 유지하고, workInProgress 계산이 끝난 뒤 한 번에 교체한다.

### 다른 개념과의 연결

**Virtual DOM과 Fiber:**

```
Virtual DOM: 변경 사항을 메모리에서 먼저 계산 → 실제 DOM 조작을 최소화
             → DOM 조작 횟수를 줄여 성능에 기여 (레이아웃 재계산 비용 감소)

Fiber:       그 계산 자체를 작은 단위로 나눠 우선순위에 따라 스케줄링
             → 메인 스레드 블로킹 방지로 추가 성능 향상
```

**React.memo / useMemo / useCallback:**

```
React.memo   → props가 같으면 자식의 Render Phase 진입 자체를 건너뜀
useMemo      → Render Phase 안에서 무거운 계산 결과를 메모이제이션
useCallback  → 함수 참조를 메모이제이션 (React.memo 자식에 함수 prop 넘길 때 필요)
```

**Suspense:**
컴포넌트가 Promise를 throw하면 Fiber가 캐치해서 가장 가까운 Suspense 경계의 fallback을 렌더링한다. Promise resolve 후 해당 컴포넌트의 Render Phase를 재실행한다.

---

## 4. 🎤 구두 설명 연습

### "React Fiber가 뭔가요?" 스크립트

```
[도입]
"Fiber는 React 16에서 도입된 내부 재조정 구조입니다.
 렌더링 작업을 작은 단위로 나눠 중단하고 이어서 실행할 수 있게 합니다."

[문제 배경]
"그 전에는 재귀로 컴포넌트 트리를 순회했는데,
 재귀는 콜 스택이 해소될 때까지 중단할 수 없어서
 트리가 크면 수십 ms 동안 메인 스레드가 블로킹됐습니다."

[Fiber의 해결]
"Fiber는 각 컴포넌트를 Fiber Node라는 내부 데이터 구조로 표현하고
 링크드 리스트 포인터를 이용해 순회합니다.
 다음에 처리할 노드 참조를 변수에 저장할 수 있어
 한 노드 처리 후 실행을 중단하고 다음 기회에 이어서 처리할 수 있습니다."

[두 단계]
"렌더링은 Render Phase(컴포넌트 호출 → 변경 계산, 중단 가능)와
 Commit Phase(실제 DOM 반영, 중단 불가)로 나뉩니다."
```

### "concurrent features가 뭔가요?" 스크립트

```
[핵심 설명]
"모든 상태 업데이트에는 Lane이라는 우선순위가 있습니다.
 startTransition 안에서 setState를 호출하면
 그 업데이트를 TransitionLane으로 표시합니다.
 React는 해당 작업을 처리하다가 더 높은 우선순위 업데이트가 들어오면
 진행 중인 작업을 중단하고 급한 것을 먼저 처리합니다."

[실사용 예시]
"검색창에서 입력값 업데이트는 즉시 처리하고,
 수천 개 항목 필터링은 startTransition 안에 넣으면
 새 입력이 들어올 때마다 이전 필터링 작업이 중단되고
 입력창은 항상 즉시 반응합니다."
```

### ⏱️ 1분 요약 버전

```
React는 원래 재귀로 렌더링해서 큰 트리 처리 시 메인 스레드가 블로킹됐습니다.

Fiber는 각 컴포넌트를 Fiber Node로 표현하고 링크드 리스트로 연결해서
렌더링 작업을 중단하고 이어서 실행할 수 있게 했습니다.

렌더링은 Render Phase(변경 계산, 중단 가능)와
Commit Phase(DOM 반영, 중단 불가)로 나뉩니다.

React 18의 concurrent features는 이 능력을 활용합니다.
startTransition 안의 업데이트는 TransitionLane으로 표시되어
더 높은 우선순위 업데이트가 들어오면 중단되고 나중에 처리됩니다.
```

---

## 5. ❓ 예상 면접 질문 & 답변

### 🧨 함정/난이도 높은 질문

### 기본 질문

- **Q1. React Fiber가 뭔가요?**
    
    > A: Fiber는 React 16에서 도입된 내부 재조정 구조입니다. 렌더링 작업을 Fiber Node라는 단위로 나눠 중단하고 이어서 실행할 수 있게 만드는 것이 핵심입니다.
    > 
    > 
    > 이전에는 재귀로 컴포넌트 트리를 순회했는데, 재귀는 콜 스택이 해소될 때까지 중단이 불가능해서 큰 트리를 처리할 때 메인 스레드가 블로킹됐습니다.
    > 
    > Fiber는 각 컴포넌트 인스턴스를 Fiber Node라는 내부 데이터 구조로 표현하고 링크드 리스트로 연결합니다. 다음에 처리할 노드 참조를 변수에 저장할 수 있어 한 노드 처리 후 실행을 중단하고 나중에 이어서 실행할 수 있습니다. 렌더링도 중단 가능한 Render Phase와 중단 불가능한 Commit Phase로 분리됩니다.
    > 
- **Q2. Render Phase와 Commit Phase의 차이가 뭔가요?**
    
    > A: Render Phase는 각 컴포넌트를 호출해 어떤 UI를 그려야 하는지 계산하는 단계입니다. 이전 출력과 새 출력을 비교해 변경이 필요한 노드에 effect 태그를 표시합니다. 중단이 가능하고 사이드 이펙트가 없어야 합니다. 실제 DOM에는 접근하지 않습니다.
    > 
    > 
    > Commit Phase는 계산한 변경 사항을 실제 DOM에 반영하는 단계입니다. 한 번 시작하면 중단 없이 동기로 완료됩니다. DOM 변경 직후 `useLayoutEffect`, 브라우저 페인트 이후 `useEffect`가 실행됩니다.
    > 
- **Q3. React에서 setState를 호출하면 어떤 일이 일어나는지 react Fiber 개념과 연관지어 설명해주세요.**
    
    > A: setState가 호출되면 해당 업데이트에 Lane(우선순위)이 부여되고 Scheduler에 등록됩니다. Scheduler는 현재 처리 중인 작업과 우선순위를 비교해 실행 시점을 결정합니다.
    > 
    > 
    > 실행이 시작되면 두 단계로 나뉩니다. Render Phase에서는 컴포넌트 함수를 호출해 이전 출력과 새 출력을 비교하고 변경이 필요한 노드에 effect 태그를 표시합니다. 이 단계는 중단될 수 있습니다. Commit Phase에서는 effect 태그를 기반으로 실제 DOM을 변경합니다. 이 단계는 한 번 시작하면 중단 없이 완료됩니다.
    > 
    > DOM 변경 직후 `useLayoutEffect`, 브라우저 페인트 이후 `useEffect`가 실행됩니다.
    > 

---

### 심화 질문 (꼬리질문 대비)

- **Q4. React 18에서 렌더링과 관련해 어떤 변화가 있었나요?**
    
    > A: 가장 큰 변화는 concurrent features의 공식 도입입니다. `useTransition`, `useDeferredValue`, `Suspense`가 안정화됐습니다.
    > 
    > 
    > 이 기능들은 업데이트에 Lane이라는 우선순위를 부여해서, 사용자 입력 같은 급한 업데이트는 즉시 처리하고 무거운 렌더링은 나중에 처리할 수 있게 합니다.
    > 
    > 또 `createRoot`로 렌더링하면 automatic batching이 적용됩니다. React 17까지는 이벤트 핸들러 안에서만 여러 setState가 배치 처리됐는데, React 18부터는 setTimeout이나 Promise 안에서도 배치 처리됩니다.
    > 
- **Q5. 검색 입력창에서 타이핑할 때 UI가 버벅이는 문제를 어떻게 해결하시겠어요?**
    
    > A: 입력 이벤트 처리와 무거운 렌더링이 같은 우선순위로 처리되기 때문입니다. `useTransition`으로 해결할 수 있습니다.
    > 
    > 
    > 입력값 상태 업데이트(`setQuery`)는 그대로 두고, 필터링 결과 업데이트(`setResults`)를 `startTransition` 안에 넣으면 TransitionLane으로 표시됩니다. 새 입력이 들어오면 진행 중인 필터링 작업이 중단되고 입력 업데이트가 먼저 처리됩니다. `isPending`으로 필터링 진행 중 여부를 확인해 로딩 인디케이터도 표시할 수 있습니다.
    > 
    > 필터링 로직 자체가 무거운 계산이라면 `useMemo`로 메모이제이션하는 것도 함께 고려합니다.
    > 
- **Q6. React.memo와 Fiber는 어떤 관계가 있나요?**
    
    > A: React.memo는 Fiber의 Render Phase 진입 자체를 막는 최적화입니다. 부모가 렌더링되면 기본적으로 자식도 Render Phase로 진입하는데, React.memo로 감싼 컴포넌트는 props를 얕은 비교해서 같으면 Render Phase를 건너뜁니다.
    > 
    > 
    > 단, 객체나 함수 prop은 매번 새로 생성하면 참조가 달라져 항상 다른 props로 인식됩니다. useMemo(객체)나 useCallback(함수)으로 참조를 유지해야 효과가 있습니다.
    > 

---

### 🧨 함정/난이도 높은 질문

- **Q7. 컴포넌트 함수 안에서 직접 API 요청을 하면 안 되는 이유가 뭔가요?**
    
    > A: React의 Render Phase는 중단 후 재시작될 수 있기 때문입니다.
    > 
    > 
    > 더 높은 우선순위 업데이트가 생기면 진행 중인 Render Phase를 버리고 처음부터 다시 계산합니다. 컴포넌트 함수 안에 API 요청이 있으면 같은 요청이 여러 번 발생할 수 있습니다. React 18 Strict Mode가 개발 환경에서 렌더링을 의도적으로 두 번 실행하는 것도 이런 순수성 위반을 미리 감지하기 위해서입니다.
    > 
    > API 요청 같은 사이드 이펙트는 반드시 `useEffect` 안에서 해야 합니다. `useEffect`는 Commit Phase 이후, 브라우저 페인트가 끝난 뒤 실행되므로 한 번만 실행이 보장됩니다.
    > 
- **Q8. useTransition을 쓰면 렌더링이 취소될 수 있나요?**
    
    > A: 정확히는 취소가 아니라 중단 후 폐기입니다.
    > 
    > 
    > `startTransition` 안의 업데이트는 TransitionLane으로 표시돼 Render Phase가 시작됩니다. 그 도중 더 높은 우선순위 업데이트(예: 새 입력)가 들어오면 진행 중인 workInProgress 트리를 폐기하고 높은 우선순위 작업을 먼저 처리합니다. 높은 우선순위 작업이 완료되면 transition 작업을 처음부터 다시 시작합니다.
    > 
    > 사용자 입장에서는 이전 transition 결과가 화면에 나타나지 않기 때문에 "취소된 것처럼" 보이지만, 내부적으로는 중단 후 재시작입니다.
    > 

---

## 6. 📝 나만의 요약 노트

### 오늘 이 주제에서 가장 중요한 것 3가지

1. **Fiber = 렌더링을 중단하고 이어서 실행할 수 있게 하는 구조**
: 재귀 → 링크드 리스트로 바꿔서 "다음 노드" 위치를 변수에 저장 가능하게 됨
2. **Render Phase는 순수해야 한다**
: 중단·재시작될 수 있으니까 → 사이드 이펙트는 반드시 useEffect에서
3. **concurrent features = 업데이트에 Lane을 붙여 우선순위 조율**
: startTransition → TransitionLane → 급한 업데이트 오면 중단됨

---

## 7. 📚 참고 자료

| 자료 | 링크 | 추천 이유 |
| --- | --- | --- |
| React 공식 문서: 
Render and Commit | [https://react.dev/learn/render-and-commit](https://react.dev/learn/render-and-commit) | Render Phase / Commit Phase 공식 설명 |
| React 공식 문서: 
useTransition | [https://react.dev/reference/react/useTransition](https://react.dev/reference/react/useTransition) | useTransition 동작 원리 및 예시 |
| React 공식 문서: useDeferredValue | [https://react.dev/reference/react/useDeferredValue](https://react.dev/reference/react/useDeferredValue) | useDeferredValue 동작 원리 및 예시 |
| React github: 
Scheduler.js | [https://github.com/facebook/react/blob/main/packages/scheduler/src/forks/Scheduler.js#L347-L371](https://github.com/facebook/react/blob/main/packages/scheduler/src/forks/Scheduler.js#L347-L371) | 우선순위별 timeout + expirationTime 계산 (347~371번째 줄) |
