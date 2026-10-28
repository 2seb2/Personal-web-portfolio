---
id: "article12"
title: "클로저"
kinds: ["스터디"]
stacks: ["JavaScript"]
date: "2025"   # TODO(세비): 실제 날짜 확인
excerpt: "클로저는 함수가 선언된 시점의 렉시컬 환경을 기억해, 외부 함수의 실행이 끝난 후에도 그 스코프의 변수에 접근할 수 있는 메커니즘이다..."
---

## 📅 스터디 정보

| 항목 | 내용 |
| --- | --- |
| 주차 | 2주차 |
| 날짜 | 2026-03-18 |
| 주제 | 클로저 |
| 발표자 | 이세비 |

---

## 1. 🗺️ 개념 지도 (Overview)

> 이 주제를 한 문장으로 설명하면?
> 

**한 줄 요약:**

```
"클로저는 함수가 선언된 시점의 렉시컬 환경을 기억해, 외부 함수의 실행이 끝난 후에도 그 스코프의 변수에 접근할 수 있는 메커니즘이다."
```

## **이 주제가 왜 중요한가?**

- 전역 변수 없이 상태를 유지하거나 데이터를 은닉하는 핵심 수단이다.
- React useState, useEffect, useCallback이 클로저를 기반으로 동작하며, 이를 모르면 Stale Closure 버그의 원인을 파악하기 어렵다.
- 프론트엔드 면접에서 this 바인딩과 함께 가장 자주 둥장하는 JS 핵심 개념이다.

**관련 키워드 (마인드맵 형태로 나열):**

```
[클로저 (Closure)]
├── 전제 개념
│   ├── 렉시컬 스코프 (Lexical Scope)
│   ├── 실행 컨텍스트 (Execution Context)
│   └── 스코프 체인 (Scope Chain)
├── 클로저의 동작
│   ├── 외부 변수 참조 유지
│   ├── 자유 변수 (Free Variable)
│   └── GC 수거 방지
├── 활용 패턴
│   ├── 데이터 은닉 (Private 변수)
│   ├── 상태 유지 (카운터, 누적값)
│   ├── 팩토리 함수
│   └── once 패턴
├── 주의사항
│   ├── Stale Closure (useEffect / useCallback)
│   └── 메모리 누수
└── 실무 연결
    ├── React useState / useEffect / useCallback
    └── debounce / throttle
```

---

## 2. 📖 핵심 개념 정리

> ⚠️ 단순 복붙 금지! 반드시 **자신의 말로** 재작성할 것
> 

### 2-1. 렉시컬 스코프(Lexical Scope) — 클로저의 전제

**개념 설명 (내 말로):**

> 자바스크립트는 함수가 **어디서 호출됐는지**가 아니라 **어디서 선언됐는지**를 기준으로 상위 스코프를 결정한다. 함수가 선언되는 순간 상위 스코프가 정적으로 확정되며, 이후 호출 위치와 무관하게 그 스코프의 변수에 접근한다.
> 

**동작 원리 / 흐름:**

1. 함수가 선언될 때, 자바스크립트 엔진은 해당 함수가 선언된 위치의 스코프 정보를 함수 내부에 기록한다.
2. 함수가 실행될 때, 이 기록을 따라 외부 변수를 탐색한다.
3. 일반적으로 함수 실행이 끝나면 내부 지역 변수는 GC의 수거 대상이 된다.

**실제 코드 예시:**

```jsx
// 호출 위치가 아닌 선언 위치 기준
const value = 'outer';

function printValue() {
  console.log(value); // 선언 위치(전역)의 value 참조
}

function wrapper() {
  const value = 'inner';
  printValue(); // 'outer' 출력 — 호출 위치의 value가 아님
}

wrapper();

// 함수 실행 후 지역 변수는 사라진다
function counter() {
  let count = 0;
  return ++count;
}
console.log(counter()); // 1
console.log(counter()); // 1 — 매번 count가 초기화됨
```

## **핵심 포인트:**

- 스코프는 **선언 위치** 기준으로 결정된다. (호출 위치 기준 X)
- 함수가 종료되면 지역 변수는 사라진다 → 클로저는 이 변수를 유지하는 방법이다.

---

### 2-2. 클로저 (Closure)

**개념 설명 (내 말로):**

> 내부 함수가 외부 함수의 변수를 참조할 때, 외부 함수의 실행이 끝나도 해당 변수가 GC에 수거되지 않고 내부 함수를 통해 계속 접근 가능한 상태가 된다. 이 내부 함수를 클로저라고 한다.
> 

