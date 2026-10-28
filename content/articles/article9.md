---
id: "article9"
title: "클로저 어렵지 않아요!"
kinds: ["스터디"]
stacks: ["JavaScript"]
date: "2025-01-01"   # TODO(세비): 실제 날짜 확인
excerpt: "면접에서 \"클로저가 뭔가요?\"라는 질문을 받았을 때, 정의만 읊고 끝나면 아쉽다. 중요한 건 왜 이게 필요한지, 그리고 실제로 어디에 쓰이는지를..."
---

## 1. 클로저, 왜 알아야 할까?

면접에서 "클로저가 뭔가요?"라는 질문을 받았을 때, 정의만 읊고 끝나면 아쉽다. 중요한 건 **왜 이게 필요한지**, 그리고 **실제로 어디에 쓰이는지**를 아는 것이다.

사실 우리는 이미 클로저를 매일 쓰고 있다. React의 `useState`, `useEffect`, `useCallback` 같은 훅들이 전부 클로저를 기반으로 동작하기 때문이다. 클로저를 모르면 React에서 왜 이상한 버그가 생기는지 이해할 수 없고, 의존성 배열도 그냥 ESLint가 빨간 줄 그으니까 넣는 수준에 머무르게 된다.

---

## 2. 스코프: 변수가 살아있는 범위

클로저를 이해하려면 먼저 **스코프(Scope)**를 알아야 한다.

### 변수는 어디서든 접근할 수 있을까?

```jsx
function sayHello() {
  let message = "안녕하세요";
  console.log(message);
}

sayHello(); // "안녕하세요"
console.log(message); // ReferenceError: message is not defined
```

함수 안에서 만든 `message`는 함수 안에서만 쓸 수 있다. 함수 밖에서 접근하려고 하면 에러가 난다. 이게 **렉시컬 스코프(Lexical Scope)** 규칙이다.

### 왜 이런 규칙이 있을까?

금고를 생각해보자. 금고 안에 넣은 물건은 금고 문을 열어야만 꺼낼 수 있다. 아무 데서나 손을 뻗어서 금고 안의 물건을 집을 수 있다면 금고의 의미가 없다.

변수도 마찬가지다. 함수 안에서 만든 변수를 아무 데서나 접근할 수 있다면, 코드가 복잡해졌을 때 어디서 이 변수가 바뀌는지 추적할 수가 없다. 스코프는 **변수를 보호하는 울타리** 같은 것이다.

### 함수가 끝나면 변수는 사라진다

```jsx
function getCount() {
  let count = 0;
  count++;
  return count;
}

console.log(getCount()); // 1
console.log(getCount()); // 1 (다시 0부터 시작)
console.log(getCount()); // 1
```

`getCount()`를 아무리 호출해도 결과는 항상 1이다. 함수가 끝날 때마다 `count`가 메모리에서 사라지고, 다음 호출 때 다시 0으로 만들어지기 때문이다.

**그렇다면 함수가 끝나도 변수를 유지하고 싶으면 어떻게 해야 할까?**

### 전역 변수..는 위험하다!

```jsx
let count = 0;

function increment() {
  count++;
  return count;
}

console.log(increment()); // 1
console.log(increment()); // 2
console.log(increment()); // 3
```

전역 변수를 쓰면 값이 유지된다. 하지만 이 방식은 문제가 많다.

| 문제 | 설명 |
| --- | --- |
| 오염 | 다른 코드에서 실수로 같은 이름의 변수를 쓰면 충돌 |
| 추적 어려움 | 프로젝트가 커지면 이 변수가 어디서 바뀌는지 찾기 힘듦 |
| 보안 취약 | 아무 데서나 `count = 9999`처럼 조작 가능 |

**변수를 함수 안에 숨기면서도, 필요할 때 접근할 수 있는 방법이 필요하다. 이게 클로저다.**

---

## 3. 클로저란 무엇인가

### 핵심 개념

