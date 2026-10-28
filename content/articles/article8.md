---
id: "article8"
title: "this 바인딩"
kinds: ["스터디"]
stacks: ["JavaScript"]
date: "2026-03-18"
excerpt: "this는 선언된 위치가 아니라 호출되는 방식으로 정해진다. 4가지 바인딩 규칙과 화살표 함수의 this를 코드로 확인해 봤다."
---

## 1. 🗺️ 개념 지도 (Overview)

**한 줄 요약:**

```
"this는 함수가 어떻게 정의됐는지가 아니라, 어떻게 호출됐는지에 따라 달라지는 동적인 참조값이다."
```

## **이 주제가 왜 중요한가?**

- `this` 를 잘못 이해하면 콜백 함수나 이벤트 핸들러에서 undefined 또는 전역 객체를 참조하는 버그가 발생한다.
- React 클래스 컴포넌트, 이벤트 처리, 비동기 콜백에서 `this` 가 원인인 버그는 매우 흔하다.
- 자주 마주치는 JavaScript 핵심 개념 중 하나다.

**관련 키워드 (마인드맵 형태로 나열):**

```
[this 바인딩]
├── 바인딩 규칙
│   ├── 전역 바인딩 (기본 바인딩)
│   ├── 암묵적 바인딩 (메서드 호출)
│   ├── 명시적 바인딩 (call / apply / bind)
│   └── new 바인딩
├── 화살표 함수 (Lexical this)
│   └── 상위 스코프의 this를 정적으로 캡처
├── 실행 컨텍스트
│   ├── 호출 시점에 결정
│   └── strict mode 영향
        (기본 바인딩에서만 this가 window vs undefined로 달라진다)
└── 실무 적용
    ├── 이벤트 핸들러
    ├── setTimeout / setInterval
    └── React 클래스 컴포넌트
```

---

## 2. 📖 핵심 개념 정리

### 2-1. `this` 란 무엇인가?

**개념 설명 (내 말로):**

> `this` 는 “지금 이 함수를 누가 실행하고 있나요?”에 대한 대답이다. 자바스크립트에서 `this` 는 함수가 작성된 위치가 아닌, **함수가 호출되는 방식**에 따라 값이 결정된다.
> 

**동작 원리 / 흐름:**

1. 자바스크립트 엔진이 함수를 **호출**하는 순간 실행 컨텍스트가 생성된다.
2. 이 실행 컨텍스트 안에서 `this` 가 결정된다.
3. 아래 4가지 규칙 중 어떤 방식으로 호출됐는지를 보고 `this` 가 무엇인지 알 수 있다.

**실제 코드 예시:**

```jsx
function introduce() {
  console.log(this.name);
}

const person = { name: '세비', introduce };

// 같은 함수지만, 호출 방식에 따라 this가 달라진다
introduce();             // undefined
person.introduce();      // '세비'
```

## **핵심 포인트:**

- `this` 는 정의 시점이 아닌 호출 시점에 결정된다(화살표 함수 제외)

---

### 2-2. 4가지 바인딩 규칙

**개념 설명 (내 말로):**

> `this` 가 결정되는 데는 4가지 규칙이 있다. 우선순위는 아래 순서 그대로다.
`new 바인딩 > 명시적 바인딩 > 암묵적 바인딩 > 기본 바인딩`

**동작 원리 / 흐름:**

1. **기본 바인딩 (Default Binding):** 아무 조건도 해당되지 않을 때의 기본값
2. **암묵적 바인딩 (Implicit Binding):** 점(.) 앞의 객체가 this가 된다.
3. **명시적 바인딩 (Explicit Binding):** `call`, `apply`, `bind` 로 직접 `this` 를 지정한다.
4. **new 바인딩:** `new` 키워드로 함수를 호출하면 새로 생성된 객체가 `this` 가 된다**.**

**실제 코드 예시:**

```jsx
// ① 기본 바인딩
function greet() {
  console.log(this); // window 또는 undefined('use strict')
}
greet();

// ② 암묵적 바인딩 - 점(.) 앞의 객체가 this
const user = {
  name: '세비',
  sayHi() {
    console.log(this.name); // '세비'
  },
};
user.sayHi();

// ③ 명시적 바인딩 - call/apply는 즉시 호출, bind는 새 함수 반환
function sayHello() {
  console.log(`안녕, 나는 ${this.name}`);
}
const obj = { name: '세비' };
sayHello.call(obj);    // 즉시 호출: '안녕, 나는 세비'
sayHello.apply(obj);   // 즉시 호출: '안녕, 나는 세비'
const boundFn = sayHello.bind(obj); // 새 함수 반환 (나중에 호출)
boundFn();             // '안녕, 나는 세비'

// ④ new 바인딩 - 새로 생성된 인스턴스가 this
function Person(name) {
  this.name = name; // this = 새로 생성된 빈 객체
}
const sebi = new Person('세비');
console.log(sebi.name); // '세비'
```

