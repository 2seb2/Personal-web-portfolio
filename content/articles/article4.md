---
id: "article4"
title: "React Native"
kinds: ["스터디"]
stacks: ["ReactNative"]
date: "2025-12-27"
excerpt: "\"React Native is an open source framework for building Android and iOS applicati..."
---

## React Native란?

### 공식 정의

- React Native 공식문서 속 정의
    
    > "React Native is an open source framework for building Android and iOS applications using React and the app platform's native capabilities."
    > 
    > 
    > — [React Native 공식 문서: Introduction](https://reactnative.dev/docs/getting-started)
    > 

간단하게 말하면,

- React 와 JavaScript를 사용해서
- iOS/Android 네이티브 앱을 만드는
- 오픈소스 프레임워크임.

### 누가, 왜 만들었나? (등장 배경)

**Facebook의 고민:**

- 2012년, Facebook CEO 마크 저커버그는 이렇게 말했음:
    
    > "The biggest mistake we made as a company was betting too much on HTML5 as opposed to native."
    — Mark Zuckerberg, 2012

Facebook은 처음에 모바일 앱을 HTML5 기반 하이브리드로 만들었음. 그런데 느리고 불안정함. 그래서 네이티브 앱으로 전환함.

**하지만 네이티브 개발에도 문제가 있었음:**

- 플랫폼별 종속성
    - iOS 앱 → Swift/Objective-C로 개발해야 함
    - Android 앱 → Kotlin/Java로 개발해야 함
- 같은 앱을 두 번 만들어야 함
- 코드 수정할 때마다 **전체를 다시 컴파일**해야 해서 느림
- iOS 팀, Android 팀이 **따로** 일하면서 유지 보수 비용이 두 배!

**React Native의 탄생:**

- Meta blog
    
    > "In the essence of Facebook's hacker culture, React Native started as a hackathon project in the summer of 2013."
    > 
    > 
    > — [Meta Engineering Blog: React Native: A year in review](https://engineering.fb.com/2016/04/13/android/react-native-a-year-in-review/)
    > 

2013년 여름, Facebook 내부 해커톤에서 React Native 프로젝트가 시작됨. Jordan Walke를 포함한 개발자들이 “JavaScript로 네이티브 UI를 만들 수 있을까?” 라는 아이디어를 실험함.

**주요 개발 타임라인:**

| 시점 | 이벤트 |
| --- | --- |
| 2013년 여름 | Facebook 내부 해커톤에서 프로젝트 시작 |
| 2015년 1월 | React.js Conf에서 첫 공개 |
| 2015년 3월 | iOS 버전 오픈소스 공개 (GitHub) |
| 2015년 9월 | Android 버전 오픈소스 공개 |
| 2024년 10월 | New Architecture가 기본값이 됨 (v0.76) |

**React Native의 목표:**

웹 기술(JavaScript/React)의 높은 생산성과 네이티브 앱의 성능/UX를 둘 다 가져가는 것

---

## 네이티브 UI란 뭘까?

React Native를 이해하려면 먼저 **네이티브 UI** 가 뭔지 알아야 함.

### View: 모바일 UI의 기본 단위

- React Native 공식 문서에서는 이렇게 설명함:
    
    > "In Android and iOS development, a **view** is the basic building block of UI: a small rectangular element on the screen which can be used to display text, images, or respond to user input. Even the smallest visual elements of an app, like a line of text or a button, are kinds of views. Some kinds of views can contain other views. It’s views all the way down!"
    > 
    > 
    > — [React Native 공식 문서: Core Components and Native Components](https://reactnative.dev/docs/intro-react-native-components)
    > 

즉, **View(뷰)**란?

- 화면에 보이는 작은 직사각형 요소
- 텍스트, 이미지, 버튼 등 모든 UI 요소가 View임
- View 안에 다른 View가 들어갈 수 있음(중첩 가능)

예를 들어, 카카오톡 채팅 화면을 보면

- 전체 화면 = 하나의 큰 View
- 각 메시지 말풍선 = 작은 View
- 말풍선 안의 텍스트 = 텍스트를 표시하는 View
- 프로필 사진 = 이미지를 표시하는 View

이렇게 View들이 겹겹이 쌓여서 하나의 화면을 구성함.

### 네이티브 UI = 각 플랫폼이 직접 그리는 UI

**네이티브 UI**란 각 운영체제(iOS, Android)가 자체적으로 제공하는 UI요소를 말함.

| 플랫폼 | 네이티브 UI 예시 | 개발 언어 |
| --- | --- | --- |
| Android | `android.view.ViewGroup` `android.widget.TextView` | Kotlin, Java |
| iOS | `UIView` `UILabel` `UIImageView` | Swift, Objective-C |
| Web | `<div>` `<p>` `<img>` (DOM 요소) | HTML, CSS, JS |

**왜 “네이티브”라고 부를까?**

각 플랫폼의 운영체제가 직접 렌더링하기 때문!

- Android 앱의 버튼 → Android OS 가 직접 그림
- iOS 앱의 버튼 → iOS가 직접 그림
- Web 의 버튼 → 브라우저가 DOM을 통해 그림

### 웹뷰 앱 vs 네이티브 앱

모바일 앱을 만드는 방식은 크게 두 가지:

#### **1. 웹뷰(WebView) 앱**

![](/images/articles/article4/01.webp)

- 앱 안에 **브라우저를 띄워서** 웹 페이지를 보여주는 방식
- 장점: 웹 개발 지식만으로 앱 제작 가능
- 단점: 성능이 느리고 네이티브 앱처럼 느껴지지 않음

#### **2. 네이티브 앱**

![](/images/articles/article4/02.webp)

- 플랫폼의 **네이티브 UI 요소를 직접 사용**
- 장점: OS가 직접 관리하기 때문에 빠르고 부드러움
- 단점: iOS/Android 각각 따로 개발해야함

### React Native의 선택: 네이티브 UI

React Native는 웹 뷰가 아닌 네이티브 UI를 사용함.

- React Native 공식 문서의 설명
    
    > "Because React Native components are backed by the same views as Android and iOS, React Native apps look, feel, and perform like any other apps. We call these platform-backed components **Native Components**."
    > 
    > 
    > — [React Native 공식 문서](https://reactnative.dev/docs/intro-react-native-components)
    > 

React Native로 만든 앱은:

- 웹 페이지를 띄우는 게 아님!
- 진짜 Android/iOS 네이티브 UI를 사용!
- 그래서 일반 앱과 똑같이 보이고, 느껴지고, 동작함

---

## React Native의 핵심 아이디어

### JavaScript → 네이티브 UI 변환

```markdown
JavaScript로 코드를 작성하면
(JavaScript로 로직 및 UI 선언)
    ↓
React Native가 네이티브 UI로 변환해준다
(JS 객체 설계도를 각 OS가 이해하는 명령으로 번역)
    ↓
결과: 진짜 네이티브 앱!
(iOS/Android가 진짜 자기 UI 요소를 그림)
```

**React Native의 해결책:**

- JavaScript + React로 **한 번만** 작성하도록
- iOS와 Android **둘 다** 네이티브 앱으로 동작하도록

### 모든 것은  View다!

네이티브 앱 개발의 가장 기본 단위는 사각형 형태의 View임.

React Native는 각 OS(iOS/Android)의 네이티브 뷰들을 JavaScript에서 다룰 수 있도록 용도별로 매핑하여 Core Components를 제공함.

**⇒ 기본은 다 같은 View이지만, 용도에 따라 이름이 다른 전용 View**를 꺼내 쓰는 것

아까 위에서 간단히 언급했던 카카오톡 페이지를 더 자세히 예를 들어 설명해보자면

| 화면 요소 | 역할 | React Native 컴포넌트 |
| --- | --- | --- |
| 전체 화면 | 레이아웃을 잡는 가장 큰 상자 | `<View>` |
| 메시지 말풍선 | 글자나 이미지를 묶어주는 그룹 상자 | `<View>` |
| 말풍선 안의 글자 | 텍스트 표시 전용 상자 | `<Text>` |
| 프로필 사진 | 이미지 표시 전용 상자 | `<Image>` |

#### 왜 전용 컴포넌트를 써야하나?

**웹과의 중요한 차이점:**

1. `<View>`에 글자를 바로 쓸 수 없음.
    - 웹에서는 `<div>안녕</div>` 이렇게 바로 쓸 수 있지만,
    - React Native에서는 반드시 `<View><Text>안녕</Text></View>` 이렇게 `<Text>`로 감싸야 함
    - 이유: 네이티브에서 텍스트는 별도의 전용 뷰(`TextView`, `UITextView`)로 처리되기 때문
2. 이미지도 독립적인 View
    - 웹의 `<img>`는 다른 요소 안에 넣는 인라인 요소처럼 느껴짐
    - 반면, React Native의 `<Image>`는 그 자체가 하나의 독립적인 네이티브 뷰(상자)로 화면에 그려짐

**이렇게 용도에 맞는 전용 상자(Core Components)를 사용하면, 
React Native가 실행 시점에 각 플랫폼의 진짜 네이티브 UI 요소로 변환함!**

---

## **React와 React Native의 관계**

### 전제 조건

- React Native 공식 문서에서 명시하고 있다:
    
    > "To work with React Native, you will need to have an understanding of JavaScript fundamentals."
    — [React Native 공식 문서: Introduction](https://reactnative.dev/docs/getting-started)

**React Native를 하려면:** 

- JavaScript 기본기가 필요
- React 기본 개념(컴포넌트, props, state, hooks)를 알아야 함

### 공통점: React 지식 활용

```jsx
// React (웹)
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      클릭: {count}
    </button>
  );
}

// React Native (모바일)
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <Pressable onPress={() => setCount(count + 1)}>
      <Text>클릭: {count}</Text>
    </Pressable>
  );
}
```

두 코드를 비교해보면, 구조가 거의 같다는 걸 알 수 있음!

**그대로 가져갈 수 있는 것들:**

- 컴포넌트 구조(함수형 컴포넌트, JSX 문법)
- props / state 개념
- Hooks(useState, useEffect 등)
- 상태관리 라이브러리 (Zustand, Redux 등)
- 비즈니스 로직

### 차이점: 렌더링 대상

| 구분 | React (웹) | React Native |
| --- | --- | --- |
| 렌더링 대상 | **DOM** (브라우저) | **네이티브 UI** (iOS/Android) |
| 기본 요소 | `<div>`, `<span>`, `<p>` | `<View>`, `<Text>` |
| 스타일링 | CSS 파일 | JavaScript 객체 |
| 이벤트 | `onClick` | `onPress` |

가장 큰 차이는 **어디에 그리느냐**!

- React는 브라우저의 DOM에 그림
- React Native는 iOS/Android의 네이티브 UI에 그림

---

## Core Components

### 용어 정리

**Native Components:**

- 플랫폼(Android/iOS)의 네이티브 UI를 JavaScript에서 다룰 수 있도록 연결한 컴포넌트
- React Native 컴포넌트가 실행 시점에 네이티브 뷰로 변환됨

**Core Components:**

- React Native가 **기본으로 제공**하는 Native Components 세트
- `View`, `Text`, `Image`, `ScrollView`, `TextInput` 등이 포함됨

### Native Components가 하는 일

- 원래 네이티브 UI를 만들려면 Kotlin(Android)이나 Swift(iOS)를 써야 함
- React Native에서는 **JavaScript로 React 컴포넌트를 작성**
- 앱이 실행될 때, React Native가 **네이티브 뷰로 변환**해줌

### Core Components 목록

React Native가 기본 제공하는 주요 컴포넌트들:

> 공식 문서의 표를 참고함 — [Core Components and Native Components](https://reactnative.dev/docs/intro-react-native-components)
> 

| React Native | Web에서 비슷한 것 | Android View | iOS View | 설명 |
| --- | --- | --- | --- | --- |
| `<View>` | `<div>` | `ViewGroup` | `UIView` | 레이아웃 컨테이너 |
| `<Text>` | `<p>` | `TextView` | `UITextView` | 텍스트 표시 |
| `<Image>` | `<img>` | `ImageView` | `UIImageView` | 이미지 표시 |
| `<ScrollView>` | `<div>` | `ScrollView` | `UIScrollView` | 스크롤 컨테이너 |
| `<TextInput>` | `<input>` | `EditText` | `UITextField` | 텍스트 입력 |

### 변환 과정

**React Native의 `<View>`는:**

```
<View>
  → Android에서는 android.view.ViewGroup으로 변환
  → iOS에서는 UIView로 변환
```

**React Native의 `<Text>`는:**

```
<Text>
  → Android에서는 TextView로 변환
  → iOS에서는 UITextView로 변환
```

그래서 React Native 앱이 **진짜 네이티브 앱처럼** 보이고 동작하는 것!

---

## 스타일링: CSS 대신 JavaScript 객체

### **공식 스타일링: StyleSheet API**

- React Native 공식 문서에서 설명하는 스타일링 방식:
    
    > "With React Native, you style your application using JavaScript. All of the core components accept a prop named `style`. The style names and values usually match how CSS works on the web, except names are written using camel casing."
    > 
    > 
    > — [React Native 공식 문서: Style](https://reactnative.dev/docs/style)
    > 
- 모든 Core Component는 `style` prop을 받음
- CSS와 비슷하지만 **camelCase**를 사용함 (`background-color` → `backgroundColor`)
- 컴포넌트가 복잡해지면 `StyleSheet.create`로 스타일을 한 곳에 모아서 정의하는 게 좋음

```jsx
import { StyleSheet, View, Text } from 'react-native';

function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

### **CSS와의 차이점**

| CSS | React Native |
| --- | --- |
| `background-color` | `backgroundColor` (카멜케이스) |
| `font-size: 16px` | `fontSize: 16` (단위 없음) |
| `class="container"` | `style={styles.container}` |
| Flexbox 기본: `row` | Flexbox 기본: `column` |

**왜 CSS를 안 쓸까?**

네이티브 플랫폼에는 브라우저 CSS 엔진이 없기 때문

JS 객체로 정의해야 네이티브 스타일 시스템으로 변환 가능

---

### 웹에서 쓰던 스타일링 도구들은?(emotion, Tailwind 등)

React에서는 CSS 외에도 emotion, styled-components, Tailwind CSS 등을 많이 씀.

React Native에서는 어떻게 되나?

### 1. CSS-in-JS: @emotion/native

- emotion 공식문서
    
    > "Style and render React Native components using emotion"
    > 
    > 
    > — [Emotion 공식 문서: @emotion/native](https://emotion.sh/docs/@emotion/native)
    > 

Emotion은 React Native용 패키지 `@emotion/native`를 공식 제공함

```jsx
import styled from '@emotion/native';

const Container = styled.View`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px;
`;

const Title = styled.Text({
  color: 'hotpink',
  fontSize: 24,
});

function App() {
  return (
    <Container>
      <Title>Hello Emotion!</Title>
    </Container>
  );
}
```

**특징:**

- `styled.View`, `styled.Text` 형태로 RN 컴포넌트를 감싸서 사용
- 템플릿 리터럴(`) 또는 객체 문법 모두 사용 가능
- 테마 지원도 됨 (`@emotion/react`의 `ThemeProvider` 사용)

#### 2. Tailwind 방식: NativeWind

- nativeWind 공식문서
    
    > "NativeWind allows you to use Tailwind CSS to style your components in React Native."
    > 
    > 
    > — [NativeWind 공식 문서](https://www.nativewind.dev/)
    > 

Tailwind CSS를 React Native에서 쓰려면 **NativeWind** 같은 라이브러리를 사용함

```jsx
import { View, Text } from 'react-native';

function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to NativeWind!
      </Text>
    </View>
  );
}
```

**특징:**

- 웹에서 쓰던 Tailwind 클래스를 **그대로** 사용
- 빌드할 때 Tailwind 클래스가 `StyleSheet.create` 객체로 변환됨
- 웹과 네이티브에서 **같은 className**으로 스타일링이 가능

#### 스타일링 방식 비교

| 구분 | React (웹) | React Native |
| --- | --- | --- |
| 기본 | CSS/SCSS, CSS Modules | `StyleSheet.create` + `style` prop |
| CSS-in-JS | `@emotion/react`, styled-components | `@emotion/native`, styled-components/native |
| Tailwind | Tailwind CSS + PostCSS | **NativeWind** (Tailwind → RN 스타일 변환) |

#### 정리

- React Native **공식 스타일 시스템**은 `StyleSheet` (JS 객체 기반)
- emotion, Tailwind 등은 **호환 레이어를 제공하는 별도 라이브러리**
- CSS를 그대로 쓰는 게 아니라, **RN 스타일 API 위에 추상화**를 얹는 방식

---

## 동작 원리: 렌더링

이 부분이 React Native를 이해하는 데 가장 중요한 부분!

작성한 JavaScript 코드가 어떻게 네이티브 UI로 바뀌는가?를 단계별로 살펴보자!!

### 기본 개념

React Native 앱은 **두 개의 세계**가 함께 동작함

![](/images/articles/article4/03.webp)

**JavaScript:**

- 우리가 작성하는 React 코드가 실행되는 곳
- 컴포넌트, 상태, 이벤트 핸들러 등

**Native:**

- 실제 화면에 UI를 그리는 곳
- 카메라, GPS, 파일 시스템 등 네이티브 기능

**핵심 문제:** 

이 두 세계는 **서로 다른 언어**로 되어 있음. 

JavaScript와 네이티브(Swift/Kotlin)가 서로 대화해야 한다!

### 렌더링: 3단계

- React Native 공식 아키텍처 문서에서 설명하는 렌더링 파이프라인
    
    > "The render pipeline can be broken into three general phases:
    > 
    > 1. **Render**: React executes product logic which creates a React Element Trees in JavaScript.
    > 2. **Commit**: After a React Shadow Tree is fully created, the renderer triggers a commit.
    > 3. **Mount**: The React Shadow Tree is transformed into a Host View Tree."
    > 
    > — [React Native Architecture: Render, Commit, and Mount](https://reactnative.dev/architecture/render-pipeline)
    > 
    

![](/images/articles/article4/04.webp)

### 1. Render (렌더 단계)

> 💡 JavaScript 영역에서 - React 컴포넌트가 실행되고, "무엇을 그릴지" 결정

#### 이 단계에서 일어나는 일

1. **React 컴포넌트가 실행된다**
2. **React Element Tree가 생성된다** (JavaScript 객체)
3. **React Shadow Tree가 생성된다** (C++ 객체)

#### 예시로 이해하기

이런 코드가 있다고 하자:

```jsx
function MyComponent() {
  return (
    <View>
      <Text>Hello, World</Text>
    </View>
  );
}
```

위 코드가 실행되면

**Step 1: React 컴포넌트 실행**

`MyComponent` 함수가 호출되고, 이 함수는 JSX를 반환함

**Step 2: React Element Tree 생성**

JSX가 JavaScript 객체로 변환됨. 이걸 **React Element**라고 함.

```jsx
// 실제로는 이런 구조의 JavaScript 객체가 만들어진다
{
  type: 'View',
  props: {
    children: {
      type: 'Text',
      props: {
        children: 'Hello, World'
      }
    }
  }
}
```

React Element는:

- 순수한 **JavaScript 객체**
- 화면에 무엇이 나타나야 하는지 **설명**
- 아직 실제 UI가 아님. 그냥 **설계도**

**Step 3: React Shadow Tree 생성**

React Element Tree를 기반으로 **React Shadow Tree**가 생성됨.

```
React Element Tree (JS)    →    React Shadow Tree (C++)
      <View>                        ViewShadowNode
        └── <Text>                    └── TextShadowNode
              └── "Hello"                   └── (text content)
```

React Shadow Node는:

- **C++로 작성된 객체**
- JavaScript에서 넘어온 props 정보를 담고 있음
- **레이아웃 정보** (위치, 크기)를 저장할 공간이 있음

**왜 Shadow Tree가 필요할까?**

- JavaScript는 느림. 레이아웃 계산 같은 무거운 작업을 JS에서 하면 앱이 버벅임
- C++는 빠름. Shadow Tree를 C++로 만들어서 빠른 레이아웃 계산이 가능
- 레이아웃 계산 같은 무거운 작업을 C++에서 처리함

### 2. Commit (커밋 단계)

> 💡 중간 다리 (C++ 영역)에서 - 각 요소의 **위치와 크기**를 계산

#### 이 단계에서 일어나는 일

1. **레이아웃 계산** (Yoga 엔진 사용)
2. **트리 확정** (이 트리를 “다음에 그릴 Tree”로 지정)

#### 레이아웃 계산이란?

화면에 뭘 그릴지는 이전 Render 단계에서 결정됨. 이제 어디에, 얼마나 크게 그릴지 정할 차례

```jsx
<View style={{ flex: 1, padding: 20 }}>
  <Text style={{ fontSize: 24 }}>Hello</Text>
</View>
```

**계산 과정:**

1. 화면 크기 확인 (예: iPhone 15 = 393 x 852)
2. `<View>`는 `flex: 1`이니까 화면 전체 차지
3. `<View>` 안쪽에 20px 패딩
4. `<Text>`는 "Hello" 텍스트 크기만큼 공간 필요

**계산 결과:**

```
ViewShadowNode:
  x: 0, y: 0
  width: 375, height: 812   (예: iPhone 화면 크기)

TextShadowNode:
  x: 20, y: 20              (패딩 때문에 20px 안쪽)
  width: 80, height: 29     (텍스트 크기에 맞춰 계산됨)
```

#### Yoga 레이아웃 엔진이란?

이 계산을 담당하는 게 **Yoga**

- Facebook이 만든 **크로스 플랫폼 레이아웃 엔진**
- **Flexbox 레이아웃**을 계산
- C++로 작성되어 **빠름**
- iOS, Android, Web 모두에서 **동일한 결과**를 냄

React Native에서 `flex`, `alignItems`, `justifyContent` 같은 스타일을 쓸 수 있는 이유가 Yoga 덕분

#### 트리 확정

레이아웃 계산이 끝나면, 이 Shadow Tree를 **“다음에 화면에 그릴 Tree”**로 확정

---

### 3. Mount (마운트 단계)

> 💡 Native 영역에서 - 실제 네이티브 UI를 생성하고 화면에 표시

#### 이 단계에서 일어나는 일

1. **Tree Diffing**: 이전에 그린 트리와 새 트리를 비교
2. **변경 사항 계산**: 어떤 뷰를 추가/수정/삭제할지 결정
3. **네이티브 UI 생성/업데이트**: 실제 화면에 반영

#### Tree Diffing이란?

앱을 처음 실행할 때는 모든 UI를 새로 만듦.

하지만 **상태가 변경될 때**는 다름:

```jsx
// 상태 변경 전
<View>
  <View style={{ backgroundColor: 'red' }} />
  <View style={{ backgroundColor: 'blue' }} />
</View>

// 상태 변경 후 (빨간색 → 노란색)
<View>
  <View style={{ backgroundColor: 'yellow' }} />
  <View style={{ backgroundColor: 'blue' }} />
</View>
```

React Native는 **이전 트리**와 **새 트리**를 비교해서:

- 뭐가 바뀌었는지 알아냄
- 바뀐 부분만 업데이트

이렇게 하면 **전체를 다시 그릴 필요 없이** 바뀐 부분만 수정할 수 있다!

#### 네이티브 UI 생성

마지막으로, Shadow Node가 **실제 네이티브 뷰**로 변환됨

```
React Shadow Tree          →          Host View Tree
                                      (네이티브 UI)

ViewShadowNode            →          Android: ViewGroup
                                      iOS: UIView

TextShadowNode            →          Android: TextView
                                      iOS: UITextView
```

이렇게 **실제 화면에 뷰가 표시됨**!

---

## New Architecture (0.76+)

React Native 0.76부터 새로운 아키텍처가 기본값이 됐음.

### 먼저, 왜 새로운 아키텍처가 필요했을까?

React Native는 2015년에 처음 나왔음.

그 때 만든 구조로 거의 10년간 사용해옴.

하지만 시간이 지나면서 한계를 느낌.

### 기존 아키텍처: Bridge 방식

기존에는 JavaScript와 네이티브가 **비동기 브리지(Bridge)**를 통해 통신:

![](/images/articles/article4/05.webp)

**문제점:**

1. **비동기 통신만 가능**
    
    ```jsx
    사용자: 버튼 클릭!
      ↓
    JS: "버튼 눌렸어!" (메시지 보냄)
      ↓ (기다림...)
    Native: (메시지 받음) → UI 업데이트
      ↓ (기다림...)
    JS: (결과 받음)
    ```
    
    - 모든 통신이 **비동기**라서 즉각적인 반응이 어려움
    - 빠른 스크롤, 애니메이션에서 **끊기는 느낌**이 날 수 있음
2. **데이터를 JSON으로 변환**해야 함
    
    JS와 Native는 서로 다른 언어다. 데이터를 주고받으려면:
    
    ```jsx
    JavaScript 객체
        ↓ JSON.stringify()
    JSON 문자열
        ↓ (Bridge로 전송)
    JSON 문자열
        ↓ JSON.parse()
    Native 객체
    ```
    
    - 매번 변환 작업 필요
    - 데이터가 크면 느려짐
    - 이미지 같은 큰 데이터는 병목이 생김
3. **UI 업데이트가 빈번하면 성능 저하**가 생김
    - 스크롤할 때마다 Bridge를 통해 통신
    - 애니메이션의 매 프레임마다 통신
    - 통신이 많아지면 **앱이 버벅인다**

### New Architecture의 해결책

- 공식문서 언급
    
    > “The New Architecture removes the asynchronous bridge between JavaScript and native and replaces it with JavaScript Interface (JSI).”
    > 
    > 
    > — [React Native Blog: New Architecture is here](https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here)
    > 

#### 핵심 변화: JSI (JavaScript Interface)

**기존 Bridge 방식**

`JS ←── Bridge (비동기, JSON 변환) ──→ Native`

**새로운 JSI 방식**

`JS ←── JSI (동기/비동기, 직접 참조) ──→ Native`

**JSI가 뭘 바꿨나?**

1. **직접 참조**: JSON 변환 없이 메모리를 직접 공유
2. **동기 호출 가능**: 필요하면 즉시 응답을 받을 수 있음
3. **더 빠름**: 변환 과정이 없어서 오버헤드가 줄었음

#### New Architecture의 세 가지 핵심

**1. JSI (JavaScript Interface)**

- Bridge 대신 **직접 통신**
- JSON 변환 없이 **메모리 참조**
- 동기/비동기 모두 지원

**2. Fabric (새로운 렌더러)**

- 새로운 렌더링 시스템
- **동기 렌더링** 지원 → 더 빠른 UI 반응
- 사용자 인터랙션에 더 빠르게 반응할 수 있음

**3. TurboModules (새로운 네이티브 모듈 시스템)**

- 네이티브 모듈을 **필요할 때만 로딩** (지연 로딩)
- 앱 시작할 때 모든 모듈을 미리 로딩하지 않음 → 앱 시작 시간 단축

#### **결과**

| 항목 | 기존 (Bridge) | 신규 (JSI) |
| --- | --- | --- |
| 통신 방식 | 비동기만 가능 | 동기/비동기 모두 |
| 데이터 전달 | JSON 직렬화 필요 | 메모리 직접 참조 |
| UI 반응성 | 느릴 수 있음 | 즉각 반응 가능 |
| 앱 시작 시간 | 모든 모듈 미리 로딩 | 필요한 것만 로딩 |

**체감 효과:**

- 스크롤이 더 부드럽다
- 애니메이션이 더 자연스럽다
- 앱이 더 빨리 시작된다
- 앱이 더 네이티브답게 반응한다

---

## 개발 환경: Expo vs React Native CLI

React Native 앱을 개발하는 방법은 크게 두 가지:

### 1. Expo

- expo 공식문서
    
    > "Expo is a production-grade React Native Framework."
    > 
    > 
    > — [React Native 공식 문서: Get Started](https://reactnative.dev/docs/environment-setup)
    > 
- React Native 위에 올라가는 **프레임워크**
- 개발에 필요한 도구들을 **미리 세팅**해서 제공
- Xcode/Android Studio **없이도** 시작 가능
- 자주 쓰는 네이티브 기능 (카메라, 푸시 알림 등) **기본 제공**

```bash
# Expo로 시작하기
npx create-expo-app@latest my-app
cd my-app
npx expo start
```

### 2. React Native CLI

- React Native **기본 도구**
- 네이티브 프로젝트(Xcode/Android Studio)를 **직접 관리**
- **더 많은 자유도**, 더 많은 책임

```bash
# React Native CLI로 시작하기 (더 복잡한 설정 필요)
npx @react-native-community/cli init MyApp
cd MyApp
npx react-native run-ios  # 또는 run-android
```

### 비교

| 항목 | Expo | React Native CLI |
| --- | --- | --- |
| 시작 난이도 | 쉬움 | 어려움 |
| 환경 설정 | 거의 없음 | Xcode/Android Studio 필요 |
| 네이티브 코드 수정 | 제한적 | 자유로움 |
| 기본 제공 기능 | 많음 (Expo SDK) | 적음 |
| 빌드/배포 | Expo 서비스 제공 | 직접 설정 |
| 적합한 경우 | 대부분의 앱, 빠른 개발 | 복잡한 네이티브 요구사항 |

### 공식 문서의 권장 사항

- React Native 공식 문서에서는 **Expo로 시작하는 것을 권장**:
    
    > "We believe that the best way to experience React Native is through a Framework, a toolbox with all the necessary APIs to let you build production ready apps."
    > 
    > 
    > — [React Native 공식 문서](https://reactnative.dev/docs/environment-setup)
    > 
    
    > "You can also use React Native without a Framework, however we've found that most developers benefit from using a React Native Framework like Expo."
    > 
    > 
    > — [React Native 공식 문서](https://reactnative.dev/docs/environment-setup)
    > 

**왜 Expo를 권장할까?**

1. **시간 절약**: 환경 설정에 시간 쓰지 않고 바로 개발 시작
2. **검증된 도구**: 커뮤니티가 수년간 다듬어온 best practice
3. **점진적 확장**: Expo로 시작해서, 필요하면 네이티브 코드 추가 가능

### 우리 실습에서는?

**Expo로 진행한다!**

- 설정이 간단해서 스터디에서 바로 실습 가능
- 공식 문서도 Expo로 시작하는 것을 권장
- 나중에 필요하면 `expo eject`로 CLI 방식으로 전환 가능

---

## 실습: React Native 변환 확인

React Native 코드가 **실제로 네이티브 UI로 변환**되는 과정을 직접 눈으로 확인해보기!

### **목표**

- 웹에서 실행할 때: `<View>` → `<div>`로 변환되는 것 확인
- React Native Devtools에서: `<View>`, `<Text>` 구조 확인
- Xcode에서: 실제 네이티브 뷰 (`RCTView`, `RCTText` 등) 확인

### Step 1) 프로젝트 생성 및 실행

```bash
# 1. 프로젝트 생성
npx create-expo-app@latest counter-app
cd counter-app

# 2. 개발 서버 시작
npx expo start

# 3. 먼저 기본 코드를 제거하는 스크립트
# app 디렉토리와 다른 디렉토리(components, constants, hooks-기본 코드 포함)에 있던 기존 파일들은 스크립트에 의해 app-example 디렉토리로 이동
npm run reset-project
```

### Step 2) 카운터 앱 코드 작성

`app/index.tsx` (또는 `App.js`) 파일을 다음 코드로 교체:

```jsx
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>카운터</Text>
      <Text style={styles.count}>{count}</Text>
      <View style={styles.buttons}>
        <Pressable 
          style={styles.button} 
          onPress={() => setCount(count - 1)}
        >
          <Text style={styles.buttonText}>-</Text>
        </Pressable>
        <Pressable 
          style={styles.button} 
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  count: {
    fontSize: 48,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
});
```

- 오류
    - tsconfig.json
        - **문제**: `expo/tsconfig.base` 파일을 찾지 못함
        - **해결**: `expo/tsconfig.base.json`으로 수정 (`.json` 확장자 추가)
        
        ```json
        {
          "extends": "expo/tsconfig.base.json",
          "compilerOptions": {
            "strict": true,
            "paths": {
              "@/*": [
                "./*"
              ]
            }
          },
          "include": [
            "**/*.ts",
            "**/*.tsx",
            ".expo/types/**/*.ts",
            "expo-env.d.ts"
          ]
        }
        
        ```
        
    - eslint.config.js - ESLint
        
        macOS의 대소문자를 구분하지 않는 파일시스템(case-insensitive)에서 발생하는 잘못된 경고
        
        ```jsx
        // https://docs.expo.dev/guides/using-eslint/
        const { defineConfig } = require('eslint/config');
        const expoConfig = require('eslint-config-expo/flat');
        
        module.exports = defineConfig([
          expoConfig,
          {
            ignores: ['dist/*'],
            rules: {
              'import/no-unresolved': 'off',
            },
          },
        ]);
        
        ```
        

### Step 3) 웹에서 확인하기 - `<View>` → `<div>` 변환

**실행 방법**

터미널에서 `w` 키를 눌러 웹 브라우저에서 앱을 실행

**개발자 도구로 확인**

1. 브라우저에서 **F12** (또는 Cmd+Option+I)를 눌러 개발자 도구 열기
2. **Elements** 탭에서 HTML 구조 확인
- 확인 캡쳐
    
    ![](/images/articles/article4/06.webp)
    

**확인 결과**

```html
<!-- React Native 코드 -->
<View style={styles.container}>
  <Text style={styles.title}>카운터</Text>
</View>

<!-- 웹에서 변환된 결과 -->
<div class="css-view-..." style="...">
  <div class="css-text-..." style="...">카운터</div>
</div>
```

#### 🔍 왜 이렇게 변환될까?

**1. 웹에서는 react-native-web이 대신 실행**

Expo에서 `w` 키를 눌러 웹으로 실행하면, 내부적으로 **react-native-web**이라는 라이브러리가 동작!

```jsx
// 우리가 작성한 코드
import { View } from 'react-native';

// 웹에서 실제로 실행되는 코드 (Expo가 자동으로 바꿔줌)
import { View } from 'react-native-web';

```

즉, 우리는 `react-native`에서 `View`를 가져온다고 썼지만, 웹 환경에서는 Expo(정확히는 bundler 설정)가 자동으로 `react-native-web`의 `View`로 바꿔서 실행하는 것.

**2. react-native-web의 View는 div를 반환**

react-native-web의 `View` 컴포넌트는 내부적으로 이렇게 구현되어 있음:

```jsx
// react-native-web 라이브러리 내부 (단순화)
function View(props) {
  return <div style={변환된스타일} {...props} />;
}

```

그래서 `<View>`를 쓰면 결국 `<div>`가 렌더링되는 것

**3. 왜 하필 div일까?**

브라우저는 HTML만 이해함. 브라우저가 아는 건 `<div>`, `<span>`, `<p>` 같은 HTML 태그뿐.

iOS의 `UIView`나 Android의 `ViewGroup` 같은 건 브라우저가 전혀 모르기에 브라우저에서 실행할 때는 가장 비슷한 HTML 태그인 `<div>`로 바꿔주는 것.

| React Native | 웹에서 변환 | 이유 |
| --- | --- | --- |
| `<View>` | `<div>` | 레이아웃 컨테이너 역할이 같음 |
| `<Text>` | `<div>` 또는 `<span>` | 텍스트를 감싸는 역할 |
| `<Image>` | `<img>` | 이미지 표시 역할이 같음 |

**4. 스타일도 CSS로 변환**

```jsx
// React Native 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  }
});

```

↓ 웹에서는 이렇게 변환됨

```html
<div class="r-flex-1 r-backgroundColor-f0f0f0" />

```

```css
.r-flex-1 { flex: 1; }
.r-backgroundColor-f0f0f0 { background-color: #f0f0f0; }

```

react-native-web이 JavaScript 스타일 객체를 CSS 클래스로 자동 변환해줌.

### Step 4) React Native Devtools에서 확인하기 - React Native 컴포넌트 구조

**실행 방법**

`npx expo start` 로 실행하면 QR이 뜸.

핸드폰에 expo go 어플을 깔아두고, QR을 스캔하면 앱에서 확인 가능

**React Native Devtools 열기**

1. 앱이 실행되면 **기기를 흔들기**
2. 개발자 메뉴가 나타나면 **"open JS Debugger"** 선택
3. 해당 요소의 정보가 표시 확인
- 캡쳐
    
    
    ![](/images/articles/article4/07.webp)
    
    ![](/images/articles/article4/08.webp)
    

**확인 결과**

요소를 클릭하면 다음과 같은 정보가 표시

![](/images/articles/article4/09.webp)

![](/images/articles/article4/10.webp)

![](/images/articles/article4/11.webp)

- style
    
    ![](/images/articles/article4/12.webp)
    
    ![](/images/articles/article4/13.webp)
    
    ![](/images/articles/article4/14.webp)
    
    ![](/images/articles/article4/15.webp)
    
    ![](/images/articles/article4/16.webp)
    
    ![](/images/articles/article4/17.webp)
    
- React Native의 **컴포넌트 트리** 구조를 확인 가능
- `View`, `Text`, `Pressable` 등의 컴포넌트 이름이 그대로 보임
- 각 컴포넌트에 적용된 **스타일과 props** 확인 가능

#### **🔍**  왜 이렇게 보이나?

**1. React DevTools의 동작 원리**

DevTools(JS Debugger)는 **JavaScript 영역**에 연결됨. 

그래서 우리가 작성한 컴포넌트 이름(`View`, `Text`)이 그대로 보이는 것.

**2. 아직 네이티브로 변환되기 전 단계**

DevTools에서 보이는 건 React가 관리하는 컴포넌트 트리. 

이건 네이티브 뷰로 변환되기 **전** 단계의 정보.

```
<View>  ←  DevTools에서 보이는 것
   ↓
RCTViewComponentView  ←  실제 iOS에서 렌더링되는 것

```

### Step 5) Xcode에서 확인하기 - 실제 네이티브 뷰

React Native 컴포넌트가 **실제로 iOS 네이티브 뷰로 변환**되었는지 확인

**사전 준비: Development Build 생성**

Expo Go가 아닌 **Development Build**를 사용해야 Xcode에서 디버깅이 가능

```html
# 1. expo-dev-client 설치
npx expo install expo-dev-client

# 2. iOS 빌드 생성 (Xcode 필요)
npx expo run:ios
```

- `ios/` 폴더가 생성됨
- Xcode 프로젝트 파일 (`.xcworkspace`)이 생성됨
- 앱이 시뮬레이터에서 실행됨

**Xcode에서 View Hierarchy 확인하기**

1. **Xcode에서 프로젝트 열기**

`open ios/counterapp.xcworkspace`

1. **앱 실행**
    - Xcode에서 ▶ (Run) 버튼을 눌러 앱 실행
2. **Debug View Hierarchy 열기**
    - 앱이 실행된 상태에서
    - Xcode 메뉴: **Debug → View Debugging → Capture View Hierarchy**
    - 또는 하단 디버그 바에서 **View Hierarchy 아이콘** 클릭
3. 계층 구조 확인

**확인 결과: 네이티브 뷰 이름**

Xcode의 View Hierarchy에서 다음과 같은 **실제 iOS 네이티브 뷰 이름**을 확인할 수 있음

![](/images/articles/article4/18.webp)

| React Native 컴포넌트 | iOS 네이티브 뷰 (Old Arch) | iOS 네이티브 뷰 (New Arch / Fabric) |
| --- | --- | --- |
| `<View>` | `RCTView` | `RCTViewComponentView` |
| `<Text>` | `RCTTextView` | `RCTTextComponentView` |
| `<Image>` | `RCTImageView` | `RCTImageComponentView` |
| `<ScrollView>` | `RCTScrollView` | `RCTScrollViewComponentView` |

#### 🔍 왜 이렇게 변환될까?

**1. Host View란?**

React Native에서 **Host View**는 실제 플랫폼의 네이티브 뷰를 말함.

| 용어 | 의미 | 예시 |
| --- | --- | --- |
| **Host View** | 실제 플랫폼이 제공하는 네이티브 뷰 | iOS의 `UIView`, Android의 `View` |
| **Host Platform** | 앱이 실행되는 플랫폼 | iOS, Android |

React Native 코드가 최종적으로 변환되는 목적지가 Host View라고 함.

**3. RCTViewComponentView는 UIView를 상속받는다**

```
UIView (iOS 기본 클래스)
   ↑ 상속
RCTViewComponentView (React Native 클래스)

```

- `UIView`: iOS가 제공하는 기본 뷰 클래스. 모든 iOS UI의 기반.
- `RCTViewComponentView`: React Native가 만든 클래스. `UIView`를 상속받아서 만듦.

상속받았기 때문에:

- iOS의 모든 기본 기능(터치 이벤트, 애니메이션 등)을 그대로 사용 가능
- React Native가 필요한 기능(props 업데이트, JavaScript와 통신)을 추가

1. **RCT 접두사의 의미**
- React Native 초기부터 사용된 내부 명명 규칙으로 "React" 관련 네이티브 클래스임을 나타냄
- `RCTView`는 `UIView`를 상속받은 React Native의 커스텀 뷰 클래스
- `RCTText`는 텍스트 렌더링을 위한 React Native의 커스텀 뷰 클래스
    
    **New Architecture (Fabric)에서의 변화**
    
    React Native 0.76+ (New Architecture)에서는 컴포넌트 이름이 조금 다름:
    
    - `RCTView` → `RCTViewComponentView`
    - `RCTText` → `RCTTextComponentView`
    
    `ComponentView` 접미사가 붙은 클래스들은 **Fabric 렌더러**에서 사용되는 새로운 네이티브 뷰 구현!
    

**5. 왜 Xcode에서 보면 "진짜 네이티브"라는 걸 알 수 있을까?**

Xcode의 View Hierarchy Debugger는:

- **iOS 운영체제**가 관리하는 뷰만 보여줌
- JavaScript나 React와 전혀 관계없이 동작
- 순수 iOS 앱 개발할 때 쓰는 것과 **똑같은 도구**

여기서 `RCTViewComponentView`가 보인다는 건:

- iOS 운영체제가 이 뷰를 **네이티브 뷰로 인식**하고 있다는 뜻
- 웹뷰 안에서 HTML을 보여주는 게 아니라, **진짜 네이티브 뷰**라는 증거

만약 웹뷰 기반 하이브리드 앱이었다면, 
Xcode에서 `WKWebView` 하나만 보이고 그 안의 HTML 구조는 안 보였을 것!!

### 정리

1. **웹**: React Native 컴포넌트가 **HTML DOM 요소**로 변환됨
2. **iOS**: React Native 컴포넌트가 **UIView 기반의 네이티브 뷰**로 변환됨
3. 같은 JavaScript 코드가 플랫폼에 따라 **다른 네이티브 요소**로 렌더링됨
4. 이것이 React Native가 네이티브 앱을 만들 수 있는 이유!! -끝