**동작 원리 / 흐름:**

1. 외부 함수가 실행되며 지역 변수가 생성된다.
2. 내부 함수가 그 변수를 참조한다.
3. 외부 함수가 내부 함수를 반환하고 실행을 마친다.
4. 일반적으로 지역 변수는 GC 수거 대상이 되지만, 반환된 내부 함수가 여전히 참조하고 있으므로 수거되지 않는다.
5. 반환된 함수를 호출하면 외부 함수의 변수에 계속 접근할 수 있다.

**실제 코드 예시:**

```jsx
function makeAdder(x) {
  // x는 makeAdder의 지역 변수
  return function(y) {
    return x + y; // 외부 함수의 x를 클로저로 참조
  };
}

const add5  = makeAdder(5);  // makeAdder 실행 종료, 그러나 x = 5가 유지됨
const add10 = makeAdder(10);

console.log(add5(3));  // 8  (5 + 3)
console.log(add10(3)); // 13 (10 + 3)
console.log(add5(7));  // 12 (5 + 7) — x는 계속 5
```

## **핵심 포인트:**

- 클로저 = **함수 + 그 함수가 선언됐을 때의 렉시컬 환경**
- 내부 함수가 참조하는 외부 변수를 **자유 변수(Free Variable)** 라고 한다.
- `makeAdder` 를 호출할 때마다 독립적인 렉시컬 환경이 생성되므로, `add5` 와 `add10` 의 `x` 는 서로 영향을 주지 않는다.

---

### 2-3. 클로저 활용 패턴

**개념 설명 (내 말로):**

> 클로저는 주로 세 가지 목적으로 활용된다.
1. 변수를 외부에서 직접 접근하지 못하도록 **은닉**할 때
2. 전역 변수 없이 함수 호출 간 상태를 **유지**할 때
3. 특정 값이 고정된 **새 함수를 생성**할 때(팩토리 함수)
> 

**동작 원리 / 흐름:**

1. **데이터 은닉:** 변수를 외부 스코프에서 접근할 수 없게 하고, 메서드를 통해서만 조작하도록 제한한다.
2. **상태 유지:** 전역 변수 없이 함수 호출 사이에 값을 보존한다.
3. **팩토리 함수:** 호출 시 전달한 인자를 클로저로 고정한 새 함수를 반환한다.
4. **once 패턴:** `called` 플래그를 클로저로 유지해 함수가 최초 1회만 실행되도록 제어한다.

**실제 코드 예시:** 

```jsx
// 1️⃣ 데이터 은닉
function createAccount(initialBalance) {
  let balance = initialBalance; // 외부 직접 접근 불가

  return {
    deposit(amount)  { balance += amount; return balance; },
    withdraw(amount) {
      if (amount > balance) return '잔액 부족';
      balance -= amount;
      return balance;
    },
    getBalance() { return balance; },
  };
}

const account = createAccount(1000);
account.deposit(500);              // 1500
account.balance = 9999;            // 무시됨 — 클로저 외부에서 접근 불가
console.log(account.getBalance()); // 1500

// 2️⃣ 상태 유지 (독립 인스턴스)
function makeCounter() {
  let count = 0;
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    reset()     { count = 0; return count; },
  };
}

const c1 = makeCounter();
const c2 = makeCounter();
c1.increment(); c1.increment(); // c1: 2
c2.increment();                 // c2: 1
// c1과 c2는 각자 독립된 count를 가진다

// 3️⃣ 팩토리 함수
function makeValidator(min, max) {
  return function(value) {
    return value >= min && value <= max;
  };
}

const isAdult   = makeValidator(18, 120);
const isValidId = makeValidator(1, 9999);

console.log(isAdult(20));    // true
console.log(isAdult(15));    // false
console.log(isValidId(500)); // true

// 4️⃣ once 패턴
function once(fn) {
  let executed = false;
  let cachedResult;

  return function(...args) {
    if (!executed) {
      executed = true;
      cachedResult = fn(...args);
    }
    return cachedResult;
  };
}

const loadConfig = once(() => {
  console.log('설정 로드');
  return { theme: 'dark', lang: 'ko' };
});

loadConfig(); // '설정 로드' 출력
loadConfig(); // 출력 없음, 캐시된 결과 반환
loadConfig(); // 출력 없음, 캐시된 결과 반환
```

