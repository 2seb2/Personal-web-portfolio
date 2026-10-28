---
id: "article7"
title: "React, Vue, Next.js 등장 배경과 비교분석"
kinds: ["스터디"]
stacks: ["Next.js", "React", "Vue"]
date: "2025"   # TODO(세비): 실제 날짜 확인
excerpt: "jQuery는 2006년에 등장한 JavaScript 라이브러리. 당시 웹 개발의 가장 큰 문제는 브라우저마다 JavaScript 동작이 달랐다..."
---

## 프론트엔드 프레임워크의 등장 배경

### jQuery란?

jQuery는 2006년에 등장한 JavaScript 라이브러리.

당시 웹 개발의 가장 큰 문제는 브라우저마다 JavaScript 동작이 달랐다는 점!

```jsx
// 익스플로러
element.attachEvent('click',function() { ... });

// 크롬
element.addEventListener('click',function() { ... });

// jQuery -> 모든 브라우저에서 동일하게 작동
$('element').on('click', function() { ... })
```

jQuery는 브라우저 호환성 문제를 해결하고, 복잡한 DOM조작을 간단하게 만들어줌! 

한 때 전체 웹사이트의 80% 이상이 jQuery를 사용할 정도로 지배적이었음.

### jQuery 시대의 한계

#### DOM 직접 조작 방식의 문제

jQuery는 DOM을 직접 조작하는 명령형 프로그래밍 방식

```jsx
// 사용자 정보를 화면에 표시
var user = { name: '세비', email: 'Jerry@naver.com', age: 25 };

$('#username').text(user.name);
$('#email').text(user.email);
$('#age').text(user.age);

// 사용자 정보가 변경되면?
function updateUser(newName) {
	user.name = newName;
	$('#username').text(user.name); // 또 직접 업데이트 해줘야 함‼️
}
```

**이 방식은:**

- 어디서 무얼 업데이트 해야하는지 추적이 어려워짐
- 상태와 UI가 불일치 하는 버그가 많이 발생할 수 있음
- 코드 중복이나 복잡도가 올라감

**예를 들어, 쇼핑몰 장바구니 화면에서 아이템 수가 여러 곳에 표시된다면?**

→ 모든 곳을 일일히 찾아서 업데이트 해야 함! 하나라도 빼먹는다면 화면과 실제 데이터가 달라짐!

#### MVC(Model View Controller) 패턴의 양방향 데이터 플로우 문제

**Facebook과 같은 대규모 서비스에서는 아래와 같은 예시의 문제가 발생할 수 있음:**

- 알림 아이콘에 숫자 1이 표시됨. 
(안 읽은 메시지가 존재한다고 표시된 것)
- 클릭해서 확인하면 실제로는 읽지 않은 메시지가 없음.
- 하지만 알림 숫자는 계속 표시됨.

**원인:** 

Model(데이터)와 View(화면)이 서로를 업데이트하는 양방향 흐름 때문!

```jsx
Model ↔ View ↔ Model ↔ View
(서로가 서로를 업데이트할 수 있어 복잡해질 수 있음)

// 예시:
메시지 읽음 표시(View) 
→ 읽지 않은 개수 감소(Model)
→ 알림 배지 업데이트(View)
→ 다른 컴포넌트도 같은 Model 참조
→ 동기화 실패 시 불일치 발생

// 어디서 상태가 변경됐는지 추적 불가능..
```

### SPA(Single Page Application)의 등장

Gmail이나 Google Maps같은 어플리케이션이 등장하면서 앱처럼 매끄러운 웹!에 대한 요구가 커졌음.

#### 기존 웹사이트 방식

```jsx
사용자가 링크 클릭
→ 서버에 새 HTML 요청
→ 서버가 새로운 HTML 페이지 전송
→ 브라우저가 페이지 전체를 새로 그림

// 이 과정에서 깜빡임 발생..!
```

#### SPA 방식

```jsx
첫 접속 시 HTML, CSS, JavaScript 한 번만 로드
→ 이후 페이지 이동은 JavaScript로 처리
→ 필요한 데이터만 서버로 가져옴
→ 화면의 일부만 바꿈

// 새로고침이 없음
```

**SPA의 장점:**

- 빠른 화면 전환
- 서버 부담 감소
- 더 나은 사용자 경험

**SPA의 과제:**

- 복잡한 상태 관리
- 라우팅 처리
- SEO 문제

---