> **클로저는 함수가 자신이 생성된 환경을 기억하는 것이다.**
> 

함수 안에서 다른 함수를 만들어서 리턴하면, 리턴된 함수는 자신이 태어난 곳의 변수들을 기억한다. 부모 함수가 끝나도 그 변수들은 사라지지 않는다.

### 코드로 보기

```jsx
function createCounter() {
  let count = 0;

  return {
    increase: function() {
      count++;
      return count;
    },
    decrease: function() {
      count--;
      return count;
    },
    getCount: function() {
      return count;
    }
  };
}
```

`createCounter`는 객체를 리턴하는데, 이 객체 안의 함수들이 `count`를 사용하고 있다.

```jsx
const counter = createCounter();

console.log(counter.getCount()); // 0
counter.increase();
counter.increase();
console.log(counter.getCount()); // 2
counter.decrease();
console.log(counter.getCount()); // 1

// 직접 접근은 불가능
console.log(counter.count); // undefined
```

`createCounter()`가 끝났는데도 `count`가 살아있다! `increase`, `decrease`, `getCount` 함수들이 `count`를 붙잡고 있기 때문이다.

### 독립적인 인스턴스

```jsx
const counterA = createCounter();
const counterB = createCounter();

counterA.increase();
counterA.increase();
counterA.increase();

counterB.increase();

console.log(counterA.getCount()); // 3
console.log(counterB.getCount()); // 1 (완전히 독립적)
```

`createCounter()`를 호출할 때마다 새로운 `count`가 만들어진다. 각 카운터는 서로 영향을 주지 않는다.

---

## 4. 클로저의 동작 원리

### 왜 변수가 안 사라질까?

일반적으로 함수가 끝나면 그 안의 변수는 가비지 컬렉션 대상이 된다. 아무도 그 변수를 참조하지 않으니까.

그런데 클로저는 다르다. 리턴된 함수가 외부 변수를 **참조**하고 있다.

```jsx
increase: function() {
  count++;  // count를 참조 중
  return count;
}
```

자바스크립트 엔진은 "아, 이 함수가 `count`를 쓰고 있네. 지우면 안 되겠다"라고 판단해서 메모리에 남겨둔다.

### 렉시컬 환경(Lexical Environment)

좀 더 정확히 말하면, 함수는 생성될 때 자신의 **렉시컬 환경**을 저장한다. 렉시컬 환경이란 그 함수가 접근할 수 있는 변수들의 목록이다.

```
counter 객체 내부
┌─────────────────────────────────┐
│  increase 함수                   │
│  decrease 함수                   │
│  getCount 함수                   │
│  ───────────────────────────────│
│  [[Environment]]                │
│   └─ count: 0                   │  ← 렉시컬 환경
└─────────────────────────────────┘
```

`counter`가 메모리에 있는 한, 이 렉시컬 환경도 유지된다.

---

## 5. 클로저 활용 패턴

### 상태 관리

React의 `useState`도 클로저로 만들어졌다. 아주 단순화하면 이런 모습이다

```jsx
function useState(initialValue) {
  let state = initialValue;

  const getState = () => state;
  const setState = (newValue) => {
    state = newValue;
  };

  return [getState, setState];
}

const [count, setCount] = useState(0);

console.log(count()); // 0
setCount(5);
console.log(count()); // 5
```

실제 `useState`는 렌더링 트리거 등 복잡한 로직이 있지만, **상태를 클로저로 기억한다**는 핵심은 같다.

### 정보 은닉 (캡슐화)

외부에서 직접 건드리면 안 되는 값을 보호할 수 있다.

