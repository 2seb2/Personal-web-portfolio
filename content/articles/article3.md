---
id: "article3"
title: "페이지 생명주기와 데이터 전송 관련브라우저 API"
kinds: ["스터디"]
stacks: ["Browser API"]
date: "2026-01-17"
excerpt: "\"자주 쓰지는 않지만, 알면 유용한\" 브라우저 API 몇 가지를 알아봄. 특히 페이지 생명주기와 데이터 전송에 관련된 API들: 이 API들은..."
---

## 1. 오늘 다룰 브라우저 API들

"자주 쓰지는 않지만, 알면 유용한" 브라우저 API 몇 가지를 알아봄.

특히 **페이지 생명주기**와 **데이터 전송**에 관련된 API들:

| API | 용도 |
| --- | --- |
| **Page Visibility API** | 탭 활성화/비활성화 감지 |
| **Page Lifecycle API** | 페이지 생명주기 (freeze, discard) |
| **Beacon API** | 페이지 종료 시 안전한 데이터 전송 |

### 왜 이 API들을 알아야 할까?

이 API들은 단순히 "있다"가 아니라, **실제 서비스에서 사용자 경험과 데이터 정확도**에 직접적인 영향을 주기 때문에 알면 좋음

### 실제 서비스에서의 활용 사례

**동영상 자동 정지**

동영상을 재생하다가 다른 탭으로 이동할 때..!
설정에 따라 다르지만, 탭이 백그라운드로 가면 동영상이 일시정지되는 경우가 있음.
이게 Page Visibility API를 활용한 대표적인 예시.

**체류 시간 측정의 일반적인 방식**

웹 분석에서 "사용자가 페이지를 얼마나 봤는가"를 측정할 때,
단순히 페이지 로드 ~ 이탈 시간을 재면 부정확함.

사용자가 다른 탭을 보고 있었다면? 그건 진짜 "본" 시간이 아님!
그래서 Page Visibility API로 **실제로 탭이 보이는 시간만** 측정하는 게 권장됨.

**Beacon API - 애초에 분석 데이터 전송용으로 설계됨**

Beacon API는 이름부터가 "신호를 보내다"라는 뜻.
W3C 명세에서도 분석(analytics) 데이터 전송을 위해 만들어졌다고 명시하고 있음.