## 프레임워크가 해결하려던 문제들

### 1. 선언적 UI 작성

**기존의 명령형:**

어떻게 화면을 바꿀지 명령

```jsx
function updateDog(isHappy) {
  const dog = document.getElementById('dog');

  if (isHappy) {
    dog.textContent = '🐶 꼬리 흔듦';
  } else {
    dog.textContent = '🐶 축 처짐';
  }
```

**새로운 선언형:**

무엇을 보여줄지만 선언

```jsx
function Dog({ isHappy }) {
  return <div>{isHappy ? '🐶 꼬리 흔듦' : '🐶 축 처짐'}</div>;
}
```

선언적 방식은 “현재 데이터가 이렇다면, 화면은 이렇게 보여야한다” 만 정의!

DOM을 어떻게 조작할지는 프레임워크가 처리하도록!

### 2. 컴포넌트 기반 개발

컴포넌트는 화면을 구성하는 작은 UI 단위로,

버튼, 카드처럼 한 역할만 하도록 만들어서 여러 화면에서 다시 쓰고, 필요할 때 그 부분만 수정할 수 있음.

```jsx
// 재사용 가능한 버튼 컴포넌트 예시
<Button variant="primary" onClick={handleSubmit}>제출</Button>
<Button variant="danger" onClick={handleDelete}>삭제</Button>

```

### 3. 단방향 데이터 플로우

```jsx
상태 → 화면 → 사용자이벤트 발생!!
→  상태 업데이트 → 화면 자동 업데이트
```

**데이터가 한 방향으로만 흐른다면:**

- 추적이 쉬움
- 버그를 찾기 쉬움
- 코드의 동작을 예측하기 쉬움

### 4. Virtual DOM을 통한 성능 최적화

**실제 DOM 조작은 느림:**

- 브라우저가 레이아웃을 다시 계산해야함
- 화면을 다시 그려야 함
- 매우 느리고 무거운 작업

**Virtual DOM:**

- 메모리에 가상의 DOM 트리 생성
- 변경 전후를 비교
- 실제 DOM에는 변경된 부분만 반영

개발자는 전체를 다시 그린다고 생각하며 코드를 작성하지만, 실제로는 변경된 부분만 효율적으로 업데이트됨!

---

## React

### 등장 배경

Facebook의 엔지니어 JordanWalke가 2011년 전후 Ads/News Feed 등 점점 복잡해지는 UI를 유지보수 하면서 겪은 문제를 해결하기 위해 시작한 프로젝트가 React!

Facebook Ads 앱이 기능과 팀 규모가 커지면서, 코드 변경이 여러 곳에 연쇄적으로 영향을 미치는 복잡성 때문에 UI 유지보수가 점점 느려지고 예측하기 어려워졌고, 이를 개선하기 위해 새로운 UI 아키텍처가 필요했음!!

### 철학

“UI를 직접 하나하나 고치는 대신, 현재 상태를 입력으로 해서 UI를 계산하는 함수처럼 생각하자”

```jsx
function UI(state) {
  if (state.unreadCount > 0) {
    return <Badge>{state.unreadCount}</Badge>;
  } else {
    return null;
  }
}
```

- 이런 식으로 “이 상태일 때는 이렇게 보여라” 만 적어 두면, React가 알아서 DOM을 업데이트한다는 것이 핵심 아이디어.
- React 공식 문서는 이를 “상태에 따라 다른 UI를 선언적으로 기술하고, 데이터가 바뀌면 React가 필요한 부분만 다시 렌더링한다”라고 기술함.

### 핵심 특징

#### 1. JSX와 컴포넌트

JSX는 JavaScript 안에서 HTML을 작성하는 문법

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}

function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.completed ? '✔️' : '🔘'} {todo.text}
        </li>
      ))}
    </ul>
  );
}

```

#### 2. Virtual DOM과 성능

매번 전체 화면을 다시 계산하면 느려질 수 있으니, React는 실제 DOM 대신 Virtual DOM이라는 가벼운 트리 구조를 메모리 안에 만들었음!

```jsx
setTodo([...todos, { id: 3, text: '드라마보기'}]);

// 상태 변경이 일어나면?
// → 새 Virtual DOM 생성
// → 이전 Virtual DOM 과 비교
//   (ex. "li 두 개는 그대로, li 하나가 추가되었구나!")
// → 달라진 부분만 실제 DOM에 반영
```

#### 3. 단방향 데이터 바인딩

```jsx
function SearchBox() {
  const [keyword, setKeyword] = useState('');

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <p>검색어: {keyword}</p>
    </div>
  );
}

