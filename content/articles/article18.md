---
id: "article18"
title: "차트 라이브러리를 이해해보자"
kinds: ["스터디"]
stacks: ["JavaScript"]
date: "2026-01-10"
excerpt: "차트 라이브러리는 숫자 데이터를 시각적인 그래픽(막대 차트, 선 그래프, 파이 차트 등)으로 바꿔주는 코드 묶음임. “라이브러리”라는 말 자체가..."
---

## 1. 차트 라이브러리란?

차트 라이브러리는 숫자 데이터를 시각적인 그래픽(막대 차트, 선 그래프, 파이 차트 등)으로 바꿔주는 코드 묶음임.

“라이브러리”라는 말 자체가 미리 작성해둔 코드를 재사용 할 수 있게 묶어놓은 것을 의미함.
차트 라이브러리는 그중에서도 차트를 그리는 데 특화된 라이브러리임.

차트 라이브러리는 여러 언어로 존재하는데(Python의 matplotlib, Java의 JFree Chart 등), 이번 스터디에서는 웹에서 사용하는 JavaScript 차트 라이브러리에 한정해서 알아봄.

### 대표적인 JavaScript 차트 라이브러리

#### Chart.js

- 공식문서의 설명
    
    > "Chart.js is a free, open-source JavaScript library for data visualization, which supports eight chart types: bar, line, area, pie (doughnut), bubble, radar, polar, and scatter."
    — Chart.js 공식 문서: [Introduction](https://www.chartjs.org/docs/latest/)
    > 

: Chart.js는 8가지 차트 타입을 지원하는 무료 오픈소스 라이브러리임.

#### Recharts

- 공식문서의 설명
    
    > "Recharts is a Redefined chart library built with React and D3. The main purpose of this library is to help you to write charts in React applications without any pain."
    > 
    > 
    > — Recharts 공식 문서: [Getting Started](https://recharts.org/en-US/)
    > 

: Recharts는 React에서 차트를 쉽게 그릴 수 있도록 만들어진 라이브러리임.

### 왜 차트라이브러리가 필요할까?

차트를 직접 그리려면 생각보다 많은 작업이 필요함:

1. 데이터 전처리 - 최솟값, 최댓값 계산하고, 빠진 데이터 처리하기 등
2. 좌표 계산 - ex.”매출 500만원” 이면 화면의 어느 위치에 그릴지 계산하기
3. 축과 눈금 - X축, Y축 선 그리고, 눈금 간격 정해서 표시하기
4. 도형 그리기 - 막대, 선, 점 같은 도형을 실제로 화면에 그리기
5. 부가 기능 - 범례, 툴팁, 마우스 호버 효과, 반응형 처리 등..

차트 라이브러리는 이런 복잡한 과정을 대신 처리해줌. 개발자는 데이터와 간단한 옵션만 전달하면 됨.

## 2. 데이터가 그림이 되는 과정

차트 라이브러리가 내부에서 어떤 과정을 거쳐서 숫자를 그림으로 바꾸는지 알아봄.

핵심은 3단계 과정:

```bash
1. 정규화  →  2. 스케일 계산  →  3. 렌더링
```

### 1단계: 정규화 (Normalization)

정규화는 들어온 데이터를 일정한 형식으로 맞추는 과정임.

예를 들어, 사용자가 이렇게 데이터를 넘겼다고 가정해보자:

```jsx
// 사용자가 넘긴 데이터
const data = [
  { month: 'Jan', value: 100 },
  { month: 'Feb', value: 200 },
  { month: 'Mar' },  // value가 없음!
  { month: 'Apr', value: 150 }
];
```

차트 라이브러리는 내부적으로 이걸 처리함.

```jsx
// 라이브러리 내부에서 정규화된 데이터
const normalizedData = [
  { month: 'Jan', value: 100 },
  { month: 'Feb', value: 200 },
  { month: 'Mar', value: 0 },   // 빠진 값은 0으로 처리
  { month: 'Apr', value: 150 }
];
```

동시에 최솟값(0)과 최댓값(200)도 계산해둠. 다음 단계에서 필요하기 때문.

### 2단계: 스케일 계산 (가장 중요 뽀인트!)

스케일 계산은 “데이터 값”을 화면에 그릴 위치”로 바꾸는 과정임.

이게 차트의 핵심인데, 예를 들어:

```jsx
데이터: [100, 200, 150, 180]
차트 높이: 400픽셀

의 상황..!!! 

질문: "값 150"은 화면의 어느 높이에 그려야 할까?
```

이런 상황의 답을 주는 게 스케일 계산의 과정!

#### 스케일 함수의 원리

- 기본 개념
    
    ```jsx
    비율 = 값 / 최댓값
    픽셀 위치 = 비율 × 차트 높이
    ```
    
    만약 최댓값이 200이고 차트 높이가 400픽셀이라면:
    
    - 값 200 → (200/200) x 400 = 400 픽셀 (맨 위)
    - 값 100 → (100/200) x 400 = 200 픽셀 (중간)
    - 값 50 → (50/200) x 400 = 100 픽셀 (아래쪽)
- 실제 공식(최솟값이 0이 아닐 때도 동작):
    
    ```jsx
    scale(value) = ((value - min) / (max - min)) × chartHeight
    ```
    
    예를 들어 데이터가 [50, 100, 75]이고 차트 높이가 300픽셀이라면:
    
    - min = 50(최솟값이 0이 아님), max = 100
    - 값 75 → ((75 - 50) / (100 - 50)) × 300 = 150픽셀

#### 코드로 보는 스케일 함수

```jsx
// 스케일 함수
function createScale(min, max, chartHeight) {
  return function(value) {
    const ratio = (value - min) / (max - min);
    return ratio * chartHeight;
  };
}

// 사용 예시
const data = [100, 200, 150, 180];
const min = Math.min(...data);  // 100
const max = Math.max(...data);  // 200
const chartHeight = 400;

const scale = createScale(min, max, chartHeight);

scale(100);  // → 0 (맨 아래)
scale(200);  // → 400 (맨 위)
scale(150);  // → 200 (중간)
```

#### Y좌표 뒤집기

여기서 한 가지 주의할 점이 있음‼️

화면 좌표계는 위에서 아래로 증가함.

![](/images/articles/article18/01.webp)

그래서 차트를 그릴 때는 Y좌표를 뒤집어야 함:

```jsx
// 스케일 결과: 값이 클수록 큰 숫자
scale(200);  // → 400

// 화면에 그릴 때: Y좌표 뒤집기
const y = chartHeight - scale(value);

// 값 200 → y = 400 - 400 = 0 (화면 맨 위)
// 값 100 → y = 400 - 0 = 400 (화면 맨 아래)
```

이렇게 하면 "값이 클수록 막대가 위로" 그려짐.

### 3단계: 렌더링

렌더링은 계산된 좌표를 바탕으로 실제 도형을 화면에 그리는 과정임.

```jsx
const data = [100, 200, 150, 180];
const scale = createScale(100, 200, 400);  // 위에서 만든 스케일 함수

data.forEach((value, index) => {
  const barHeight = scale(value);          // 스케일 계산
  const y = chartHeight - barHeight;       // Y좌표 뒤집기
  const x = index * barWidth;              // X 위치
  
  // 실제로 막대 그리기 (SVG 또는 Canvas)
  drawBar(x, y, barWidth, barHeight);
});
```

여기서 "실제로 막대를 그리는 방식"이 **SVG**와 **Canvas**, 두 가지로 나뉨. 
이건 다음 섹션에서 다룰 내용으로 넘어가겠음!

### D3.js는 뭘까?

상단에 Rechart 공식문서(*“Recharts is built with React and D3”*)에서도 언급하기도 했고 
D3.js 라는 라이브러리 이름을 들어봤을 수 있음.
근데 엄밀히 말하면 D3는 차트를 “그려주는”라이브러리는 아니고, 
스케일 계산을 도와주는 도구(수학느낌)로, 특히 스케일(scale) 계산을 중심으로 한 변환 로직에 가까움.

위에서 살펴봤듯이, 차트를 그릴 때 스케일 개념이 필요하지만
구현 디테일은 사실 라이브러리마다 다를 수 있음.

예를 들어:

- 몇 개의 눈금을 만들지?
- 정수로 맞출지?
- 10, 20, 50 단위로 “예쁘게” 나눌지?
- padding / margin 반영 방식

등….

그래서 많은 차트 라이브러리들은 D3의 스케일 개념(혹은 구현)을 직접 차용하거나, 
거의 동일한 로직을 재구현해서 사용함.

결과적으로 라이브러리 간 차이는 스케일의 ‘수학’보다는 ‘옵션과 디테일’에서 발생함.

## 3. 렌더링 방식: SVG vs Canvas

이제 “실제로 화면에 그리는 방법”을 알아봄!

크게 SVG 방식과 Canvas 방식 두가지가 있음.

### SVG 방식

> 💡
>
> SVG는 HTML처럼 태그로 도형을 그리는 방식임.
>
> 그린 도형들이 HTML 요소처럼 브라우저에 남아있음.

#### 동작원리

SVG(Scalable Vector Graphics)로 막대 3개를 그리면 이런 코드가 됨:

```jsx
<svg width="400" height="300">
  <rect x="10" y="200" width="30" height="100" fill="blue" />
  <rect x="50" y="150" width="30" height="150" fill="red" />
  <rect x="90" y="180" width="30" height="120" fill="green" />
</svg>
```

각 `<rect>` 태그가 막대 하나를 나타냄. HTML 요소처럼 브라우저가 이 구조를 기억하고 있음

이걸 “Retained Mode”렌더링이라고 함.
”Retain”은 유지하다라는 뜻이니까 “그린 내용을 유지하는 방식”이라고 이해하면 좋음.

- MDN 공식 문서에서 언급한 SVG 관련 내용:
    
    > "SVG is XML based, which means that every element is available within the SVG DOM. You can attach JavaScript event handlers for an element."
    > 
    > 
    > — MDN: [SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)
    > 

#### 브라우저 DevTools에서 보면

![](/images/articles/article18/02.webp)

F12 → Elements 탭에서 이렇게 보임. 
(막대가 하나하나 `<rect>` 태그로 존재하는 거 확인 가능)

각 막대를 클릭해서 선택할 수 있고, 속성도 직접 수정할 수 있음.

- 장점
    - 1. 개별 요소를 다루기 쉬움
        
        ```jsx
        // 첫 번째 막대 색상 바꾸기
        const bar = document.querySelector('rect');
        bar.setAttribute('fill', 'purple');
        
        // 클릭 이벤트 달기
        bar.addEventListener('click', () => {
          console.log('막대 클릭!');
        });
        ```
        
        ![](/images/articles/article18/03.webp)
        
    - 2. CSS 스타일 적용 가능
        
        ```jsx
        rect:hover {
          fill: orange;
        }
        ```
        
        ![](/images/articles/article18/04.webp)
        
    - 3. 확대해도 선명함
        
        ![](/images/articles/article18/05.webp)
        
- 단점
    - 데이터가 많으면 느려짐
        - 만약 데이터 1000개 → 브라우저가 관리해야 할 요소 1000개
        - 브라우저는 각 요소마다 메모리도 쓰고, 위치 계산도 해야함.
        - 그래서 데이터가 많아지면 급격히 느려짐.

#### 대표 라이브러리: Recharts

Recharts는 React 전용이고, SVG 방식으로 차트를 그림:

```jsx
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
];

function Chart() {
  return (
    <BarChart width={400} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
  );
}
```

![](/images/articles/article18/06.webp)

### Canvas 방식

> 💡
>
> Canvas는 그림판에 그림 그리듯이 픽셀을 직접 찍는 방식임. 
>
> 그리고 나면 브라우저는 그 내용을 기억하지 않음.

#### 동작 원리

Canvas로 막대 3개를 그리면:

```jsx
const canvas = document.getElementById('myChart');
const ctx = canvas.getContext('2d');  // "2D로 그릴 거야"

// 파란색 막대 그리기
ctx.fillStyle = 'blue';
ctx.fillRect(10, 200, 30, 100);  // x, y, 너비, 높이

// 빨간색 막대 그리기
ctx.fillStyle = 'red';
ctx.fillRect(50, 150, 30, 150);

// 초록색 막대 그리기
ctx.fillStyle = 'green';
ctx.fillRect(90, 180, 30, 120);
```

`getContext(’2d’)` 는 “이 캔버스에 2D그림을 그릴 준비를 해줘” 라는 의미임.
그 다음부터 `fillRect()` 같은 명령으로 도형을 그림.

**핵심뽀인트!**
그리는 순간 픽셀로 찍히고 끝.
브라우저는 “여기에 파란 막대다 있다”라는 걸 기억하지 않음.
그냥 픽셀 색깔만 바뀐 것.

이걸 “Immediate Mode” 렌더링이라고 함.
”Immediate”는 “즉시”라는 뜻으로, “즉시 그리고 끝내버리는 방식”으로 이해하면 됨.

- MDN 공식문서에서 언급한 canvas 관련 내용:
    
    > "Canvas provides a means for drawing graphics via JavaScript and the HTML `<canvas>` element."
    > 
    > 
    > — MDN: [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
    > 

#### 브라우저 DevTools에서 보면

![](/images/articles/article18/07.webp)

F12 → Elements 탭에서 이렇게 보임. 
(`<canvas>` 태그 하나만 보임. 막대 3개가 그려져 있지만, 브라우저는 그 내용을 모름. 그냥 하나의 그림일 뿐)

- 장점
    1. 성능이 좋음
        
        데이터 1000개를 그려도 브라우저가 관리할 요소는 오직 `<canvas>` 하나!
        그래서 데이터가 많아져도 비교적 완만하게 느려짐(대체로 데이터 개수에 비례함)
        
    2. 메모리 효율적
        
        최종 그림만 저장하면 되니까 메모리를 적게 씀.
        
- 단점
    1. 개별 요소를 다루기 어려움.
        
        “두번 째 막대 색 바꿔줘”라고 해도, 브라우저는 기억하고 있지 않음. (최종 그림만 기억하는 상태)
        전체를 지우고 처음부터 다시 그려야 함.
        
        ```jsx
        // 다시 그리려면
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // 전체 지우기
        // 처음부터 다시 그리기...
        ```
        
    2. 클릭 이벤트 처리 복잡
        
        막대를 클릭했는지 알려면 마우스 좌표를 직접 계산해야 함:
        
        ```jsx
        canvas.addEventListener('click', (e) => {
          const x = e.offsetX;
          const y = e.offsetY;
          
          // "이 좌표가 어느 막대 범위 안인지" 직접 계산...
          if (x >= 10 && x <= 40 && y >= 200) {
            console.log('첫 번째 막대 클릭');
          }
        });
        ```
        
        - 직접 계산 로직 추가해야 이벤트 처리되는 거 확인
            
            ![](/images/articles/article18/08.webp)
            
    - 3. 확대하면 깨짐
        
        Canvas는 픽셀 그림이라서 확대하면 뿌옇게 보임.
        
        ![](/images/articles/article18/09.webp)
        
        ![](/images/articles/article18/05.webp)
        
        ![](/images/articles/article18/10.webp)
        

#### 대표 라이브러리: Chart.js

chart.js는 Canvas 방식으로 차트를 그림.

Canvas 렌더링 덕분에 Chart.js는 특히 대용량 데이터셋과 복잡한 시각화에서 
뛰어난 성능을 보인다고 공식문서에서 Canvas를 선택한 이유도 설명하고 있음.

- Chart.js 의 공식문서에서 말하는 canvas 선택 이유:
    
    > "Chart.js renders chart elements on an HTML5 canvas... Canvas rendering makes Chart.js very performant, especially for large datasets and complex visualizations."
    > 
    > 
    > — Chart.js 공식 문서: [Performance](https://www.chartjs.org/docs/latest/general/performance.html)
    > 
    > 번역: 
    > "Canvas 렌더링 덕분에 Chart.js는 특히 대용량 데이터셋과 복잡한 시각화에서 뛰어난 성능을 보임."
    > 

```jsx
// react-chartjs-2로 테스트해본 코드
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const data = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
];

export default function App() {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: '#8884d8',
    }],
  };

  return ;
}
```

![](/images/articles/article18/11.webp)

- hover 이벤트도 걸려있는 거 확인..!
    
    ### 그런데 Chart.js 툴팁은 어떻게 동작하는 걸까?
    
    위에서 Canvas는 "DOM이 없어서 이벤트 처리가 복잡하다"고 했음.
    그런데 Chart.js로 만든 차트에 마우스를 올리면 툴팁이 잘 뜸.
    
    어떻게 된 걸까?!!
    
    **결론부터 말하면:**
    
    Canvas 차트에서 hover 툴팁은 
    라이브러리가 좌표 계산 + 히트 테스트 + 상태 관리를 전부 대신 해주는 것임.
    
    **Chart.js에서 hover 툴팁이 뜨는 실제 흐름:**
    
    ```
    [마우스 이동]
          ↓
    [마우스 좌표 계산]
          ↓
    [어느 데이터 영역 위인지 판단] - hit test
          ↓
    [해당 데이터 index 찾기]
          ↓
    [툴팁 내용 계산]
          ↓
    [툴팁을 Canvas에 "다시 그려서" 표시]
    
    ```
    
    이걸 **매 마우스 이동마다 반복.**
    
    **내부적으로는 이런 데이터가 저장:**
    
    Chart.js는 그림만 그리는 게 아니라, "그림을 그릴 때 쓴 계산 결과"를 JS 객체로 저장해둠.
    
    개념적으로는 이런 구조
    
    ```jsx
    bars = [
      {
        index: 0,
        label: 'Jan',
        value: 100,
        x: 40,
        y: 180,
        width: 40,
        height: 120,
      },
      {
        index: 1,
        label: 'Feb',
        value: 200,
        x: 100,
        y: 80,
        width: 40,
        height: 220,
      },
    ];
    ```
    
    **마우스가 움직일 때마다 이런 판단을 함:**
    
    ```jsx
    if (
      mouseX >= bar.x &&
      mouseX <= bar.x + bar.width &&
      mouseY >= bar.y &&
      mouseY <= bar.y + bar.height
    ) {
    	*// 이 막대 위에 있음 → 툴팁 표시*
    }
    ```
    
    **히트 테스트(hit test)** 라고 부름.
    
    **툴팁도 Canvas에 그린 그림임:**
    
    중요한 포인트
    
    - ❌ Chart.js 툴팁은 HTML 요소가 아님
    - ✅ Canvas 위에 텍스트/사각형을 다시 그린 것
    
    **즉, 툴팁이 뜰 때 내부적으로는:**
    
    1. 캔버스 전체 clear
    2. 막대 다시 그림
    3. hover 상태인 막대 강조
    4. 툴팁 박스 + 텍스트를 Canvas에 draw
    
    그래서 툴팁도 픽셀! 
    DOM에서 선택 불가능하고, CSS로 스타일링도 안 됨 (옵션으로만 가능).
    

### SVG vs Canvas 비교 요약

| 항목 | SVG | Canvas |
| --- | --- | --- |
| **렌더링 방식** | Retained Mode (유지) | Immediate Mode (즉시) |
| **DOM 구조** | 각 도형이 요소로 존재 | `<canvas>` 하나만 존재 |
| **성능 (데이터 많을 때)** | 급격히 느려짐 | 비교적 완만하게 느려짐 |
| **개별 요소 제어** | 쉬움 | 어려움 (직접 계산) |
| **이벤트 처리** | 요소에 직접 부착 | 좌표 계산 필요 |
| **확대** | 선명 | 깨짐 |
| **대표 라이브러리** | Recharts | Chart.js |

## 4. SVG vs Canvas vs Chart.js 비교

### 실습 목표

1. SVG와 Canvas의 렌더링 방식 차이를 직접 눈으로 확인
2. 데이터 개수에 따른 성능 차이를 숫자로 측정
3. DevTools로 DOM 구조 차이 비교

### 실습 파일

`3-panel-chart.html` 활용

<!-- TODO: 변환 못 한 블록 (첨부 파일 3-panel-chart-css.html) -->

### 실습 방법

#### Step 1: 데이터 10개

- 슬라이더를 10으로 설정
- F12 → Elements 탭에서 SVG 쪽에 `<rect>` 10개 있는지 확인
- Canvas 쪽은 `<canvas>` 하나만 있는지 확인
- 렌더링 시간은 셋 다 비슷함

#### Step 2: 데이터 300개

- 슬라이더를 300으로 설정
- SVG 쪽 렌더링 시간이 늘어나기 시작
- Elements 탭에서 `<rect>` 300개 확인

#### Step 3: 데이터 10000개

제가 직접해본 결과 기준..!

극단적인 확인을 위해 4x slowdown으로 확인해봄.

- `renderChartJS`: 449.1ms (전체의 77%) ← **가장 느림**
- `renderSVG`: 89.4ms (전체의 15%)
- `renderCanvas`: 8.1ms (전체의 1%) ← **가장 빠름**
    
    ![](/images/articles/article18/12.webp)
    

### 해석 방법

1. 타임라인 영역 (맨 위)

![](/images/articles/article18/13.webp)

이건 **시간 축**임. 왼쪽이 과거, 오른쪽이 미래. 슬라이더를 움직인 순간부터 렌더링이 끝날 때까지의 시간이 표시됨.

2. Frames 영역

![](/images/articles/article18/14.webp)

이건 **화면이 실제로 그려진 순간**을 보여줌.

- 네모 하나 = 화면이 한 번 갱신됨 (한 프레임)
- 네모 사이 간격이 넓으면 = 그 동안 화면이 멈춰있었다는 뜻 (버벅임)

스크린샷을 보면 프레임 사이 간격이 꽤 넓음. 10,000개 데이터를 처리하느라 화면이 잠깐 멈췄다는 의미임.

3. Main 영역

![](/images/articles/article18/15.webp)

이게 **실제로 어떤 코드가 실행됐는지** 보여주는 부분임.

**읽는 법:**

- 위에서 아래로 = 함수가 다른 함수를 호출한 순서
- 가로 길이 = 걸린 시간 (길수록 오래 걸림)

스크린샷에서 `renderChartJS`가 가장 긴 막대임. 449ms나 걸렸다는 뜻.

1. Call Tree (함수 호출 트리)

![](/images/articles/article18/16.webp)

**읽는 법:**

- **Self time:** 이 함수 자체가 쓴 시간 (다른 함수 호출 시간 제외)
- **Total time:** 이 함수 + 이 함수가 호출한 모든 함수의 시간 합계
- **퍼센트:** 전체 시간 중 차지하는 비율

#### 결과비교

- renderCanvas (8ms)가 빠른 이유:
    - Canvas는 그냥 픽셀만 찍으면 됨
    - fillRect() 10,000번 호출 → 끝
    - DOM 조작 없음, 레이아웃 계산 없음
- renderSVG (89ms)가 느린 이유:
    - SVG는 DOM 요소를 10,000개 만들어야 함
    - &lt;rect&gt; 10,000개 생성 → 브라우저가 각각 관리
    - 메모리 할당, 레이아웃 계산 필요
- renderChartJS (449ms)가 가장 느린 이유:
    - Chart.js는 단순히 막대만 그리는 게 아님
    - 기존 차트 삭제 (destroy)
    - 새 차트 인스턴스 생성 (constructor) ← 여기서 447ms!
    - 축, 레이블, 그리드, 애니메이션 설정 등
    - 10,000개 데이터에 대한 내부 처리
    
    > 스크린샷에서 `constructor`가 447.1ms인 게 보임. 
    Chart.js가 새 차트를 만드는 과정 자체가 오래 걸리는 것.
    > 

## 5. 실무 선택 기준

### React 프로젝트 + 데이터 수백 개 이하

#### 권장: Recharts (SVG)

- React 컴포넌트 방식이라 자연스러움
- 개별 요소에 이벤트 달기 쉬움
- 데이터가 적으면 성능 문제 없음

```jsx
<BarChart data={data}>
  <Bar dataKey="value" />
</BarChart>
```

### 대용량 데이터 / 실시간 업데이트

#### 권장: Chart.js (Canvas)

- 수천 개 데이터 처리 가능
- 실시간 업데이트 시 부드러움
- 주식 차트, 모니터링 대시보드에 적합

### 범용 프로젝트 (Vanilla JS / Vue / Angular)

#### 권장: Chart.js (Canvas)

- 2013년부터 있어서 안정적이고 자료가 많음
- 러닝커브 낮음
- 플러그인 생태계 풍부

---

### 참고 자료

#### 공식 문서

- [Chart.js 공식 문서](https://www.chartjs.org/docs/latest/)
- [Recharts 공식 문서](https://recharts.org/en-US/)
- [D3.js 공식 문서](https://d3js.org/)

#### MDN 문서

- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)