## **핵심 포인트:**

- 데이터 은닉: 변수를 직접 수정할 수 없고 공개된 메서드로만 조작 가능 → 의도치 않은 변경 방지
- 상태 유지: 외부 함수를 호출할 때마다 독립적인 렉시컬 환경이 생성되어 인스턴스 간 상태가 격리된다.
- once 패턴: `executed` 플래그가 클로저로 유지되어 최초 실행 이후 로직을 건너뛴다.

---

## 3. 🔍 깊이 이해하기

### 왜 이렇게 설계됐을까? (Design Decision)

> 이 기술/개념이 왜 이런 방식으로 만들어졌는지 배경을 이해하자
> 
- 자바스크립트에서 함수는 **일급 객체**로 변수에 할당되거나 다른 함수의 인자·반환값으로 사용된다.
- 반환된 함수가 선언 시점의 스코프를 기억하지 못하면, 외부 변수에 전혀 접근할 수 없어 콜백·고차 함수 패턴이 성립하지 않는다.
- 렉시컬 스코프 원칙에 의해 함수는 선언 시 스코프 정보를 자동으로 보존하고, 이것이 클로저의 동작 기반이 된다.
- javascript.info에 따르면 자바스크립트에서는 사실상 **모든 함수가 클로저**다. (예외: `new Function` 문법)

### 다른 개념과의 비교

> **클로저 vs 전역 변수** — 상태 유지 방법 비교
> 

| 구분 | 전역 변수 | 클로저 |
| --- | --- | --- |
| 접근 범위 | 코드 어디서든 접근 가능 | 반환된 함수를 통해서만 접근 |
| 데이터 보호 | ❌ 외부에서 직접 수정 가능 | ✅ 외부 직접 접근 차단 |
| 네임스페이스 오염 | ❌ 전역 오염 위험 | ✅ 스코프 내부에 격리 |
| 상태 유지 | ✅ | ✅ |

> **일반 함수 vs 클로저를 반환하는 함수** — 변수 수명 비교
> 

| 구분 | 일반 함수 | 클로저 반환 함수 |
| --- | --- | --- |
| 실행 후 지역 변수 | GC 수거 대상 | 내부 함수가 참조하는 한 유지 |
| 호출 간 상태 기억 | ❌ 매번 초기화 | ✅ 유지 |
| 데이터 은닉 | ❌ | ✅ |

### 실무에서는 어떻게 쓰이나?

> 실제 프로젝트에서 마주칠 수 있는 상황
> 

**① React `useState` 개념 모델**

함수형 컴포넌트는 렌더링마다 함수가 재실행되지만, `useState`는 클로저를 통해 이전 상태를 유지한다.

```jsx
// 실제 구현과 다르지만, 클로저 관점의 개념 모델
function useState(initialVal) {
  let _state = initialVal;

  const getState = () => _state;
  const setState = (next) => { _state = next; };

  return [getState, setState];
  // getState와 setState 모두 _state를 클로저로 참조한다
}
```

**② Stale Closure — `useEffect` 의존성 누락**

```jsx
// ❌ 문제: time이 항상 0으로 고정됨
function Timer() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(time + 1); // effect 최초 실행 시점의 time=0을 캡처
    }, 1000);
    return () => clearInterval(id);
  }, []); // 빈 배열 → effect 재실행 없음 → time이 갱신되지 않음
}

// ✅ 해결 ①: 함수형 업데이트 — 최신 state를 React가 주입
useEffect(() => {
  const id = setInterval(() => {
    setTime(prev => prev + 1); // prev는 항상 최신값
  }, 1000);
  return () => clearInterval(id);
}, []);

// ✅ 해결 ②: 의존성 배열에 time 추가 → time 변경 시 effect 재실행
useEffect(() => {
  const id = setInterval(() => {
    setTime(time + 1);
  }, 1000);
  return () => clearInterval(id);
}, [time]);
```

**③ Stale Closure — `useCallback` 의존성 누락**

```jsx
// ❌ 문제: query가 항상 초기값 ''를 참조
function SearchBox() {
  const [query, setQuery] = useState('');

  const search = useCallback(() => {
    fetchResults(query); // useCallback 생성 시점의 query=''를 캡처
  }, []); // query가 빠져있음

  // ✅ 해결
  const searchFixed = useCallback(() => {
    fetchResults(query);
  }, [query]); // query가 바뀌면 함수 재생성
}
```