```

**데이터 흐름을 보면:**

1. `keyword` 상태가 `input`에 표시됨
2. 사용자가 입력하면 `onChange` 발생
3. `setKeyword` 로 상태 업데이트
4. 화면 자동 업데이트

React는 기본적으로 단방향 데이터 플로우를 사용함.

상위 컴포넌트 → 하위 컴포넌트 방향으로 데이터가 흘러가고, 
상태변경은 setState / useState 같은 명시적인 함수로만 가능!

#### 4. Hooks의 등장 배경

**React 팀이 Hooks를 도입할 때 공식적으로 말한 문제는 크게 세 가지:**

1. 클래스를 이해하는 것이 어려움
    - `increase` 안에서 `this`를 쓰는데,
    - `this`가 제대로 가리키게 만들려면 `constructor`에서 `bind`를 해 줘야 함.
    - 이걸 빼먹으면 `this`가 `undefined`가 되어 에러가 나고, 초보자 입장에서는 “왜 안 되지?”가 너무 어려움…!
    
    ```jsx
    class Counter extends React.Component {
      constructor(props) {
        super(props);
        this.state = { count: 0 };
    
        // 이 줄을 빼먹으면 에러 난다..! 😇
        this.increase = this.increase.bind(this);
      }
    
      increase() {
        this.setState({ count: this.state.count + 1 });
      }
    
      render() {
        return (
          <button onClick={this.increase}>
            {this.state.count}
          </button>
        );
      }
    }
    ```
    
- 큰 컴포넌트 안에서 서로 관련된 코드가 여기저기 흩어짐
    - 문서 title을 count에 맞춰 바꾸는 기능을 이해하려면 `componentDidMount`와 `componentDidUpdate`를 둘다 봐야함!
    - 한 기능이 두 군데로 쪼개져 있기 때문!
    
    ```jsx
    class Counter extends React.Component {
      state = { count: 0 };
    
      componentDidMount() {
        document.title = `count: ${this.state.count}`;
      }
    
      componentDidUpdate() {
        document.title = `count: ${this.state.count}`;
      }
    
      increase = () => {
        this.setState({ count: this.state.count + 1 });
      };
    
      render() {
        return (
          <button onClick={this.increase}>
            {this.state.count}
          </button>
        );
      }
    }
    
    ```
    
- 코드 재사용이 어려움

**Hooks로 개선:**

React팀은 공식 블로그에서 “로직 재사용과 코드 구조를 개선하기 위해” Hooks를 도입했다고 밝힘.

- `this` 를 신경 쓸 필요 없음
    - 함수 안에서 그냥 변수와 함수만 쓰면 되기 때문에, `this` 를 신경 쓸 일이 없어짐.
    
    ```jsx
    function Counter() {
      const [count, setCount] = useState(0);
    
      function handleClick() {
        setCount(count + 1); // this 없어도 됨!!
      }
    
      return (
        <button onClick={handleClick}>
          클릭: {count}
        </button>
      );
    }
    ```
    
- 관련 로직을 한 곳에 모을 수 있음
    - 제목을 바꾸는 로직이 useEffect 한 곳에만 있어서, 이 블록만 보면 기능이 어떻게 동작하는지 바로 이해가능하게 됨.
    
    ```jsx
    function Counter() {
      const [count, setCount] = useState(0);
    
      useEffect(() => {
        document.title = `count: ${count}`;
      }, [count]);
    
      return (
        <button onClick={() => setCount(count + 1)}>
          {count}
        </button>
      );
    }
    
    ```
    
- 커스텀 Hook으로 뺄 수 있음

### 장점

#### 1. 거대한 생태계

- React는 2013년 JSConf US에서 오픈소스로 공개된 이후 가장 인기 있는 프론트엔드 기술 중 하나가 되면서, React 관련 npm 패키지가 수십만 개 수준으로 집계될 만큼 생태계가 거대해짐.
- 실무용 도구가 React를 중심으로 발전해 웬만한 요구사항은 React용 라이브러리로도 다 채울 수 있을 정도!
    - UI : MUI 등
    - 전역 상태 관리 : Redux, Zustand, Jotai, Recoil 등
    - 라우팅, 프레임워크: React Router 등
- 대부분의 UI 라이브러리, 상태 관리 도구가 React를 우선 지원하는 경우가 많음

#### 2. 유연성

- React는 UI 라이브러리로, 라우팅・전역 상태・빌드 설정 등은 별도 도구로 해결하는 것이 일반적인 사용 방식
- 때문에 별도 도구를 프로젝트 특성에 맞게 고를 수 있어, 새로운 라이브러리가 나오면 일부만 교체하기 쉬움

#### 3. React Native

- React 지식으로 모바일 앱을 만들 수 있음
    - React를 한 번 익혀두면 웹만이 아니라 IOS/Android 용 모바일 네이티브 UI도 같은 스타일로 만들어볼 수 있음.

### 단점

#### 1. 러닝 커브

- 개념이 한번에 많이 나옴
- JSX 문법부터 컴포넌트 구조, 상태 관리 방식까지 여러 개념을 동시에 이해해야 해서 학습 부담이 큼
- 계속해서 버전 업데이트가 이뤄지고 있어서 새로운 내용들이 계속 등장!

#### 2. SEO 구현의 어려움

- 기본적으로 React는 클라이언트 사이드 렌더링(CSR)을 사용하기 때문에 SEO 성능이 낮음

**CSR의 SEO문제:**

1. 검색 엔진 봇이 접속하면 빈 HTML만 보임
2. JavaScript 실행 후에야 내용이 채워짐
3. 일부 검색 엔진은 JavaScript 실행을 제대로 못함
4. 결과: 검색 결과에 제대로 노출 안 됨

#### 3. 의존성 문제

- React의 다양한 라이브러리들은 종종 서로 다른 버전 호환성을 요구함
- 프로젝트를 업데이트 하거나 확장할 때 의존성 충돌이 발생할 수 있음

---

## Vue

### 등장 배경

Vue는 Google에서 일하던 Evan You가 2013년-2014년 초 사이에 개발한 프레임워크.

Evan You는 Google에서 여러 UI 프로토타입을 빠르게 만드는 업무를 하며 AngularJS를 사용했음. Angular가 가진 데이터 바인딩과 DOM 업데이트 방식 자체는 마음에 들었지만, 프로토타입을 빠르게 만들기에는 너무 무겁고 복잡하다고 느꼈음.

> “내가 Angular에서 정말 좋았던 부분만 뽑아낸 다음, 추가적인 모든 개념을 동반하지 않고 무언가를 정말 가볍게 만들어보면 어떨까? 하고 생각했습니다.” - Evan You 인터뷰
> 

이에 Evan You는 이런 생각을 가짐:

- Angular의 핵심 아이디어는 유지하되
- 대규모 프레임워크가 요구하는 모든 개념을 함께 학습하지 않아도
- 더 가볍고 단순한 형태로 사용할 수 있는 대안을 만들 수 없을까?

이러한 생각을 바탕으로 Angular에서 본인이 유용하다고 느낀 부분만을 추려 보다 단순한 UI 프레임워크를 실험적으로 개발했고, 그 결과물이 2014년 2월 공개된 Vue..!

Vue는 대기업의 지원 없이 순수하게 커뮤니티 주도로 성장한 독특한 사례로, Evan You는 2016년부터 Patreon을 통한 크라우드펀딩으로 Vue를 풀타임으로 개발하기 시작했음.

+Vite 만든 사람..! = Vue 만든 사람 = Evan You

### 철학

“점진적 프레임워크(Progressive Framework)”

Vue의 공식 문서에서는 “당신과 함께 성장하고 당신의 필요에 맞춰 적응할 수 있는 프레임워크”라고 기술되어이 있기도 함.

**점진적이라는 것의 의미:**

- 기존 프로젝트의 일부분에만 Vue를 추가할 수도 있음
- 작게 시작해서 점점 확장 가능
- 필요한 만큼만 사용할 수 있음

이런 접근 방식은 처음부터 모든 기능을 포함한 단일 구조의 프레임워크를 제공하는 Angular와 의도적으로 다른 선택..!

### 핵심 특징

#### 1. HTML 기반 템플릿 문법

- Vue는 JSX 대신 HTML과 매우 유사한 템플릿 문법을 사용함.
- 기존 HTML에 익숙한 개발자나 디자이너도 비교적 쉽게 접근 가능함.

```html
<template>
  <h1>{{ message }}</h1>