## **핵심 포인트:**

- 아무것도 아니면 → 전역(`window`) 또는 `undefined`(strict mode)
- `obj.method()` → `obj`가 `this`
- `call/apply/bind` → 인자로 전달한 객체가 `this`
- `new Func()` → 새로 만들어진 인스턴스가 `this`

---

### 2-3. 화살표 함수의 `this` (Lexical `this`)

**개념 설명 (내 말로):**

> 화살표 함수는 자신만의 `this`를 가지지 않는다.
화살표 함수가 **정의된 시점**에서 자신을 감싸는 바깥 스코프의 `this`를 그대로 가져온다.
이것을 **Lexical this** 라고 부른다.

**동작 원리 / 흐름:**

1. 일반 함수: 호출 방식에 따라 `this`가 동적으로 바뀐다
2. 화살표 함수: 정의된 스코프의 `this`를 **정적으로 캡처**하고 바뀌지 않는다
3. `call`, `apply`, `bind`로도 화살표 함수의 `this`를 바꿀 수 없다

**실제 코드 예시:**

```jsx
// ❌ 일반 함수 콜백 - this가 의도치 않게 바뀜
const timer = {
  name: '타이머',
  start() {
    setTimeout(function () {
      console.log(this.name); // undefined (전역 바인딩)
    }, 1000);
  },
};
timer.start();

// ✅ 화살표 함수 콜백 - 외부 this(timer)를 캡처
const timer2 = {
  name: '타이머',
  start() {
    setTimeout(() => {
      console.log(this.name); // '타이머'
    }, 1000);
  },
};
timer2.start();
```

## **핵심 포인트:**

- 화살표 함수는 `this`를 새로 만들지 않고, **바깥 스코프에서 빌려온다.**
- `bind`/`call`/`apply`로 화살표 함수의 `this`를 바꾸는 것은 불가능하다.
- 객체의 메서드를 화살표 함수로 선언하면 의도치 않은 동작이 발생할 수 있다

---

## 3. 🔍 깊이 이해하기

### 왜 이렇게 설계됐을까? (Design Decision)

- JavaScript는 함수가 일급 객체(First-Class Object)로, 변수에 담기거나 인자로 전달될 수 있다
- 그래서 동일한 함수를 다양한 객체의 메서드로 재사용할 수 있도록 `this`를 **동적**으로 결정하는 방식을 택했다
- 단, 이 유연성이 콜백 함수에서는 혼란을 야기하는 부작용을 낳았고, ES6에서 화살표 함수로 이를 보완했다

### 다른 개념과의 비교

> `call` vs `apply` vs `bind`
> 

| 구분 | call | apply | bind |
| --- | --- | --- | --- |
| 실행 여부 | 즉시 실행 | 즉시 실행 | 새 함수 반환 |
| 인자 전달 방식 | 쉼표로 나열 | 배열로 전달 | 쉼표로 나열 |
| 사용 시점 | 한 번만 호출할 때 | 배열 형태 인자가 있을 때 | 나중에 호출하거나 재사용할 때 |
| 예시 | fn.call(obj, a, b) | fn.apply(obj, [a, b]) | const f = fn.bind(obj) |

> 일반 함수 vs 화살표 함수의 `this`
> 

| 구분 | 일반 함수 | 화살표 함수 |
| --- | --- | --- |
| this 결정 시점 | 호출 시점 (동적) | 정의 시점 (정적) |
| this 변경 가능 여부 | call/apply/bind로 가능 | 불가능 |
| 객체 메서드로 사용 | ✅ 적합 | ❌ 부적합 (this가 외부 스코프를 참조) |
| 콜백 함수로 사용 | ❌ this 유실 주의 | ✅ 외부 this 캡처 |

### 실무에서는 어떻게 쓰이나?