ESLint `react-hooks/exhaustive-deps` 규칙이 의존성 누락을 경고하는 이유가 바로 이 Stale Closure 문제다.

**④ debounce**

```jsx
function debounce(fn, delay) {
  let timerId = null;

  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
    // timerId를 클로저로 유지하여 이전 타이머를 취소할 수 있다
  };
}

const onSearch = debounce((q) => fetchResults(q), 300);

onSearch('r');      // 취소
onSearch('re');     // 취소
onSearch('react');  // 300ms 후 fetchResults('react') 실행
```

---

## 4. 🎤 구두 설명 연습

> 면접관 앞에서 말하듯이 작성. 읽는 용도가 아니라 **말하는 연습**을 위한 섹션
> 

### "~이 뭔가요?" 질문에 대한 답변 스크립트

```
[도입 - 핵심 정의 먼저]
"클로저는 함수가 선언된 시점의 렉시컬 환경을 기억해,
 외부 함수 실행이 끝난 후에도 그 스코프의 변수에 접근할 수 있는 메커니즘입니다."

[부연 - 왜/어떻게]
"자바스크립트는 함수 선언 시 상위 스코프 정보를 내부에 저장합니다.
 내부 함수가 외부 변수를 참조하고 있으면 외부 함수가 종료돼도
 해당 변수는 GC에 수거되지 않고 유지됩니다."

[마무리 - 실무 연결]
"실무에서는 주로 세 가지로 활용합니다.
 데이터를 외부에서 직접 수정하지 못하게 은닉하거나,
 전역 변수 없이 함수 호출 간 상태를 유지하거나,
 특정 값을 고정한 새 함수를 만드는 팩토리 패턴에 씁니다.
 React의 useState도 클로저로 상태를 유지하며,
 useEffect의 의존성 배열을 잘못 관리하면 Stale Closure 버그가 발생합니다."
```

### ⏱️ 1분 요약 버전

> 면접관이 바쁠 때, 딱 1분 안에 설명하는 버전
> 

```
클로저는 함수가 선언될 당시의 렉시컬 환경을 기억하여, 외부 스코프의 변수에 계속 접근할 수 있는 함수입니다. 외부 함수가 종료된 이후에도 내부 함수가 해당 변수를 참조하고 있다면, 그 변수는 가비지 컬렉션의 대상이 되지 않고 유지됩니다. 이러한 특성을 활용해 데이터 은닉, 상태 유지, 팩토리 함수 구현 등에 사용되며, React Hooks 역시 이 원리를 기반으로 동작합니다.
```

---

## 5. ❓ 예상 면접 질문 & 답변

> 각 질문에 대해 **STAR 구조** 혹은 **두berlingo 두berlingo 두 문장 요약**으로 작성
> 

### 기본 질문

- **Q1. 클로저(Closure)란 무엇인가요?**
    
    > A: 클로저는 함수가 선언될 당시의 렉시컬 환경을 기억하여, 외부 스코프의 변수에 계속 접근할 수 있는 함수입니다. 내부 함수가 외부 함수의 변수를 참조할 경우, 외부 함수의 실행이 종료된 이후에도 해당 변수는 가비지 컬렉션의 대상이 되지 않고 유지되며, 내부 함수를 통해 계속 접근할 수 있는 상태를 의미합니다.
    > 
- **Q2. 클로저를 어떤 상황에 활용하나요?**
    
    > A: 세 가지 상황에서 주로 활용합니다. 
    첫째, **데이터 은닉**입니다. 변수를 클로저 내부에 캡슐화해 외부에서 직접 수정하지 못하도록 하고, 공개된 메서드로만 접근하게 할 수 있습니다.
    둘째, **상태 유지**입니다. 전역 변수 없이 함수 호출 간 값을 보존할 수 있어 네임스페이스 오염을 방지합니다.
    셋째, **팩토리 함수**입니다. 인자를 클로저로 고정해 특정 동작이 미리 설정된 함수를 만들 수 있습니다.
    > 
- **Q3. 렉시컬 스코프와 클로저는 어떤 관계인가요?**
    
    > A: 렉시컬 스코프가 클로저를 가능하게 하는 전제 조건입니다. 자바스크립트는 함수 선언 시 상위 스코프가 정적으로 결정되어 함수 내부에 기록됩니다. 덕분에 외부 함수가 종료된 이후에도 내부 함수가 외부 변수를 참조할 수 있습니다.
    > 

---

### 심화 질문 (꼬리질문 대비)