</template>
```

#### 2. 양방향 데이터 바인딩(`v-model`)

폼 입력과 데이터 상태를 자동으로 동기화하는 양방향 데이터 바인딩을 공식적으로 지원함.

- 사용자가 입력 → 데이터 자동 변경
- 데이터 변경 → 화면 자동 반영

```html
<input v-model="message" />
```

- 단순한 입력폼을 빠르게 구현할 때 매우 직관적임!

#### 3. 단일 파일 컴포넌트

Vue는 파일 하나에 템플릿, 로직, 스타일을 명확히 구분된 블록으로 관리하는 방식을 제공함.

```jsx
<template>...</template>
<script>...</script>
<style scoped>...</style>

// 이렇게 하나의 파일에 관리
```

- 파일은 하나지만 역할을 분리한 구조기에, 컴포넌트 단위의 관리와 유지보수를 쉽게 만들어줌.

#### 4. 반응형 시스템

- Vue는 데이터가 변경되면 DOM이 자동으로 갱신되는 반응적인 시스템을 핵심 기능으로 제공!
- 덕분에 개발자는 언제 DOM을 업데이트 해야하는지 신경쓰지 않아도 됨.

#### 5. Composition API (Vue 3)

CompositionAPI는 로직 재사용과 코드 구조 개선을 목표로 추가된 기능임.

**React Hooks와 유사한 점:**

- 관련 로직을 기능 단위로 묶을 수 있고
- 코드 흐름을 더 명확하게 만들 수 있음

**기존 Options API:**

```jsx
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('컴포넌트 마운트됨')
  }
}
</script>
```

**새로운 Composition API:**

```jsx
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('컴포넌트 마운트됨')
})
</script>
```

### 장점

#### 1. 낮은 러닝 커브

- Vue는 HTML, CSS, JavaScript만 알면 시작할 수 있음.
- JSX를 배울 필요가 없고, 템플릿이 HTML과 유사해서 디자이너나 백엔드 개발자도 이해하기 쉬운 편

#### 2. 점진적 도입 가능

- 기존 프로젝트의 일부분에만 Vue를 추가할 수 있음
- 그럼 전체를 다시 작성할 필요 없이 한 페이지의 일부 폼부터 시작해서 점차 확장도 가능

#### 3. 성능

- 번들 크기가 작아(Vue3 기준 코어는 약 20KB) 초기 로딩 속도가 빠름

### 단점

#### 1. React에 비해 작은 커뮤니티

- React(Facebook/Meta)나 Angular(Google)처럼 대기업의 지원이 없음
- 채용 시장에서 React 개발자 수요가 더 많음

#### 2. 유연성의 양면성

- 너무 유연해서 프로젝트마다 구조가 다를 수 있음
- Options API와 Composition API 두 가지 스타일이 공존하기 때문에 혼란이 올 수도 있음
- 팀 내에서 코딩 스타일에 대한 합의가 필요

---

## Next.js

### 등장 배경

2016년 Vercel의 CEO Guillermo Rauch가 개발한 React 기반 풀스택 프레임워크임.

Guillermo Rauch는 Socket.IO 등 영향력 있는 오픈소스 프로젝트를 만든 개발자로, 웹 어플리케이션을 실제 서비스로 배포하는 과정이 지나치게 복잡하다는 생각을 가지고 있었음.

**생각한 문제들:**

- React 자체는 UI를 만드는 데 매우 뛰어나지만
- 실제 서비스에 배포하려면 개발자가 너무 많은 결정을 직접 내려야 함
    - 라우팅 구성
    - 서버 사이드 렌더링 구현
    - SEO
    - 빌드 설정
    - 배포 환경 구성

React는 UI라이브러리로서의 역할은 잘 해냈지만, 실제 서비스를 만들기 위해 필요한 전반적인 개발 환경과 구조는 개발자가 직접 구성해야 했음. 

**당시 React만으로 SPA를 구성할 경우:**

- 서버 사이드 렌더링은 직접 구현해야 했음
- SEO를 고려한 HTML 사전 렌더링은 매우 복잡!
- 코드 스플리팅과 성능 최적화도 개발자 몫

Google이나 Meta에서도 서버 렌더링이나 성능 최적화와 같은 기술을 오픈소스로 공개하긴 했지만,

이를 실제 서비스에 적용하려면 개발자가 설정을 직접 구성하고 구조를 이해해야 했음.

### 철학

Guillermo는 인터뷰에서 "Google Docs가 워드 프로세싱을, Figma가 디자인을 단순화한 것처럼, Next.js는 웹 개발을 단순화하려 했다"고 설명함.

**그래서 Next.js는:**

- 복잡한 설정 없이 바로 시작 가능하도록 함.
- 폴더 구조와 파일 이름을 기준으로 동작하도록 설계
- 성능과 SEO에 유리한 방식을 기본 동작으로 채택..!

### 핵심 특징

#### 1. 하이브리드 렌더링 방식

Next.js의 가장 큰 특징은 페이지별로 다른 렌더링 방식을 선택할 수 있다는 것!

**정적 생성 (Static Site Generation, SSG):**

→ 미리 만들어 두고 바로 보여주는 방식

- 빌드할 때 HTML 파일을 미리 만들어 둠
- 사용자가 요청하면 이미 만들어진 HTML을 바로 전달함.
- 블로그, 마케팅 페이지처럼 내용이 자주 바뀌지 않는 페이지에 적합함.

```jsx
// 빌드 시 HTML을 미리 생성
export async function getStaticProps({ params }) {
  const post = await getPostById(params.id)
  return { props: { post } }
}
```

**서버에서 렌더링 (Server-Side Rendering, SSR):**

→ 요청이 올 때마다 서버에서 새로 만들어주는 방식

- 사용자가 페이지를 요청할 때마다 서버에서 HTML을 새로 생성!
- 항상 최신 데이터를 보여줄 수 있음.
- 로그인 후 보여주는 페이지, 실시간으로 바뀌는 데이터를 보여주는 페이지에 적합함.

```jsx
// 요청할 때마다 서버에서 HTML 생성
export async function getServerSideProps(context) {
  const data = await fetchUserData()
  return { props: { data } }
}
```

**필요할 때만 다시 생성 (Incremental Static Regeneration, ISR):**

→ 기본은 정적 페이지, 필요할 때만 다시 만드는 방식

- 기본적으로는 빌드 시에 HTML을 미리 만들어 둠.
- 설정한 시간이 지나면 백그라운드에서 페이지를 새로 생성함.
- 사용자는 항상 빠른 페이지를 보게 됨.
- 상품 목록이나 뉴스페이지처럼 업데이트 되는 콘텐츠가 있는 페이지에 적합함.

```jsx
export async function getStaticProps() {
  return {
    props: { products },
    revalidate: 60 // 60초마다 백그라운드에서 새로 생성
  }
}