- **React 클래스 컴포넌트**: 이벤트 핸들러를 생성자에서 `bind(this)` 해주지 않으면 클릭 시 `this`가 `undefined`가 된다
- **`setTimeout` / `setInterval`**: 일반 함수를 콜백으로 사용하면 `this`가 전역 객체를 가리키므로, 화살표 함수 또는 `bind`로 처리해야 한다
- **DOM 이벤트 핸들러**: `addEventListener`로 등록한 일반 함수 내부의 `this`는 이벤트가 걸린 DOM 요소를 가리킨다.

**나의 경험:**

- 프로젝트에서 `setTimeout` 콜백에 일반 함수를 썼다가 `this` 유실 버그를 겪었고, 화살표 함수로 바꿔 해결했다. 이후 콜백에서는 화살표 함수, 객체 메서드에서는 일반 함수를 쓰는 패턴을 팀 컨벤션으로 정리했다.

---

## 4. ❓ 스스로 묻고 답하기

### 기본 질문

- **Q1. `this`란 무엇인가요?**
    
    > A: `this`는 함수가 호출되는 방식에 따라 바인딩되는 값입니다. 자바스크립트에서 `this` 는 함수가 정의된 위치가 아니라 **호출 방식에 따라 동적으로** 결정됩니다. 예를 들어 객체의 메서드로 호출하면 그 객체가 `this`가 되고, 일반 함수 호출에서는 전역 객체가 `this`가 됩니다.
    > 
- **Q2. `call`, `apply`, `bind`의 차이점은 무엇인가요?**
    
    > A: 세 가지 모두 `this`를 명시적으로 지정하는 방법이지만, 실행 방식에 차이가 있습니다. `call` 과 `apply` 는 함수를 **즉시 호출**하고, `bind` 는 `this` 가 고정된 **새 함수를 반환**합니다. `call` 은 인자를 쉼표로 나열하고, `apply` 는 배열로 전달합니다. 이벤트 핸들러처럼 나중에 호출되는 경우에는 `bind` 를 씁니다.
    > 
- **Q3. 화살표 함수와 일반 함수의 `this` 차이를 설명해주세요.**
    
    > A: 일반 함수는 호출 방식에 따라 `this` 가 동적으로 결정되지만, 화살표 함수는 자신만의 `this` 를 갖지 않고 선언된 스코프의 `this` 를 정적으로 캡처합니다. 따라서 `call`, `apply`, `bind` 로 화살표 함수의 `this` 를 변경하는 것은 불가능합니다.
    > 

---

### 심화 질문

```jsx
const obj = {
  name: '세비',
  getName: function () {
    const inner = function () {
      return this.name;
    };
    return inner();
  },
};
console.log(obj.getName());
```

- **Q4. 다음 코드의 출력값은 무엇이고 왜 그런가요?**
    
    > A: `obj.getName()`을 호출하면 getName 내부의 `this`는 암묵적 바인딩으로 `obj`가 됩니다. 하지만 inner 함수는 객체를 통해 호출된 것이 아니라 단순히 `inner()` 형태로 호출되므로 기본 바인딩이 적용됩니다. 따라서 inner 내부의 `this`는 전역 객체(window) 또는 strict mode에서는 `undefined`가 됩니다. 이 문제를 해결하려면 화살표 함수를 사용해 외부 this를 캡처하거나 bind를 사용해 this를 명시적으로 바인딩할 수 있습니다.
    > 
- **Q5. React 클래스 컴포넌트에서 이벤트 핸들러에 `bind`를 하는 이유는 무엇인가요?**
    
    > A: 클래스 메서드를 JSX의 `onClick={this.handleClick}` 형태로 전달하면, 실제 클릭 시 함수는 객체 없이 단독으로 호출됩니다. 이 경우 strict mode가 기본인 React에서 `this` 는 `undefined` 가 되어 `this.setState` 등을 호출할 수 없습니다. 생성자에서 `this.handleClick = this.handleClick.bind(this)` 를 해주면 `this`가 컴포넌트 인스턴스로 고정됩니다. 현대적인 방식으로는 화살표 함수 클래스 필드(`handleClick = () => {}`)를 사용하면 `bind` 없이도 동일한 효과를 얻을 수 있습니다.
    > 

---

### 🧨 헷갈리기 쉬운 질문

- **Q6. 화살표 함수를 객체의 메서드로 사용하면 어떤 문제가 생기나요?**
    
    > A: 화살표 함수는 자신만의 `this`가 없으므로, 객체 메서드로 정의하면 `this`가 해당 객체가 아닌 **외부 스코프의 `this`(보통 전역 객체)**를 가리킵니다. 때문에 객체 메서드에는 반드시 **일반 함수 또는 메서드 단축 표기법**(`greet() {}`)을 사용해야 합니다.
    > 
    
    ```jsx
    const user = {
      name: '세비',
      greet: () => {
        console.log(this.name); // undefined (전역 this)
      },
    };
    user.greet(); // undefined ❌
    ```
    