```jsx
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
```

- **Q4. 다음 코드의 출력 결과와 이유를 설명해주세요.**
    
    > A: `3 3 3`이 출력됩니다.  `var`는 함수 스코프이므로 `i`는 루프 블록이 아닌 전역에 하나만 존재합니다. `setTimeout` 콜백이 실행될 시점에는 루프가 이미 끝나 `i === 3`인 상태이고, 세 콜백 모두 동일한 `i`를 클로저로 공유하기 때문입니다.
    > 
    > 
    > 해결 방법은 두 가지입니다.
    > 
    > ```jsx
    > // ① let: 블록 스코프로 반복마다 독립적인 i 생성
    > for (let i = 0; i < 3; i++) {
    >   setTimeout(() => console.log(i), 0); // 0 1 2
    > }
    > 
    > // ② IIFE: 각 반복 시점의 i 값을 별도 스코프에 캡처
    > for (var i = 0; i < 3; i++) {
    >   (function(j) {
    >     setTimeout(() => console.log(j), 0); // 0 1 2
    >   })(i);
    > }
    > ```
    > 
- **Q5. React `useEffect`에서 클로저로 인한 버그가 발생할 수 있나요?**
    
    > A: 네, **Stale Closure(낡은 클로저)** 문제가 대표적입니다. `useEffect`의 의존성 배열이 비어있으면 effect 내부 함수가 최초 실행 시점의 state·props를 클로저로 캡처한 채 갱신되지 않습니다. 예를 들어 `setInterval` 안에서 `setState(count + 1)`을 쓰면 `count`가 항상 초기값 0으로 고정됩니다. 해결 방법은 두 가지입니다.
    > 
    > - **함수형 업데이트**: `setState(prev => prev + 1)` — React가 최신 state를 `prev`로 주입해줍니다.
    > - **의존성 배열 명시**: 해당 변수를 배열에 추가하면 변수가 바뀔 때마다 effect가 재실행됩니다.
    > 
    > ESLint `react-hooks/exhaustive-deps` 규칙이 존재하는 이유가 이 Stale Closure 문제를 방지하기 위해서입니다.
    > 

---

### 🧨 함정/난이도 높은 질문

- **Q6. 클로저 사용 시 주의해야 할 점은 무엇인가요?**
    
    > A: **메모리 누수(Memory Leak)**에 주의해야 합니다. 클로저가 외부 변수를 참조하는 한 그 변수는 GC 수거 대상이 되지 않습니다. 이벤트 핸들러를 클로저로 등록하고 해제하지 않으면, 컴포넌트가 언마운트된 후에도 참조가 유지되어 메모리가 점유됩니다.
    > 
    > 
    > ```jsx
    > // ❌ 메모리 누수 위험
    > function setup() {
    >   const data = new Array(100000).fill(0);
    >   document.getElementById('btn').addEventListener('click', () => {
    >     console.log(data.length); // data를 클로저로 참조
    >   });
    >   // 핸들러를 제거하지 않으면 data가 계속 메모리에 남는다
    > }
    > 
    > // ✅ 해결: 핸들러를 변수로 분리해 명시적으로 제거
    > function setup() {
    >   const data = new Array(100000).fill(0);
    >   const handler = () => console.log(data.length);
    >   const btn = document.getElementById('btn');
    >   btn.addEventListener('click', handler);
    >   return () => btn.removeEventListener('click', handler);
    > }
    > ```
    > 
    > React에서는 `useEffect` cleanup 함수로 이벤트 구독이나 타이머를 반드시 정리해야 합니다.
    > 

---

## 6. 🛠️ 실습 / 직접 구현해보기

> 개념을 몸으로 익히기 위한 미니 실습
> 

### 실습 목표

- [ ]  클로저로 private 변수를 가진 객체 만들기
- [ ]  `for + var` 클로저 버그를 직접 확인하고 `let`으로 수정하기
- [ ]  `debounce` 함수를 클로저로 직접 구현하기

### 실습 코드