```

**브라우저에서 렌더링 (Client-Side Rendering, CSR):**

→ 브라우저에서 JavaScript로 화면을 만드는 방식

- 일반적인 React 방식임.
- 페이지를 로드한 후 브라우저에서 JavaScript로 내용을 채움.
- SEO가 필요 없는 개인 설정 페이지, 대시보드 등에 적합함.

#### 2. 파일 구조가 곧 URL

- Next.js에서는 파일을 어디에 두느냐가 주소(URL)를 결정
- 즉, 라우터를 따로 설정하지 않아도 `pages` 폴더 안의 파일 구조가 그대로 URL이 되는 구조!

```bash
pages/
  index.js        → /
  about.js        → /about
  blog/index.js   → /blog
  blog/[slug].js  → /blog/글-id
```

#### 3. API를 같은 프로젝트에서 만들 수 있음

- 화면만 만드는 도구가 아니라, 간단한 백엔드 API도 함께 만들 수 있도록 지원.

```jsx
// /api/users 로 접근 가능
export default function handler(req, res) {
  if (req.method === 'POST') {
    res.status(200).json({ name: '홍길동' })
  }
}
```

#### 4. 필요한 코드만 자동으로 불러옴

- 기본적으로 페이지마다 필요한 JavaScript만 로드함.
- 무거운 컴포넌트는 필요할 때만 불러올 수도 있음.

```jsx
const HeavyComponent = dynamic(() => import('../components/HeavyComponent'))
```

**이렇게 되면:**

- 처음 페이지를 열 때 불러오는 코드양이 줄어들고, 초기 로딩 속도가 빨라짐
- 개발자가 직접 코드 분할을 설계할 필요가 없음.

#### 5. 이미지 최적화를 자동으로 처리함

- Next.js의 `Image` 컴포넌트는 이미지를 그냥 보여주는 게 아니라, 웹에 맞게 자동으로 최적화함.

```jsx
<Image
  src="/profile.jpg"
  alt="프로필"
  width={500}
  height={500}