```jsx
function createWallet(initialMoney) {
  let money = initialMoney;

  return {
    deposit: function(amount) {
      if (amount > 0) {
        money += amount;
        return `${amount}원 입금. 잔액: ${money}원`;
      }
      return "올바른 금액을 입력하세요";
    },
    withdraw: function(amount) {
      if (amount > 0 && amount <= money) {
        money -= amount;
        return `${amount}원 출금. 잔액: ${money}원`;
      }
      return "잔액이 부족하거나 잘못된 금액입니다";
    },
    getBalance: function() {
      return money;
    }
  };
}

const myWallet = createWallet(10000);

console.log(myWallet.deposit(5000));  // "5000원 입금. 잔액: 15000원"
console.log(myWallet.withdraw(3000)); // "3000원 출금. 잔액: 12000원"
console.log(myWallet.getBalance());   // 12000

// 직접 조작 시도
myWallet.money = 9999999;
console.log(myWallet.getBalance());   // 여전히 12000 (조작 실패)
```

`money`에 직접 접근할 방법이 없다. 오직 `deposit`, `withdraw` 함수를 통해서만 조작할 수 있다.

### 함수 팩토리

특정 값을 기억하는 함수를 찍어낼 수 있다.

```jsx
function createGreeting(greeting) {
  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const sayHello = createGreeting("안녕하세요");
const sayBye = createGreeting("안녕히 가세요");

console.log(sayHello("철수")); // "안녕하세요, 철수!"
console.log(sayHello("영희")); // "안녕하세요, 영희!"
console.log(sayBye("철수"));   // "안녕히 가세요, 철수!"
```

`sayHello`는 `"안녕하세요"`를, `sayBye`는 `"안녕히 가세요"`를 각각 기억하고 있다.

### 한 번만 실행되는 함수

```jsx
function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

const initialize = once(() => {
  console.log("초기화 실행!");
  return { initialized: true };
});

console.log(initialize()); // "초기화 실행!" 출력, { initialized: true } 반환
console.log(initialize()); // 아무것도 출력 안 됨, { initialized: true } 반환
console.log(initialize()); // 아무것도 출력 안 됨, { initialized: true } 반환
```

`called`가 클로저로 유지되기 때문에, 처음 호출 이후로는 함수가 실행되지 않는다.

---

## 6. React Hooks와 클로저

React에서 클로저 때문에 생기는 버그는 정말 흔하다. 이해 없이 넘어가면 계속 같은 실수를 반복하게 된다.

### setState가 옛날 값을 쓰는 문제

장바구니에 상품을 추가하는 버튼을 만들었다고 하자.

```jsx
function Cart() {
  const [itemCount, setItemCount] = useState(0);

  const addItem = () => {
    // 버튼 클릭 1초 후에 수량 증가
    setTimeout(() => {
      setItemCount(itemCount + 1);
    }, 1000);
  };

  return (
    <div>
      <p>장바구니: {itemCount}개</p>
      <button onClick={addItem}>추가</button>
    </div>
  );
}
```

버튼을 연속으로 5번 빠르게 누르면 5개가 될 것 같지만, **실제로는 1개만 된다.**

왜일까? `addItem` 함수가 만들어지는 시점에 `itemCount`는 0이다. `setTimeout` 안의 함수는 이 `itemCount = 0`을 클로저로 캡처한다. 5번 클릭해도 각각 `0 + 1 = 1`을 계산하는 것이다.

**해결: 함수형 업데이트**

```jsx
const addItem = () => {
  setTimeout(() => {
    setItemCount(prev => prev + 1);  // prev는 항상 최신 값
  }, 1000);
};
```

`prev => prev + 1`을 쓰면 React가 현재 최신 상태를 `prev`로 넘겨준다.

### useEffect가 옛날 값을 보는 문제

실시간으로 경과 시간을 표시하는 컴포넌트를 만들어보자.

```jsx
function Stopwatch() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log("현재 time:", time); // 계속 0만 찍힘
      setTime(time + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []); // 빈 배열 = 처음 한 번만 실행

  return <div>{time}초</div>;
}
```

화면에는 계속 "1초"만 표시된다.