> W3C Beacon 명세:
"This specification defines an interface that web developers can use to schedule asynchronous and non-blocking delivery of data that minimizes resource contention with other time-critical operations."
— [W3C Beacon Specification](https://www.w3.org/TR/beacon/)

MDN에서도 명시적으로 analytics 용도를 언급함:

> MDN 공식 문서:
"The navigator.sendBeacon() method asynchronously sends an HTTP POST request containing a small amount of data to a web server. It's intended to be used for sending analytics data to a web server."
— [MDN: Navigator.sendBeacon()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)

---

## 2. Page Visibility API

### 왜 필요할까?

"사용자가 우리 페이지를 진짜 보고 있는가?"를 알고 싶을 때가 있음.

예를 들어:

- **체류 시간 측정**: 탭이 백그라운드면 체류 시간에서 제외해야 함
- **동영상 자동 재생**: 탭이 숨겨지면 일시정지
- **실시간 데이터**: 안 보고 있으면 API 호출 줄이기
- **리소스 절약**: 애니메이션, 폴링 등을 일시 중단

### 기본 사용법

```jsx
// 현재 상태 확인
console.log(document.visibilityState); // 'visible' | 'hidden'
console.log(document.hidden);          // true | false

// 상태 변경 감지
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('탭이 숨겨짐');
  } else {
    console.log('탭이 다시 보임');
  }
});
```

> MDN 공식 문서:
"The Document.visibilityState read-only property returns the visibility of the document."
— [MDN: Document.visibilityState](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState)

### visibilityState의 종류

| 값 | 의미 |
| --- | --- |
| `visible` | 페이지가 보이는 상태 (포그라운드 탭) |
| `hidden` | 페이지가 숨겨진 상태 (백그라운드 탭, 최소화 등) |

### 언제 hidden이 되는가?

- 다른 탭으로 전환
- 브라우저 최소화
- 다른 창이 위로 올라옴
- 모바일에서 앱 전환
- 화면 잠금

> 💡
>
> ### 참고: prerender는 뭐였나? (deprecated)
>
> 예전에는 `visibilityState`에 `prerender`라는 값도 있었음.
>
> **prerender란?**
>
> 브라우저가 사용자가 다음에 방문할 것 같은 페이지를 **미리 렌더링**해두는 상태였음.
> 예를 들어 검색 결과에서 첫 번째 링크를 미리 그려두면, 클릭했을 때 즉시 보여줄 수 있음.
>
> **deprecated된 이유:**
>
> - 실제로 방문하지 않을 페이지를 렌더링하면 **리소스 낭비**
> - 광고나 분석 스크립트가 실행되면서 **잘못된 데이터** 수집 (방문 안 했는데 방문으로 찍힘)
> - 개인정보 문제 (방문 의도 없는 페이지에서 쿠키 등이 동작)
>
> 현재는 `<link rel="prerender">`가 대부분 브라우저에서 무시되거나,
> [Speculation Rules API](https://developer.chrome.com/docs/web-platform/prerender-pages) 같은 새로운 방식으로 대체되고 있음.

---

### 브라우저가 백그라운드 탭을 어떻게 처리하나?

여기가 중요한 포인트!

- **포그라운드 탭** = 지금 보고 있는 문서 → 원래 속도
- **백그라운드 탭** = 최소화해둔 다른 문서 → 어차피 안 보니까 천천히

브라우저도 마찬가지. 
사용자가 안 보고 있는 탭은 **배터리와 CPU를 아끼기 위해 일부러 느리게 동작**시킴.

이걸 **"throttle(쓰로틀)"**이라고 하고, 
**백그라운드 탭의 실행 속도를 의도적으로 제한함.**

> Chrome 공식 문서:
"Background tabs have their timers throttled to only fire at most once per second."
— [Chrome Developers: Background Tabs](https://developer.chrome.com/blog/background-tabs/)

**구체적으로 어떻게 제한되나?**

`setInterval(() => {}, 100)`으로 "100ms마다 실행해줘"라고 했어도:

| 탭 상태 | 실제 실행 간격 |
| --- | --- |
| 보고 있을 때 (visible) | 100ms (요청대로) |
| 다른 탭 보는 중 (hidden) | 최소 1000ms (1초)로 강제 늘어남 |
| 오래 방치됨 | 최대 60000ms (1분)까지 늘어남 |
| frozen | 타이머 완전 정지 |

**왜 이게 중요?**

만약 체류 시간을 이렇게 측정했다면:

```jsx
let seconds = 0;
setInterval(() => { seconds++; }, 1000);
```

사용자가 10초 동안 다른 탭을 보다 돌아오면?

- 예상: `seconds = 10`
- 실제: `seconds`가 10보다 훨씬 적을 수 있음 (throttle 때문에)

**→ 그래서 타이머 대신 `visibilitychange` 이벤트를 써야 정확함!**

// visible 일 때 기록, hidden일 때 기록 중지

간단하게 직접 확인해보기(아래)

---

### 실습 1: 타이머 throttling 직접 확인하기

**실습 목적:**

- `setInterval`이 백그라운드에서 어떻게 동작하는지 **직접 확인**
- "왜 타이머로 체류 시간을 측정하면 안 되는지" 눈으로 확인해보기
- Page Visibility API의 필요성 이해

**실습 범위:**

> ℹ️ 이 실습은 throttling 현상 확인이 목적임.
코드는 최대한 단순하게 작성됐고, 실제 프로덕션 코드와는 다름.

- timer-test.html
    
    ```jsx
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>Timer Throttling 테스트</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .controls { margin-bottom: 16px; }
        button {
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          margin-right: 8px;
        }
        #log { 
          height: 400px; 
          overflow-y: auto; 
          border: 1px solid #ccc; 
          padding: 10px;
          font-family: monospace;
          font-size: 12px;
        }
        .hidden { color: red; }
        .visible { color: green; }
        .status-box {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-weight: bold;
        }
        .status-box.visible { background: #d4edda; color: #155724; }
        .status-box.hidden { background: #f8d7da; color: #721c24; }
      </style>
    </head>
    <body>
      <h1>Timer Throttling 테스트</h1>
      <p>이 탭을 열어두고 <strong>다른 탭으로 이동</strong>해보세요!</p>
      
      <div id="statusBox" class="status-box visible">
        현재 상태: visible (탭이 보이는 중)
      </div>
    
      <div class="controls">
        <button id="toggleBtn">⏸️ 로그 일시정지</button>
        <button id="clearBtn">🗑️ 로그 지우기</button>
      </div>
    
      <div id="log"></div>
    
      <script>
        // ========================================
        // 요소 가져오기
        // ========================================
        const logEl = document.getElementById('log');
        const statusBox = document.getElementById('statusBox');
        const toggleBtn = document.getElementById('toggleBtn');
        const clearBtn = document.getElementById('clearBtn');
    
        // ========================================
        // 상태 변수
        // ========================================
        let lastTime = Date.now();
        let count = 0;
        let isPaused = false;
    
        // ========================================
        // 핵심: 100ms마다 실행되는 타이머
        // ========================================
        setInterval(() => {
          if (isPaused) return; // 일시정지 상태면 로그 안 찍음
    
          const now = Date.now();
          const elapsed = now - lastTime;  // 실제로 몇 ms 지났는지 계산
          lastTime = now;
          count++;
    
          // 현재 탭 상태 확인
          const isHidden = document.hidden;
          const className = isHidden ? 'hidden' : 'visible';
          const stateText = isHidden ? '[HIDDEN]' : '[VISIBLE]';
    
          // 로그 출력
          const logLine = document.createElement('div');
          logLine.className = className;
          logLine.textContent = 
            `${count}번째 | 실제 간격: ${elapsed}ms | ${stateText}`;
          
          logEl.appendChild(logLine);
          logEl.scrollTop = logEl.scrollHeight;
        }, 100);
    
        // ========================================
        // 탭 상태 변경 감지
        // ========================================
        document.addEventListener('visibilitychange', () => {
          const isHidden = document.hidden;
          
          // 상태 박스 업데이트
          statusBox.className = `status-box ${isHidden ? 'hidden' : 'visible'}`;
          statusBox.textContent = isHidden 
            ? '현재 상태: hidden (다른 탭 보는 중)' 
            : '현재 상태: visible (탭이 보이는 중)';
    
          // 상태 변경 로그
          if (!isPaused) {
            const logLine = document.createElement('div');
            logLine.style.fontWeight = 'bold';
            logLine.style.backgroundColor = '#ffffcc';
            logLine.style.padding = '4px';
            logLine.textContent = `>>> 상태 변경: ${document.visibilityState} <<<`;
            logEl.appendChild(logLine);
          }
        });
    
        // ========================================
        // 버튼 이벤트
        // ========================================
        toggleBtn.addEventListener('click', () => {
          isPaused = !isPaused;
          toggleBtn.textContent = isPaused ? '▶️ 로그 재개' : '⏸️ 로그 일시정지';
        });
    
        clearBtn.addEventListener('click', () => {
          logEl.innerHTML = '';
          count = 0;
        });
      </script>
    </body>
    </html>
    ```
    

### 코드 해설

**핵심 부분만 보면:**

```jsx
// 1. 100ms마다 실행되는 타이머
setInterval(() => {
  const elapsed = now - lastTime;  // 실제로 몇 ms 지났는지 계산
  lastTime = now;
  // elapsed가 100ms보다 훨씬 크면 → throttle된 것!
}, 100);

// 2. 탭 상태 변경 감지
document.addEventListener('visibilitychange', () => {
  // document.hidden = true면 백그라운드
});
```

**왜 `elapsed`를 계산하나?**

- 우리가 요청한 건 "100ms마다 실행"
- 하지만 백그라운드에서는 브라우저가 강제로 늦춤
- `elapsed`가 1000ms 이상이면 → throttle이 적용된 것!

### 실습 순서

1. 파일을 브라우저에서 열기
2. 로그가 약 100ms 간격으로 찍히는 것 확인
3. **다른 탭으로 이동** (이 탭을 백그라운드로)
4. 10초 정도 기다린 후 다시 돌아오기
5. **"로그 일시정지" 버튼**을 눌러서 로그 멈추기
6. 스크롤해서 **실제 간격**이 1000ms 이상으로 늘어난 것 확인

**예상 결과:**

```jsx
1번째 | 실제 간격: 102ms | [VISIBLE]
2번째 | 실제 간격: 101ms | [VISIBLE]
3번째 | 실제 간격: 99ms  | [VISIBLE]
>>> 상태 변경: hidden <<<
4번째 | 실제 간격: 1004ms | [HIDDEN]  ← 1초로 throttle됨!
5번째 | 실제 간격: 1001ms | [HIDDEN]
>>> 상태 변경: visible <<<
6번째 | 실제 간격: 98ms  | [VISIBLE]  ← 다시 정상
```

### 이 실습에서 확인할 것

| 확인 포인트 | 예상 결과 |
| --- | --- |
| visible 상태에서 간격 | 약 100ms (요청대로) |
| hidden 상태에서 간격 | 약 1000ms 이상 (throttle됨) |
| 상태 변경 감지 | visibilitychange 이벤트 발생 |

---

## 3. Page Lifecycle API

### 왜 이 API가 생겼나?

모바일 앱(iOS/Android)에는 원래 **"앱 생명주기"** 개념이 있었음:

- 앱이 백그라운드로 가면 → 일시정지
- 메모리 부족하면 → 강제 종료

**웹에는 이런 개념이 없었음.** 
탭을 아무리 많이 열어도 브라우저가 알아서 관리했음.

그런데 웹도 점점 복잡해지면서:

- 탭 수십 개 열어두면 → 메모리 부족
- 모바일 브라우저에서 → 배터리 문제

그래서 **브라우저가 웹 페이지도 "정지(freeze)"하거나 "폐기(discard)"할 수 있게** 됨.
Page Lifecycle API는 이때 "정지되기 전에 상태 저장"하게 하는 것.

> Google Developers 문서:
"The Page Lifecycle API brings app lifecycle features common on mobile operating systems to the web."
— [Page Lifecycle API](https://developer.chrome.com/blog/page-lifecycle-api/)

**모바일만 해당되나?**

아니다! 
데스크톱 Chrome도 탭이 많으면 오래된 탭을 freeze/discard함.
다만 모바일에서 더 자주 발생할 뿐.

### 페이지 상태 흐름

```jsx
[Active] ←→ [Passive] ←→ [Hidden] ←→ [Frozen] → [Discarded]
   ↑                                                    ↓
   └────────────────────────────────────────────────────┘
                    (다시 방문하면)
```

| 상태 | 설명 | 예시 |
| --- | --- | --- |
| **Active** | 페이지가 보이고, 포커스도 있음 | 현재 보고 있는 탭 |
| **Passive** | 페이지가 보이지만, 포커스 없음 | 다른 창 클릭했을 때 |
| **Hidden** | 페이지가 안 보임 | 다른 탭으로 전환 |
| **Frozen** | 완전히 정지됨 (CPU 사용 X) | 브라우저가 리소스 회수 |
| **Discarded** | 메모리에서 제거됨 | 모바일에서 메모리 부족 시 |

### freeze와 discard

**언제 발생하나?**

- `freeze`: 브라우저가 "이 탭 잠시 멈출게" 하기 직전
- `resume`: 멈췄던 탭이 다시 활성화될 때
- `discard`: 브라우저가 메모리 확보를 위해 탭 내용을 완전히 버릴 때

```jsx
// freeze: 페이지가 얼려질 때 (정지 직전)
document.addEventListener('freeze', () => {
  // 여기서 상태를 저장해야 함!
  // freeze 후에는 JS가 안 돌아가니까, 지금 저장해야 함!
  saveState();
});

// resume: frozen에서 다시 깨어날 때
document.addEventListener('resume', () => {
  // 상태 복구
  restoreState();
});
```

**왜 이 코드가 필요?**

freeze되면 `setTimeout`, `fetch` 등 **모든 JS 실행이 멈춤**.
그래서 freeze 이벤트에서 "지금 하던 작업 상태"를 저장해둬야 나중에 복구 가능.

### 실습: chrome://discards/로 freeze 테스트하기

일반적인 사용 중에는 freeze가 거의 발생하지 않음.
하지만 Chrome에서는 **강제로 freeze**시켜서 테스트할 수 있음!

- **freeze-test.html**
    
    ```jsx
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>Freeze/Resume 테스트</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 40px;
          max-width: 600px;
          margin: 0 auto;
        }
        #log {
          height: 300px;
          overflow-y: auto;
          border: 1px solid #ccc;
          padding: 12px;
          font-family: monospace;
          font-size: 13px;
          background: #1e1e1e;
          color: #d4d4d4;
          border-radius: 8px;
        }
        .freeze { color: #569cd6; }
        .resume { color: #4ec9b0; }
        .visibility { color: #dcdcaa; }
        .info-box {
          background: #e8f4fd;
          border-left: 4px solid #2196F3;
          padding: 16px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <h1>🥶 Freeze/Resume 테스트</h1>
      
      <div class="info-box">
        <strong>테스트 방법:</strong>
        <ol>
          <li>이 탭을 열어둔 상태로 <strong>새 탭</strong>에서 <code>chrome://discards/</code> 입력</li>
          <li>이 페이지를 찾아서 <strong>"Freeze"</strong> 버튼 클릭</li>
          <li>다시 이 탭으로 돌아오기</li>
          <li>아래 로그에서 freeze/resume 이벤트 확인!</li>
        </ol>
      </div>
    
      <h3>📋 이벤트 로그</h3>
      <div id="log"></div>
    
      <script>
        const logEl = document.getElementById('log');
    
        function log(message, type = 'info') {
          const time = new Date().toLocaleTimeString();
          const line = document.createElement('div');
          line.className = type;
          line.textContent = `[${time}] ${message}`;
          logEl.appendChild(line);
          logEl.scrollTop = logEl.scrollHeight;
          
          // 콘솔에도 출력 (freeze 후 확인용)
          console.log(`[${time}] ${message}`);
        }
    
        // ========================================
        // Page Lifecycle API 이벤트
        // ========================================
        document.addEventListener('freeze', () => {
          log('🥶 freeze 이벤트 발생! (탭이 얼려짐)', 'freeze');
        });
    
        document.addEventListener('resume', () => {
          log('🔥 resume 이벤트 발생! (탭이 깨어남)', 'resume');
        });
    
        // ========================================
        // 비교용: Page Visibility API 이벤트
        // ========================================
        document.addEventListener('visibilitychange', () => {
          log(`👁️ visibilitychange: ${document.visibilityState}`, 'visibility');
        });
    
        // 초기 로그
        log('페이지 로드 완료');
        log('chrome://discards/ 에서 이 탭을 freeze 해보세요!');
      </script>
    </body>
    </html>
    ```
    

### 실습 순서

1. 위 파일을 브라우저(Chrome)에서 열기
2. **새 탭**에서 주소창에 `chrome://discards/` 입력
3. 탭 목록에서 "Freeze/Resume 테스트" 페이지 찾기
4. **Actions** 열에서 **"Freeze"** 클릭
5. 다시 테스트 탭으로 돌아오기
6. 로그에서 이벤트 확인!

**예상 결과:**

```jsx
[10:30:15] 페이지 로드 완료
[10:30:15] chrome://discards/ 에서 이 탭을 freeze 해보세요!
[10:30:20] 👁️ visibilitychange: hidden
[10:30:25] 🥶 freeze 이벤트 발생! (탭이 얼려짐)
[10:31:00] 🔥 resume 이벤트 발생! (탭이 깨어남)
[10:31:00] 👁️ visibilitychange: visible
```

> ⚠️ Chrome 전용!freeze/resume 이벤트는 Chrome 68+ 에서만 지원됨.
Safari, Firefox에서는 이 이벤트가 발생하지 않음.

### 실무에서의 위치

> ℹ️ 참고: Page Lifecycle API는 개념 이해용으로 중요하지만, 실제 실무에서는 Page Visibility + pagehide 조합이 더 많이 사용됨.
> 

**이유:**

- `freeze`/`resume` 이벤트는 **브라우저 지원이 제한적** (Chrome 위주)
- Safari, Firefox에서는 지원이 불완전하거나 동작이 다름
- 대부분의 use case는 `visibilitychange` + `pagehide`(페이지떠날때)로 커버 가능

**언제 Page Lifecycle API가 의미 있나?**

- 모바일 웹뷰에서 앱 전환 시 상태 보존이 중요한 경우
- PWA(Progressive Web App)에서 리소스 관리
- 메모리가 부족한 환경에서 **부드럽게 대응하기** (갑자기 죽지 않고, 점진적으로 기능을 줄여나가기)

---

## 4. 페이지 종료 이벤트들

페이지를 떠날 때 발생하는 이벤트들이 여러 개 있음.

### 이벤트 발생 순서

```bash
사용자가 페이지를 떠남
        ↓
   beforeunload (취소 가능)
        ↓
     pagehide
        ↓
      unload (사용 비권장)
```

### 각 이벤트의 용도

**beforeunload** - 사용자에게 확인 창 띄우기

// 페이지를 떠나시겠습니까? 저장되지 않은 변경 사항이 있습니다. 이런 confirm박스가 흔했지만 지금은 **브라우저가 UX 이유로 거의 막아버려 확인이 거의 어려움**

```jsx
window.addEventListener('beforeunload', (e) => {
  // 저장하지 않은 변경사항이 있을 때
  e.preventDefault();
  e.returnValue = ''; // 이게 있어야 확인 창이 뜸
});
```

**pagehide** - 페이지를 떠날 때 (권장)

// e.persisted는 브라우저가 bfcache에 넣었는지 여부, 브라우저가 pagehide시에 자동으로 bfcache에 저장하기는 하지만 조건부로 저장함

- unload 없나?
- beforeunload 없나?
- 이벤트 리스너 막는거 없나?
- fetch/웹소켓 오픈 안됐나?
- SW/SharedWorker 고정하지 않았나?
- cross-site disabled 옵션 없음?
- iframe 정책 조건 맞나?

이런 조건 등 고려

```jsx
window.addEventListener('pagehide', (e) => {
  if (e.persisted) {
    // bfcache에 저장됨 - 나중에 복원될 수 있음
    console.log('bfcache에 저장');
  } else {
    // 진짜 종료
    console.log('페이지 종료');
  }
});
```

**unload** - 페이지가 완전히 언로드될 때 (사용 비권장!)

```bash
// ❌ 이렇게 쓰면 놉!
window.addEventListener('unload', () => {
  // ...
});
```

### 왜 unload를 쓰면 안 되는가? (bfcache)

> MDN 공식 문서:
"The unload event is fired when the document or a child resource is being unloaded... Warning: Developers should avoid using this event."
— [MDN: unload event](https://developer.mozilla.org/en-US/docs/Web/API/Window/unload_event)

**bfcache(Back-Forward Cache)란?**

브라우저가 페이지를 메모리에 저장해뒀다가, 뒤로가기/앞으로가기 시 **즉시 복원**하는 기능.

**오해하기 쉬운 부분:**

unload 리스너가 있어도 **뒤로가기/앞으로가기는 됨!**
다만 **속도가 느려지는 것**.

| unload 리스너 | 뒤로가기 동작 |
| --- | --- |
| 없음 | bfcache에서 즉시 복원 (빠름!) |
| 있음 | 페이지 전체를 다시 로드 (느림) |

**왜 unload가 있으면 bfcache가 잘 안 되나?**

bfcache는 페이지 상태를 "그대로" 저장해뒀다가 복원하는 건데,
`unload` 리스너가 있다는 건 "페이지 떠날 때 뭔가 정리 작업을 한다"는 뜻.

브라우저 입장에서는:

- "정리 작업 했는데 다시 복원하면 꼬이지 않을까?"
- "그냥 안전하게 새로 로드하자"

> web.dev 문서:
"Never use the unload event... pages that use unload handlers are never put into the back/forward cache."
— [web.dev: bfcache](https://web.dev/bfcache/)

**결론:** `unload` 대신 `pagehide`를 사용하자! (pagehide는 bfcache와 호환됨)

### visibilitychange + pagehide를 같이 쓰는 이유

**visibilitychange만 쓰면?**

```jsx
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    sendData();  // 탭이 숨겨질 때 전송
  }
});
```

**문제:** 사용자가 **탭을 바로 닫으면** visibilitychange가 발생 안 할 수 있음!

**pagehide를 추가하면?**

```jsx
window.addEventListener('pagehide', () => {
  sendData();  // 페이지를 떠날 때 전송
});
```

`pagehide`는 **페이지를 떠나는 모든 경우**에 발생:

- 탭 닫기
- 다른 페이지로 이동
- 새로고침

**정리:**

| 이벤트 | 발생 시점 |
| --- | --- |
| visibilitychange | 탭 전환 (숨김/보임) |
| pagehide | 페이지를 완전히 떠날 때 |

→ 둘 다 써야 **탭 전환 + 페이지 이탈** 모두 커버됨.

```jsx
// 완전한 예시
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    saveProgress();  // 탭 숨겨질 때 저장
  }
});

window.addEventListener('pagehide', () => {
  sendFinalData();  // 페이지 떠날 때 전송
});
```

---

## 5. Beacon API

### 왜 필요할까? (fetch의 한계)

페이지를 떠날 때 서버로 데이터를 보내고 싶다면..!

```jsx
// ❌ 이렇게 하면 안 됨!
window.addEventListener('pagehide', () => {
  fetch('/api/log', {
    method: 'POST',
    body: JSON.stringify({ event: 'leave' })
  });
  // 페이지가 종료되면서 요청이 취소될 수 있음!
});
```

**왜 안 될까?**

1. 사용자가 링크를 클릭하거나 탭을 닫음
2. 브라우저가 페이지 종료 시작
3. `fetch` 요청이 보내지기 전에 페이지 컨텍스트가 사라짐
4. **요청이 취소됨**

### 기본 사용법

```jsx
window.addEventListener('pagehide', () => {
  const data = JSON.stringify({
    event: 'page_leave',
    timestamp: Date.now()
  });
  
  navigator.sendBeacon('/api/log', data);
  // 페이지가 종료되어도 요청이 전송됨!
});
```

### Beacon이 보장되는 원리

```jsx
[일반 fetch]
fetch() 호출 → 페이지 종료 시작 → 요청 취소됨 ❌

[Beacon API]
sendBeacon() 호출 → 브라우저 내부 큐에 저장 → 페이지 종료 → 브라우저가 나중에 전송 ✅
```

**핵심:** 브라우저가 요청을 이어받아 페이지와 별개로 처리함.

### 제약사항

```jsx
// 1. POST만 가능
navigator.sendBeacon('/api', data); // 항상 POST

// 2. Content-Type 제한
// - text/plain (기본)
// - application/x-www-form-urlencoded
// - multipart/form-data
// ❌ application/json은 직접 설정 불가!

// 3. 용량 제한: 약 64KB

// 4. 반환값: boolean (큐에 들어갔는지 여부)
const queued = navigator.sendBeacon('/api', data);
if (!queued) {
  console.error('Beacon 전송 실패 - 큐가 꽉 찼거나 데이터가 너무 큼');
}
```

**Content-Type 문제 해결:**

서버에서 `text/plain`으로 받은 후 JSON 파싱하거나, `Blob`을 사용:

```jsx
const data = JSON.stringify({ event: 'leave' });
const blob = new Blob([data], { type: 'application/json' });
navigator.sendBeacon('/api/log', blob);
```

### fetch keepalive와 비교

```jsx
// Beacon API
navigator.sendBeacon('/api/log', data);

// fetch with keepalive (비슷한 효과)
fetch('/api/log', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: { 'Content-Type': 'application/json' },
  keepalive: true  // 페이지 종료 후에도 요청 유지
});
```

|  | Beacon API | fetch keepalive |
| --- | --- | --- |
| 메서드 | POST만 | 모든 메서드 |
| 헤더 설정 | 제한적 | 자유로움 |
| 용량 제한 | 64KB | 64KB |
| 브라우저 지원 | 좋음 | 좋음 (최신) |
| 사용 편의성 | 간단 | 유연 |

> MDN 공식 문서:
"The keepalive option can be used to allow the request to outlive the page."
— [MDN: fetch() keepalive](https://developer.mozilla.org/en-US/docs/Web/API/fetch#keepalive)

// fetch keepalive는 unload-safe를 위한 “전달 허용(flag)” 옵션일 뿐이고, BFCache나 네트워크 스케줄링·OS suspend·백그라운드 전환까지 포함한 전체 lifecycle 최적화는 거의 고려하지 않음.

반대로 Beacon은 그걸 고려하도록 설계된 전용 채널이기때문에 항상 fetch keepalive를 사용해야하는 건 아니고, 목적과 의도에 따라 맞는 걸 쓰면 됨!

ex. 퇴장 로깅-beacon, api처리확장-fetch keepalive

---

## 6. 실습 2: 동영상 자동 재생/정지

### 실습 목적

- Page Visibility API의 **가장 직관적인 활용 사례** 체험
- 실제 서비스에서 사용하는 패턴 구현
- 시각적으로 바로 확인 가능 (동영상이 멈추는 게 보임)

### 실습 범위

> ℹ️ 이 실습은 Page Visibility API 동작 원리 이해가 목적임.
실제 프로덕션에서는 사용자 설정(백그라운드 재생 허용), 오디오/비디오 분리 처리 등 추가 고려사항이 있음.

- **video-visibility.html**
    
    ```jsx
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>동영상 자동 재생/정지</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          background: #1a1a1a;
          color: white;
        }
        .video-container {
          position: relative;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
        }
        video {
          width: 100%;
          display: block;
        }
        .status-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
        }
        .status-badge.playing { background: #4CAF50; }
        .status-badge.paused { background: #f44336; }
        .info-card {
          background: #2d2d2d;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }
        #log {
          height: 150px;
          overflow-y: auto;
          font-family: monospace;
          font-size: 12px;
          background: #1e1e1e;
          padding: 12px;
          border-radius: 8px;
          margin-top: 12px;
        }
        .log-pause { color: #f48771; }
        .log-play { color: #89d185; }
        .log-visibility { color: #569cd6; }
      </style>
    </head>
    <body>
      <h1>🎬 동영상 자동 재생/정지</h1>
      <p>다른 탭으로 이동하면 동영상이 자동으로 일시정지됩니다.</p>
      
      <div class="video-container">
        <video id="video" controls>
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
          브라우저가 비디오를 지원하지 않습니다.
        </video>
        <div id="statusBadge" class="status-badge paused">일시정지</div>
      </div>
    
      <div class="info-card">
        <h3>📊 상태 정보</h3>
        <p>탭 상태: <strong id="visibilityStatus">visible</strong></p>
        <p>동영상 상태: <strong id="videoStatus">paused</strong></p>
        <p>자동 정지 횟수: <strong id="autoPauseCount">0</strong></p>
        
        <h4>📋 이벤트 로그</h4>
        <div id="log"></div>
      </div>
    
      <script>
        // ========================================
        // 요소 가져오기
        // ========================================
        const video = document.getElementById('video');
        const statusBadge = document.getElementById('statusBadge');
        const visibilityStatus = document.getElementById('visibilityStatus');
        const videoStatus = document.getElementById('videoStatus');
        const autoPauseCount = document.getElementById('autoPauseCount');
        const logEl = document.getElementById('log');
    
        // ========================================
        // 상태 변수
        // ========================================
        let pauseCount = 0;
        let wasPlayingBeforeHidden = false;
    
        // ========================================
        // 유틸 함수
        // ========================================
        function log(message, type = 'info') {
          const time = new Date().toLocaleTimeString();
          const line = document.createElement('div');
          line.className = `log-${type}`;
          line.textContent = `[${time}] ${message}`;
          logEl.appendChild(line);
          logEl.scrollTop = logEl.scrollHeight;
        }
    
        function updateBadge() {
          const isPlaying = !video.paused;
          statusBadge.textContent = isPlaying ? '재생 중' : '일시정지';
          statusBadge.className = `status-badge ${isPlaying ? 'playing' : 'paused'}`;
          videoStatus.textContent = isPlaying ? 'playing' : 'paused';
        }
    
        // ========================================
        // 동영상 이벤트
        // ========================================
        video.addEventListener('play', () => {
          updateBadge();
          log('▶️ 동영상 재생', 'play');
        });
    
        video.addEventListener('pause', () => {
          updateBadge();
          log('⏸️ 동영상 일시정지', 'pause');
        });
    
        // ========================================
        // ✨ 핵심: Page Visibility API
        // ========================================
        document.addEventListener('visibilitychange', () => {
          visibilityStatus.textContent = document.visibilityState;
          log(`👁️ 탭 상태 변경: ${document.visibilityState}`, 'visibility');
    
          if (document.hidden) {
            // 탭이 숨겨짐 → 재생 중이었다면 일시정지
            if (!video.paused) {
              wasPlayingBeforeHidden = true;  // 재생 중이었다고 기록
              video.pause();
              pauseCount++;
              autoPauseCount.textContent = pauseCount;
              log('🔄 자동 일시정지 (탭 숨김)', 'pause');
            } else {
              wasPlayingBeforeHidden = false;
            }
          } else {
            // 탭이 다시 보임 → 이전에 재생 중이었다면 다시 재생
            if (wasPlayingBeforeHidden) {
              video.play();
              log('🔄 자동 재생 (탭 복귀)', 'play');
            }
          }
        });
    
        // 초기 로그
        log('페이지 로드 완료. 동영상을 재생하고 다른 탭으로 이동해보세요!');
      </script>
    </body>
    </html>
    ```
    

### 코드 해설

**핵심 로직**

```jsx
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // 탭이 숨겨짐
    if (!video.paused) {
      wasPlayingBeforeHidden = true;  // 재생 중이었다고 기록
      video.pause();                   // 일시정지
    }
  } else {
    // 탭이 다시 보임
    if (wasPlayingBeforeHidden) {
      video.play();                    // 다시 재생
    }
  }
});
```

**`wasPlayingBeforeHidden` 플래그가 필요한 이유:**

- 탭이 숨겨지기 전에 이미 일시정지 상태였다면, 돌아왔을 때 자동 재생하면 안 됨
- 사용자가 직접 일시정지한 것인지, 자동으로 정지된 것인지 구분 필요

### 실습 순서

1. 파일을 브라우저에서 열기
2. 동영상 재생 버튼 클릭
3. **다른 탭으로 이동**
4. 동영상이 자동으로 일시정지되는 것 확인
5. **다시 이 탭으로 돌아오기**
6. 동영상이 자동으로 재생되는 것 확인
7. 로그에서 이벤트 순서 확인

---

## 7. 실습 3: 폼 입력 자동 저장

### 실습 목적

- Beacon API의 **"페이지 종료 시 안전한 전송"** 특성 체험
- 실용적인 UX 패턴 (Gmail같은 임시저장 같은) 구현
- pagehide + Beacon 조합 이해

### 실습 범위

> ℹ️ 이 실습은 Beacon API 동작 원리 이해가 목적임.
전송 확인은 webhook.site라는 무료 서비스를 사용함.
프로덕션에서는 실제 서버 엔드포인트, 에러 핸들링, 개인정보 고려 등이 추가로 필요함.

### 사전 준비: webhook.site 설정

Beacon 요청이 실제로 전송되는지 확인하려면 받아줄 서버가 필요함.
**webhook.site**는 임시 URL을 만들어서 요청을 받아볼 수 있는 무료 서비스.

1. [https://webhook.site](https://webhook.site/) 접속
2. 자동으로 **고유 URL**이 생성됨 (예: `https://webhook.site/abc-123-def-456`)
    1. https://webhook.site/#!/view/466ce443-19b3-478b-8276-bb6cc8db0ee2/47102c51-baba-4286-9774-237048ffd1f0/1
3. 이 URL을 복사해둠
4. 코드에서 `API_ENDPOINT`를 복사한 URL로 변경

> ⚠️ 왜 webhook.site를 쓰나?
Beacon은 "fire-and-forget" 방식이라 페이지가 종료된 후 브라우저가 별도로 전송함.
그래서 Network 탭에서는 안 보일 수 있음! 실제 서버로 보내야 확실하게 확인 가능.

// webhook.site: 외부에서 HTTP 요청을 보내면 그 요청 내용을 바로 확인할 수 있게 해주는 서비스

// fire and forget: 요청만 보내고 응답은 신경쓰지 않는 방식

- **form-autosave.html**
    
    ```jsx
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>폼 입력 자동 저장</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          padding: 40px;
          max-width: 600px;
          margin: 0 auto;
          background: #f5f5f5;
        }
        .form-card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { margin-top: 0; color: #333; }
        .form-group { margin-bottom: 20px; }
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #555;
        }
        input, textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        }
        textarea { height: 150px; resize: vertical; }
        input:focus, textarea:focus {
          outline: none;
          border-color: #4A90D9;
          box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1);
        }
        .status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #e8f4e8;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .status-bar.warning { background: #fff3cd; }
        .info-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        #log {
          height: 120px;
          overflow-y: auto;
          font-family: monospace;
          font-size: 12px;
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 12px;
          border-radius: 8px;
          margin-top: 12px;
        }
        .log-save { color: #89d185; }
        .log-beacon { color: #569cd6; }
        .log-visibility { color: #dcdcaa; }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .badge.local { background: #e3f2fd; color: #1565c0; }
        .badge.beacon { background: #e8f5e9; color: #2e7d32; }
      </style>
    </head>
    <body>
      <div class="form-card">
        <h1>📝 글 작성하기</h1>
        
        <div id="statusBar" class="status-bar">
          <span>💾</span>
          <span id="statusText">입력 내용은 자동으로 저장됩니다.</span>
        </div>
    
        <div class="form-group">
          <label for="title">제목</label>
          <input type="text" id="title" placeholder="제목을 입력하세요">
        </div>
    
        <div class="form-group">
          <label for="content">내용</label>
          <textarea id="content" placeholder="내용을 입력하세요..."></textarea>
        </div>
    
        <p style="color: #888; font-size: 14px;">
          💡 입력 후 <strong>탭을 닫거나 다른 페이지로 이동</strong>해보세요.<br>
          Beacon API로 입력 내용이 서버에 전송됩니다.
        </p>
      </div>
    
      <div class="info-card">
        <h3>📊 저장 방식</h3>
        <p>
          <span class="badge local">localStorage</span> 
          실시간 저장 (타이핑할 때마다)
        </p>
        <p>
          <span class="badge beacon">Beacon API</span> 
          페이지 종료 시 서버 전송
        </p>
        
        <h4>📋 이벤트 로그</h4>
        <div id="log"></div>
      </div>
    
      <div class="info-card">
        <h3>🔍 확인 방법: webhook.site</h3>
        <ol>
          <li>https://webhook.site 접속 → 고유 URL 복사</li>
          <li>위 코드에서 <code>API_ENDPOINT</code>를 복사한 URL로 변경</li>
          <li>이 파일을 로컬 서버로 열기 (Live Server 등)</li>
          <li>폼에 내용 입력</li>
          <li>주소창에 다른 URL 입력해서 이동 (예: google.com)</li>
          <li><strong>webhook.site 페이지</strong>에서 요청 확인!</li>
        </ol>
        <p style="color: #e74c3c; font-size: 13px; margin-top: 12px;">
          ⚠️ <strong>왜 Network 탭이 아닌가?</strong><br>
          Beacon은 페이지 종료 후 브라우저가 별도로 전송하기 때문에<br>
          Network 탭에서는 안 보일 수 있음!<br>
          webhook.site 같은 실제 서버로 확인하는 게 확실함.
        </p>
      </div>
    
      <script>
        // ========================================
        // 요소 가져오기
        // ========================================
        const titleInput = document.getElementById('title');
        const contentInput = document.getElementById('content');
        const statusBar = document.getElementById('statusBar');
        const statusText = document.getElementById('statusText');
        const logEl = document.getElementById('log');
    
        const STORAGE_KEY = 'autosave_draft';
        const API_ENDPOINT = '/api/autosave';
    
        // ========================================
        // 유틸 함수
        // ========================================
        function log(message, type = 'info') {
          const time = new Date().toLocaleTimeString();
          const line = document.createElement('div');
          line.className = `log-${type}`;
          line.textContent = `[${time}] ${message}`;
          logEl.appendChild(line);
          logEl.scrollTop = logEl.scrollHeight;
        }
    
        function updateStatus(message, isWarning = false) {
          statusText.textContent = message;
          statusBar.className = `status-bar ${isWarning ? 'warning' : ''}`;
        }
    
        // ========================================
        // localStorage 저장/복원
        // ========================================
        function saveToLocal() {
          const data = {
            title: titleInput.value,
            content: contentInput.value,
            savedAt: new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          updateStatus(`마지막 저장: ${new Date().toLocaleTimeString()}`);
          log('💾 localStorage에 저장됨', 'save');
        }
    
        function restoreFromLocal() {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            try {
              const data = JSON.parse(saved);
              titleInput.value = data.title || '';
              contentInput.value = data.content || '';
              log(`📂 이전 내용 복원됨`, 'save');
              updateStatus('이전 작성 내용을 복원했습니다.');
            } catch (e) {
              console.error('복원 실패:', e);
            }
          }
        }
    
        // ========================================
        // ✨ 핵심: Beacon API로 서버에 전송
        // ========================================
        function sendBeacon() {
          const data = {
            title: titleInput.value,
            content: contentInput.value,
            savedAt: new Date().toISOString(),
            source: 'beacon_autosave'
          };
    
          // 내용이 비어있으면 전송하지 않음
          if (!data.title && !data.content) {
            log('⏭️ 빈 내용 - Beacon 전송 스킵', 'beacon');
            return;
          }
    
          // Blob으로 감싸서 Content-Type을 application/json으로 설정
          const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          
          const queued = navigator.sendBeacon(API_ENDPOINT, blob);
          
          if (queued) {
            log(`🚀 Beacon 전송 (큐에 등록됨)`, 'beacon');
          } else {
            log('❌ Beacon 전송 실패', 'beacon');
          }
        }
    
        // ========================================
        // 입력 이벤트 (디바운스 적용)
        // ========================================
        let saveTimeout;
        function handleInput() {
          updateStatus('저장 중...', true);
          
          // 디바운스: 500ms 동안 추가 입력 없으면 저장
          clearTimeout(saveTimeout);
          saveTimeout = setTimeout(() => {
            saveToLocal();
          }, 500);
        }
    
        titleInput.addEventListener('input', handleInput);
        contentInput.addEventListener('input', handleInput);
    
        // ========================================
        // 페이지 종료 시 Beacon 전송
        // ========================================
        window.addEventListener('pagehide', (e) => {
          log(`👋 pagehide 이벤트 발생`, 'visibility');
          sendBeacon();
        });
    
        // 탭 전환 감지 (참고용 로그)
        document.addEventListener('visibilitychange', () => {
          log(`👁️ visibility: ${document.visibilityState}`, 'visibility');
        });
    
        // ========================================
        // 초기화
        // ========================================
        restoreFromLocal();
        log('페이지 로드 완료. 내용을 입력하고 탭을 닫아보세요!');
      </script>
    </body>
    </html>
    ```
    

### 코드 해설

**전체 구조**

```jsx
// 1. localStorage - 실시간 저장 (타이핑할 때마다)
function saveToLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 2. Beacon API - 페이지 종료 시 서버 전송
function sendBeacon() {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  navigator.sendBeacon(API_ENDPOINT, blob);
}

// 3. pagehide 이벤트에서 Beacon 호출
window.addEventListener('pagehide', () => {
  sendBeacon();
});
```

**디바운스(Debounce)가 뭔가?**

```jsx
let saveTimeout;
function handleInput() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToLocal();
  }, 500);
}
```

- 매 키 입력마다 저장하면 너무 많은 저장 발생
- 500ms 동안 추가 입력이 없으면 저장 (연속 타이핑 중에는 저장 안 함)
- "입력이 끝났을 때" 저장하도록 코드 작성됨.

**Blob을 쓰는 이유**

```jsx
const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
navigator.sendBeacon(API_ENDPOINT, blob);
```

- Beacon API는 Content-Type을 직접 설정할 수 없음
- Blob으로 감싸면 `application/json`으로 전송 가능
- 서버에서 JSON 파싱하기 편함

### 실습 순서

1. [**https://webhook.site**](https://webhook.site/) 접속 → 고유 URL 복사
2. 코드에서 `API_ENDPOINT`를 복사한 URL로 변경
3. 파일을 **로컬 서버**로 열기 (VS Code Live Server, `python -m http.server` 등)
    - `file://`로 열면 일부 API가 제한될 수 있음
4. 제목과 내용 입력
5. 로그에서 "localStorage에 저장됨" 확인
6. 주소창에 **다른 URL 입력**해서 이동 (예: `google.com`)
7. **webhook.site 페이지**에서 요청이 들어온 것 확인!

### 이 실습에서 확인할 것

| 확인 포인트 | 예상 결과 |
| --- | --- |
| 타이핑 중 실시간 저장 | 로그에 "localStorage에 저장됨" |
| 페이지 새로고침 후 | 이전 내용 복원됨 |
| 페이지 이동 시 | 로그에 "pagehide" → "Beacon 전송" |
| **webhook.site** | 요청 도착 + JSON 데이터 확인 |

> 💡 Network 탭에서 안 보여도 정상!
Beacon은 페이지 종료 후 브라우저가 별도로 전송하기 때문에 Network 탭에 안 잡힐 수 있음.
webhook.site에서 요청이 보이면 정상 동작한 것!

---

## 8. 굳이 안 써도 되는 경우

API를 알았다고 모든 곳에 적용할 필요는 없음!

### ❌ Page Visibility API가 필요 없는 경우

| 상황 | 이유 |
| --- | --- |
| 단순 정적 페이지 (블로그, 문서) | 탭 상태와 관계없이 동작하는 게 없음 |
| 서버 사이드 렌더링 위주 사이트 | 페이지 이동 시 어차피 새로 로드됨 |
| 체류 시간 분석이 필요 없는 서비스 | 측정할 필요가 없음 |
| 이미 GA(구글애널리틱스) 같은 도구를 쓰고 있음 | GA가 알아서 처리해줌 |

### ❌ Beacon API가 필요 없는 경우

| 상황 | 이유 |
| --- | --- |
| 데이터 전송 실패해도 괜찮음 | 일반 fetch로 충분 |
| 실시간 응답이 필요함 | Beacon은 fire-and-forget (응답 못 받음) |
| 서버 없이 클라이언트만 있음 | 보낼 곳이 없음 |
| SPA 내부 라우팅만 있음 | pagehide가 발생 안 함 |

### ❌ 오히려 복잡해지는 경우

```jsx
// 이런 건 과함
if (document.hidden) {
  // 그냥 API 호출 한 번 줄이자고...
  // 백그라운드일 때는 API 안 부르자!라는 생각으로 최적화시도
}

// 이 정도 트래픽이면 그냥 호출해도 됨
// 30초에 한 번 알림 fetch 하는 시나리오
// 사이트를 하루 내내 띄워놓는 사용자는 드묾! fetch payload는 몇 KB 수준이 대부분이라 서버는 보통 캐싱 or batch 처리함
setInterval(() => fetchNotifications(), 30000);
```

**판단 기준:**

- "이 기능이 없으면 사용자 경험이나 데이터 정확도에 문제가 생기나?"
- "아니오"라면 굳이 안 써도 됨

---

## 참고 자료

### 공식 문서

- [MDN: Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [MDN: Navigator.sendBeacon()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)
- [W3C: Beacon Specification](https://www.w3.org/TR/beacon/)
- [Google: Page Lifecycle API](https://developer.chrome.com/blog/page-lifecycle-api/)
- [web.dev: bfcache](https://web.dev/bfcache/)
- [Chrome Developers: Background Tabs](https://developer.chrome.com/blog/background-tabs/)