/>
```

**자동으로 처리되는 것들:**

- 화면 크기에 맞는 이미지 제공
- 필요할 때만 로딩 (지연 로딩)
- WebP 같은 웹에 효율적인 포맷 사용

→ 개발자는 이미지 성능을 따로 신경쓰지 않아도 됨.

### 장점

#### 1. 검색 엔진에 잘 노출됨(SEO)

- 서버에서 완성된 HTML을 보내주기 때문에
- 검색 엔진이 내용을 바로 읽을 수 있음.
- 페이지별 메타 태그 설정도 쉬움.

→ React의 기본 CSR 방식에서 어려웠던 SEO 문제를 해결함.

#### 2. 빠른 성능

- 정적 페이지는 CDN에서 바로 제공됨
- 코드가 자동으로 나뉘어 로딩됨
- 이미지가 자동으로 최적화됨

#### 3. 개발할 때 편함

- 코드 수정 시 바로 화면에 반영됨
- TypeScript를 기본으로 지원함
- 복잡한 설정 없이 바로 시작 가능
- 공식 문서와 예제가 잘 정리되어 있음

#### 4. 프론트엔드와 백엔드를 함께 개발 가능

- 화면과 API를 하나의 프로젝트에서 관리
- 간단한 백엔드 로직을 빠르게 구현 가능
- 서버리스 환경으로 자동 확장됨

### 단점

#### 1. Vercel 의존성

- Next.js는 Vercel에서 만든 프레임워크라서 일부 최신 기능은 Vercel에 배포했을 때 가장 편하게 사용할 수 있음.
- AWS, GCP 같은 다른 환경에서도 배포는 가능하지만, 설정을 직접 더 해줘야 하는 경우가 있음.

→ Vercel을 쓰는 게 가장 수월한 구조

#### 2. 러닝 커브

- React를 먼저 알아야 함
- 정적 생성, 서버 렌더링 등 여러 렌더링 방식의 차이를 이해해야 함
- `getStaticProps`, `getServerSideProps` 등 Next.js만의 함수들을 배워야 함

#### 3. 단순한 사이트에는 과한 선택

- 간단한 정적 사이트에는 불필요하게 복잡할 수 있음.
- 프레임워크가 정해놓은 방식을 벗어나려면 어려워질 수 있음.

#### 4. 서버 비용이 발생할 수 있음

**서버 사이드 렌더링을 많이 사용하는 경우:**

- 요청마다 서버에서 처리가 필요
- 정적 페이지에 비해 서버 비용이 더 들 수 있음
- Vercel의 서버리스 함수에는 무료 사용량 제한이 있음

→ 트래픽이 많은 서비스에서는 비용을 함께 고려해야 함.

---

## 최종 비교 분석

| 구분 | React | Vue | Next.js |
| --- | --- | --- | --- |
| 성격 | UI 라이브러리 | 프레임워크 | React 기반 풀스택 프레임워크 |
| 최초 공개 | 2013년 | 2014년 | 2016년 |
| 주요 주체 | Meta (Facebook) | Evan You + 커뮤니티 | Vercel |
| 데이터 흐름 | 단방향 | 양방향 (`v-model`) | 단방향 (React 기반) |
| 템플릿 | JSX | HTML 기반 템플릿 | JSX |
| SSR 지원 | 별도 설정 필요 | Nuxt 사용 | 기본 내장 |
| GitHub Stars
(대략적인 수준) | 약 242K | 약 52K | 약 137K |
| npm 주간 다운로드
(대략적인 수준) | 약 32M | 약 6.4M | 약 8M |

*출처: GitHub, npm 관련 정보는 2025년 기준 GitHub, npm trends의 자료

### 번들 크기 비교

**번들 크기란:**

웹사이트를 열 때, 브라우저가 다운로드해야 하는 JavaScript 파일의 크기. 작을수록 페이지가 빨리 뜸!

때문에 번들 크기는 초기 로딩 속도에 직접적인 영향을 미치기에 중요 요소!

- Vue → React → Next.js 순

#### Vue가 가장 가벼운 이유

- Vue는 처음부터 "가볍게"를 목표로 설계됨.

#### React가 Vue보다 큰 이유

- React는 `react`와 `react-dom` 두 개의 패키지를 같이 써야 함
- `react`는 컴포넌트 로직 담당 (~2KB)
- `react-dom`은 실제 DOM 조작 담당 (~40KB) → 이게 대부분을 차지함
- React는 웹 외에도 React Native 같은 다른 환경을 지원하려고 패키지를 분리한 구조라서 이렇게 됨

#### Next.js가 가장 큰 이유

- Next.js는 React 위에 프레임워크 기능이 추가된 구조이기 때문에 크기가 큼.

> 실제 앱 크기는 어떤 라이브러리를 쓰냐에 따라 많이 달라져서 참고 정도만!
> 

### 렌더링 동작 원리

#### React

```jsx
상태 변경 
→ 새 Virtual DOM 생성 
→ 이전 Virtual DOM과 비교
→ 차이점만 실제 DOM에 반영
```

- 상태가 바뀌면 해당 컴포넌트와 하위 컴포넌트를 전부 다시 렌더링함
- 그 다음 Virtual DOM끼리 비교해서 실제로 바뀐 부분만 DOM에 적용
- 불필요한 리렌더링을 막으려면 `React.memo`, `useMemo`, `useCallback` 같은 최적화를 개발자가 직접 해줘야 함

#### Vue

```jsx
데이터 변경 
→ Proxy가 자동 감지 
→ 해당 데이터를 쓰는 컴포넌트만 리렌더링 
→ Virtual DOM 비교 → DOM 반영
```

- JavaScript의 `Proxy`를 사용해서 어떤 데이터가 어디서 쓰이는지 자동으로 추적함
- 그래서 데이터가 바뀌면 그 데이터를 실제로 사용하는 컴포넌트만 다시 렌더링됨
- 개발자가 따로 최적화 코드를 안 써도 됨

#### Next.js

React의 렌더링 방식을 그대로 쓰면서, 언제 렌더링할지를 선택할 수 있게 함.

```jsx
# CSR
브라우저에서 JS로 렌더링