---

## 5. 🛠️ 실습 / 직접 구현해보기

### 실습 목표

- [ ]  4가지 바인딩 규칙을 각각 코드로 확인해보기 (기본 / 암시적 / 명시적 / `new`)
- [ ]  `setTimeout` 콜백에서 발생하는 `this` 유실 문제를 확인하고 화살표 함수로 해결하기
- [ ]  이벤트 핸들러에서 `bind`로 `this`를 원하는 객체에 고정하기

### 실습 코드

```jsx
// 1️⃣ 4가지 바인딩 규칙 확인
function printBrand() {
  console.log('브랜드:', this?.brand || '없음 (전역/undefined)');
}

const kia = { brand: '기아', printBrand };
const benz = { brand: '벤츠' };

// 기본 바인딩
printBrand(); // 결과 → 없음 (전역 객체 또는 undefined)

// 암시적 바인딩
kia.printBrand(); // 결과 → 기아

// 명시적 바인딩
printBrand.call(benz); // 결과 → 벤츠

// new 바인딩
function Car(brand) {
  this.brand = brand;
}
const myCar = new Car('현대');
console.log(myCar.brand); // 결과 → 현대

// 2️⃣ 콜백에서 this 유실 버그 → 화살표 함수로 수정
const user = {
  name: '신입개발자',

  welcome() {
    // ❌ 일반 함수 → this 유실
    setTimeout(function () {
      console.log('반가워요, ' + this.name);
    }, 1000);

    // ✅ 화살표 함수 → 외부 this 유지
    setTimeout(() => {
      console.log('반가워요, ' + this.name);
    }, 1000);
  },
};

user.welcome();

// 3️⃣ 이벤트 핸들러에서 bind 사용
const profile = {
  name: '김개발',

  sayName() {
    alert('제 이름은 ' + this.name + '입니다.');
  },
};

const btn = document.querySelector('#nameBtn');

// ❌ this = button 요소
// btn.addEventListener('click', profile.sayName);

// ✅ bind로 this를 profile에 고정
const boundSayName = profile.sayName.bind(profile);

btn.addEventListener('click', boundSayName);
```

### 실습하면서 깨달은 점

- 메서드 안의 콜백은 별도의 함수 호출이므로 `this`가 쉽게 유실될 수 있다.
- 화살표 함수는 `this`를 새로 만들지 않고 외부 스코프의 `this`를 그대로 사용한다.
- `bind`는 `this`를 고정한 새로운 함수를 반환하므로 이벤트 핸들러 등에서 유용하다.

---

## 6. 📝 나만의 요약 노트

### 오늘 이 주제에서 가장 중요한 것 3가지

1. `this`는 **호출 방식**에 따라 결정된다 (정의 위치가 아님)
2. 화살표 함수는 `this`를 가지지 않고, **선언 시점 외부 스코프의 `this`를 캡처**한다
3. `call`/`apply`는 즉시 실행, `bind`는 나중에 쓸 새 함수를 만든다

### 헷갈렸던 부분 & 해결

| 헷갈린 것 | 알고 보니 |
| --- | --- |
| `setTimeout(obj.method)`을 넘겨도 `this`가 obj일 줄 알았다 | 함수 참조만 전달되면 **객체 컨텍스트가 사라져 기본 바인딩**이 된다 |
| bind를 두 번 하면 마지막 것으로 덮어쓸 줄 알았다 | 첫 번째 bind가 영구적으로 고정되어, 재바인딩이 불가능하다 |
| 객체 메서드에서도 화살표 함수 쓰면 어떻게 되나? | 객체 메서드의 화살표 함수는 this가 전역을 가리켜 오히려 버그를 유발한다 |

---

## 7. 📚 참고 자료

| 자료 | 링크 | 추천 이유 |
| --- | --- | --- |
| MDN - this | [https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/this](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/this) | this의 모든 케이스를 정리한 공식 문서 |
| MDN - Function.prototype.bind() | [https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Function/bind](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) | bind 동작 원리와 예제 |
| [javascript.info](http://javascript.info/) - 함수 바인딩 | [https://ko.javascript.info/bind](https://ko.javascript.info/bind) | 한국어로 읽기 쉬운 실용적 설명 |