```jsx
// ① private 변수를 가진 스택 구현
function createStack() {
  const items = []; // 외부 직접 접근 불가

  return {
    push(item) { items.push(item); },
    pop()      { return items.pop(); },
    peek()     { return items[items.length - 1]; },
    size()     { return items.length; },
    isEmpty()  { return items.length === 0; },
  };
}

const stack = createStack();
stack.push(1); stack.push(2); stack.push(3);
console.log(stack.peek());  // 3
console.log(stack.pop());   // 3
console.log(stack.size());  // 2
console.log(stack.items);   // undefined (직접 접근 불가)

// ② for + var 클로저 버그 확인
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var:', i), 0); // 3 3 3
}

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log('let:', i), 0); // 0 1 2
}

// ③ debounce 직접 구현
function debounce(fn, delay) {
  let timerId = null;

  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

const onInput = debounce((value) => {
  console.log('검색 요청:', value);
}, 300);

onInput('j');
onInput('ja');
onInput('java'); // 300ms 후 '검색 요청: java' 실행
```

### 실습하면서 깨달은 점

- `stack.items`에 직접 접근하면 `undefined`가 반환된다. `items` 자체가 클로저 스코프 안에 격리되어 있어서 외부에서는 해당 변수의 존재를 인식조차 할 수 없기 때문이다. 클래스의 `private` 필드 없이도 동일한 은닉 효과를 낼 수 있다는 점에서, 면접에서 "JavaScript에서 private 변수를 어떻게 구현하나요?"라는 질문이 나오면 클로저 패턴을 예시로 들 수 있겠다는 걸 깨달았다.
- `var`와 `let`을 `setTimeout`과 함께 직접 실행해보면 `3 3 3` vs `0 1 2`로 결과가 즉시 갈린다. `var`는 블록 스코프가 없어 루프 전체에서 `i` 하나를 공유하고, 콜백이 실행될 시점엔 이미 루프가 끝나 `i === 3`이 된 상태라는 것이 체감됐다.
- `debounce`를 구현하면서 `timerId`가 반환된 함수 바깥에 선언되어 있어야 한다는 게 핵심이라는 걸 알았다. `timerId`가 함수 내부에 있으면 호출할 때마다 초기화되어 이전 타이머를 취소할 수 없다.

---

## 7. 📝 나만의 요약 노트

> 공부하고 나서 **진짜 내 머릿속에 남은 것들만** 정리
> 

### 오늘 이 주제에서 가장 중요한 것 3가지

1. 클로저 = **함수 + 선언 시점의 렉시컬 환경** → 외부 함수 종료 후에도 자유 변수가 유지된다.
2. 자유 변수는 **내부 함수가 참조하는 한 GC에 수거되지 않는다** → 상태 유지의 근거이자 메모리 누수의 원인
3. React `useEffect` / `useCallback`에서 의존성 배열을 빠뜨리면 **Stale Closure** 버그가 발생한다.

### 헷갈렸던 부분 & 해결

| 헷갈린 것 | 알고 보니 |
| --- | --- |
| 클로저가 특별한 문법인 줄 알았다 | 별도 문법이 없다. 함수가 선언 시 스코프를 자동으로 기록하므로 사실상 모든 함수가 클로저다 |
| for + var에서 클로저가 각각 다른 i를 기억할 줄 알았다 | var는 블록 스코프가 없어 루프 전체에서 i 하나를 공유한다. let을 쓰면 반복마다 독립적인 i가 생성된다 |
| useEffect 빈 배열이면 안전한 줄 알았다 | 빈 배열은 최초 실행 시점의 값만 캡처한다. 이후 state가 변해도 effect 내부 함수는 초기값을 참조한다 (Stale Closure) |

---

## 8. 📚 참고 자료

| 자료 | 링크 | 추천 이유 |
| --- | --- | --- |
| MDN - 클로저 (한국어) | [https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Closures](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Closures) | 공식 문서, 렉시컬 스코프부터 실용 패턴까지 포괄 |
| MDN Glossary - Closure | [https://developer.mozilla.org/en-US/docs/Glossary/Closure](https://developer.mozilla.org/en-US/docs/Glossary/Closure) | 간결한 정의와 카운터 예제 |
| javascript.info - 클로저 | [https://ko.javascript.info/closure](https://ko.javascript.info/closure) | 렉시컬 환경 동작 원리 상세 설명 |
| React 공식 문서 - useState | [https://react.dev/reference/react/useState](https://react.dev/reference/react/useState) | 함수형 업데이트 패턴 |
| React 공식 문서 - useEffect | [https://react.dev/reference/react/useEffect](https://react.dev/reference/react/useEffect) | 의존성 배열과 Stale Closure |
| React 공식 문서 - useCallback | [https://react.dev/reference/react/useCallback](https://react.dev/reference/react/useCallback) | 의존성 누락 시 동작 |