# SSR
요청마다 서버에서 HTML 생성

# SSG
빌드할 때 미리 HTML 생성

# ISR
SSG + 주기적으로 재생성
```

### 데이터 바인딩 비교

#### React: 단방향

```jsx
const [value, setValue] = useState('');

<input value={value} onChange={(e) => setValue(e.target.value)} />
```

- 데이터 → 화면 방향만 자동
- 화면 → 데이터는 `onChange`로 직접 처리해야 함
- 흐름이 명확해서 디버깅하기 쉬움

#### Vue: 양방향

```jsx
<input v-model="value" />
```

- `v-model` 하나로 데이터 ↔ 화면 사이의 동기화 끝!
- 폼 다룰 때 코드가 짧아짐
- 내부적으로는 단방향 + 이벤트 리스너 조합임

#### Next.js: 단방향

- React 기반이라 React랑 동일하게 단방향.

### 적합한 상황

#### React가 적합한 경우

- 대규모 팀 프로젝트: 아키텍처를 자유롭게 설계하고 싶을 때
- 모바일 앱 확장 계획: React Native로 iOS/Android 앱까지 같은 스타일로 개발 가능해서!
- 다양한 라이브러리 조합: 프로젝트에 맞게 직접 골라서 쓰고 싶을 때

→ 복잡한 상태 관리가 필요한 서비스: 대시보드, 실시간 협업 툴, 채팅 앱 등

#### Vue가 적합한 경우

- 빠른 프로토타이핑: 배우기 쉽고 빠르게 결과물을 낼 수 있음
- 소규모 팀 / 1인 개발: 공식 도구가 잘 갖춰져 있어서 고민이 적음
- 기존 프로젝트에 점진적 도입: jQuery나 레거시 프로젝트 일부에만 Vue 추가 가능
- 프론트엔드 입문자: HTML/CSS/JS만 알면 바로 시작할 수 있음

→ 폼이 많은 서비스: 양방향 바인딩(v-model)으로 입력 폼 처리가 편함

#### Next.js가 적합한 경우

- 빠른 초기 로딩이 필요: SSR/SSG로 첫 화면이 빨리 뜸
- 풀스택 개발: 프론트엔드 + 간단한 API를 한 프로젝트에서 관리

→ SEO가 중요한 사이트: 블로그, 마케팅 페이지, 이커머스 등
→ 콘텐츠 중심 서비스: 정적 페이지가 많고, 업데이트 주기가 일정한 경우

---

> React · Vue · Next.js 모두 활발히 발전 중 -!
프로젝트 요구사항과 팀 상황에 맞게 선택해서 사용하도록 하는 게 제일 중요!
>