`useEffect`가 처음 실행될 때 `setInterval` 안의 함수가 만들어진다. 이 함수는 그 순간의 `time = 0`을 클로저로 캡처한다. 의존성 배열이 비어있으니 effect가 다시 실행되지 않고, 함수는 계속 `0 + 1 = 1`만 계산한다.

**해결 방법 1: 의존성 배열에 추가**

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    setTime(time + 1);
  }, 1000);

  return () => clearInterval(timer);
}, [time]); // time이 바뀔 때마다 effect 재실행
```

**해결 방법 2: 함수형 업데이트**

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    setTime(prev => prev + 1);
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

### useCallback의 의존성

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const addTodo = useCallback(() => {
    setTodos([...todos, input]);
    setInput("");
  }, []); // ❌ 빈 배열이면 todos와 input은 항상 초기값

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>추가</button>
      <ul>
        {todos.map((todo, i) => <li key={i}>{todo}</li>)}
      </ul>
    </div>
  );
}
```

input에 뭘 쓰고 추가 버튼을 눌러도 빈 문자열만 추가된다. `useCallback`이 처음 만들어질 때의 `todos = []`, `input = ""`을 기억하고 있기 때문이다.

**해결: 의존성 배열에 추가**

```jsx
const addTodo = useCallback(() => {
  setTodos([...todos, input]);
  setInput("");
}, [todos, input]);
```

또는 함수형 업데이트를 쓰면 `todos` 의존성을 없앨 수 있다.

```jsx
const addTodo = useCallback(() => {
  setTodos(prev => [...prev, input]);
  setInput("");
}, [input]);
```

---

## 7. 흔한 실수와 해결법

### 반복문 안에서 클로저

```jsx
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
// 출력: 3, 3, 3
```

`var`는 함수 스코프라서 반복문 전체가 하나의 `i`를 공유한다. 반복문이 끝나면 `i`는 3이고, 세 함수 모두 이 3을 본다.

**해결: let 사용**

```jsx
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
// 출력: 0, 1, 2
```

`let`은 블록 스코프라서 반복마다 새로운 `i`가 생기고, 각 함수가 자기만의 `i`를 캡처한다.

### 의도치 않은 공유

```jsx
function createTools() {
  let value = 0;

  return {
    increment: () => ++value,
    decrement: () => --value
  };
}

const tools = createTools();
console.log(tools.increment()); // 1
console.log(tools.increment()); // 2
console.log(tools.decrement()); // 1 (같은 value를 공유)
```

`increment`와 `decrement`가 같은 `value`를 공유하고 있다. 의도한 거면 OK, 아니면 버그다. 독립적으로 동작해야 한다면 별도의 클로저를 만들어야 한다.

### 메모리 누수

클로저는 외부 변수를 참조하는 한 그 변수가 메모리에서 해제되지 않는다. 큰 데이터를 클로저가 붙잡고 있으면 메모리 낭비가 될 수 있다.

```jsx
function createProcessor() {
  const hugeData = new Array(1000000).fill("data");

  return function process() {
    // hugeData를 직접 안 써도 참조는 유지됨
    return "처리 완료";
  };
}

const process = createProcessor();
// hugeData는 process가 있는 한 메모리에 남아있음
```

필요 없어진 클로저는 `null`로 해제하거나, 애초에 불필요한 참조를 만들지 않도록 구조를 개선해보면 좋을 것 같다.

---

## 8. 참고 자료

- [MDN - Closures](https://developer.mozilla.org/ko/docs/Web/JavaScript/Closures)
- [ECMAScript Specification - Lexical Environments](https://tc39.es/ecma262/#sec-lexical-environments)
- [React 공식 문서 - useState](https://react.dev/reference/react/useState)
- [React 공식 문서 - useEffect](https://react.dev/reference/react/useEffect)
- [React 공식 문서 - useCallback](https://react.dev/reference/react/useCallback)
- [JavaScript.info - Closure](https://javascript.info/closure)
- [Dan Abramov - A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)
