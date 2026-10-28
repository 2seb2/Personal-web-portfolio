---
id: "article10"
title: "TS 타입시스템"
kinds: ["스터디"]
stacks: ["TypeScript"]
date: "2026-03-30"
excerpt: "type과 interface, any·unknown·never, 그리고 타입 가드까지. 타입을 정의하고 좁히는 TypeScript의 기본 규칙 정리"
---

런타임은 코드가 실제로 실행되는 시점이고, 타입 가드는 그 실행 시점에 확인할 수 있는 조건문을 써서 TypeScript가 “여기서는 이 타입이 맞구나” 하고 더 구체적으로 판단하게 해주는 거야.

## 1. 🗺️ 개념 지도 (Overview)

### **한 줄 요약:**

```
TypeScript는 타입을 어떻게 정의하고(type·interface),
얼마나 엄격하게 검사할지(any·unknown·never),
~~런타임에서 타입을 어떻게 확인할지(타입 가드)를 규칙으로 제공한다.(쉬운말로 교체)~~
타입 가드를 통해 타입을 어떻게 좁혀 안전하게 사용할지에 대한 규칙을 제공한다.
```

### **이 주제가 왜 중요한가?**

- `any` 남발 → TypeScript를 쓰는 이유가 없어짐. `unknown` 을 언제 써야하는지가 중요
- `type` vs `interface` 는 실무에서 자주 고민하게 되는 선택. “그냥 아무거나 써요”로 넘어갈 수 없음!
- `unknown` 을 쓰면 반드시 타입 가드가 필요함 — 세 개념이 서로 연결 되어 있음

**관련 키워드 (마인드맵 형태로 나열):**

```
[TypeScript 타입 시스템 핵심]
├── type vs interface
│   ├── 공통점 (객체 형태 정의)
│   ├── 차이점
│   │   ├── 선언 병합 (interface만 가능)
│   │   ├── 유니온·리터럴·튜플·함수 타입 표현 (type만 가능)
│   │   └── 확장 방식 (extends vs &)
│   └── 언제 뭘 쓸까?
├── any / unknown / never
│   ├── any — 타입 검사 비활성화
│   ├── unknown — unknown 상태로는 사용 불가, 타입 가드 후에만 사용 가능
│   └── never — 가능한 값이 없는 타입, Exhaustive Check에 활용
└── 타입 가드 (Type Guard)
    ├── typeof — 원시 타입 구분
    ├── instanceof — 클래스 인스턴스 구분
    └── 사용자 정의 타입 가드 (is) — 인라인 타입 가드를 함수로 분리할 때
```

**이 주제 들어가기 전에, 이해하려고 미리 찾아본 배경지식입니다!:**

### 배경 지식 — 컴파일과 런타임(참고용, 선택)

> 개념을 이해하려면 TypeScript가 어떻게 실행되는지 먼저 알아야 한다.
> 

TypeScript 코드 그대로는 브라우저나 Node.js에서 실행할 수 없다. 반드시 JavaScript로 변환하는 과정을 거쳐야 한다.

```
① .ts 파일 작성
       ↓
② 컴파일 (tsc 명령어 실행)
   - 타입 에러 검사
   - 타입 표기 제거
   - .js 파일 생성
       ↓
③ 런타임 (브라우저 / Node.js가 .js 파일 실행)
   - 타입 정보 없음
   - 실제 값만 존재
```

**컴파일 타임**: .ts → .js 변환 단계. TypeScript가 타입 에러를 잡는 시점이다.

**런타임**: .js 파일이 실제로 실행되는 단계. 이 시점엔 타입 정보가 전부 사라져 있다.

```tsx
// TypeScript (.ts)
const greet = (name: string): string => {
  return "안녕, " + name;
};
```

```jsx
// JavaScript (.js) — 컴파일 후
// ": string" 같은 타입 표기가 전부 지워짐
const greet = (name) => {
  return "안녕, " + name;
};
```

`interface`나 `type`으로 정의한 것도 마찬가지다. JavaScript에는 그 개념이 없으므로 컴파일 후에는 흔적도 없이 사라진다.

### 배경 지식 — 타입의 종류(참고용, 선택)

> 이 섹션에 나오는 용어들을 미리 정리해둔다.
> 

**원시 타입 (Primitive Type)**
JavaScript 기본 값 타입이다.

```tsx
let a: string    = "hello";
let b: number    = 42;
let c: boolean   = true;
let d: null      = null;
let e: undefined = undefined;
```

**리터럴 타입 (Literal Type)**
특정 값 그 자체를 타입으로 쓰는 것이다. `string`은 "모든 문자열"을 허용하지만, `"loading"`은 딱 그 문자열 하나만 허용한다.

```tsx
let a: string  = "hello"; // 어떤 문자열이든 OK
let b: "hello" = "hello"; // "hello"만 OK
b = "world"; // ❌ Error
```

**유니온 타입 (Union Type) — `|`**
"이 타입 또는 저 타입"이다. 리터럴 타입과 조합해서 허용할 값을 제한할 때 많이 쓴다.

```tsx
let value: string | number;
value = "hello"; // OK
value = 42;      // OK
value = true;    // ❌ Error

// 리터럴 타입 + 유니온 — 허용할 값을 직접 나열
type Status = "loading" | "success" | "error";
// "loading", "success", "error" 세 문자열만 허용
```

**교차 타입 (Intersection Type) — `&`**
"이 타입이면서 동시에 저 타입"이다. 두 타입의 프로퍼티를 전부 합친 새 타입이 된다.

```tsx
type HasName = { name: string };
type HasAge  = { age: number };
type Person  = HasName & HasAge; // name도 있고 age도 있어야 함

const p: Person = { name: "철수", age: 20 }; // OK
const q: Person = { name: "영희" };           // ❌ age 없어서 에러
```

**튜플 (Tuple)**
배열인데 각 자리의 타입이 고정된 것이다.

```tsx
type Pair = [string, number];
const a: Pair = ["철수", 20]; // OK
const b: Pair = [20, "철수"]; // ❌ 순서가 다르면 에러
```

**함수 타입**
함수의 매개변수와 반환값 타입을 정의하는 것이다.

```tsx
type Add = (a: number, b: number) => number;
const add: Add  = (a, b) => a + b;   // OK
const add2: Add = (a, b) => "결과";  // ❌ string 반환이라 에러
```

---

## 2. 📖 핵심 개념 정리

### 2-1. type vs interface

**개념 설명 (내 말로):**

> 둘 다 객체 타입을 정의하는 데 쓰인다. 기능이 많이 겹치지만 두 가지 결정적인 차이가 있다.
`interface`는 같은 이름으로 여러 번 선언하면 자동으로 하나로 합쳐지는 선언 병합이 된다.
`interface`는 객체 타입을 정의하는 데 사용한다. 반면 `type`은 객체뿐 아니라 유니온·리터럴·튜플·함수 타입 등 다양한 타입에 이름을 붙일 수 있다.

**공통점:**

```tsx
// 둘 다 객체 타입 정의 가능
interface UserI {
  id: number;
  name: string;
}

type UserT = {
  id: number;
  name: string;
};

// 둘 다 확장 가능 (방식은 다름)
interface AdminI extends UserI {
  role: string;
}

type AdminT = UserT & { role: string };
```

**핵심 차이점:**

```tsx
// ✅ interface: 선언 병합 (Declaration Merging)
// 같은 이름으로 두 번 선언하면 자동으로 합쳐짐
interface Window {
  myCustomProp: string;
}
interface Window {
  anotherProp: number;
}
// → Window는 myCustomProp + anotherProp 둘 다 가짐
// 라이브러리 타입을 확장할 때 활용 (예: Express Request에 user 추가)

// ❌ type: 선언 병합 불가 — 같은 이름 두 번 선언하면 즉시 에러
type Point = { x: number };
type Point = { y: number }; // ❌ Error: Duplicate identifier 'Point'

// ✅ type만 가능한 것들 — interface로는 아래 표현들이 불가능
type Status   = "loading" | "success" | "error"; // 리터럴 유니온
type ID       = string | number;                  // 원시 타입 유니온
type Pair     = [string, number];                 // 튜플
type Callback = (event: MouseEvent) => void;      // 함수 타입
```

**동작 원리 — 컴파일러 관점:**

- `interface`는 컴파일러가 같은 이름의 선언을 만나면 하나로 병합한다. 여러 파일에서 같은 interface 이름을 선언해도 에러가 아니라 합쳐진다.
- `type`은 선언 시점에 완전히 확정된다. 같은 이름을 두 번 선언하면 즉시 에러가 난다.
- 컴파일 후 JS로 변환되면 둘 다 사라진다. 런타임에는 존재하지 않는다.

**언제 뭘 쓸까 (실무 기준):**

| 상황 | 권장 |
| --- | --- |
| 외부에 공개하는 라이브러리·API 타입 | `interface` (다른 파일에서 선언 병합으로 확장 가능) |
| 유니온·리터럴·튜플·함수 타입 | `type` (interface로는 표현 불가) |
| React props, 컴포넌트 내부 타입 | 팀 컨벤션에 따름 (둘 다 무방) |

### **핵심 포인트:**

- `interface`는 객체 전용. 선언 병합 가능
- `type`은 모든 타입에 사용 가능. 선언 병합 불가
- "뭐가 더 좋냐"가 아니라 상황에 따라 고르는 것이 정답

---

### 2-2. **any / unknown / never**

**개념 설명 (내 말로):**

> 세 타입은 "값을 받을 수 있는지"와 "받은 뒤 바로 쓸 수 있는지"로 구분하면 명확하다.
> 
> - `any`: 어떤 값이든 받을 수 있고, 받은 뒤 바로 쓸 수 있다. 대신 타입 검사가 비활성화된다.
> - `unknown`: 어떤 값이든 받을 수 있지만, `unknown` 상태 그대로는 프로퍼티 접근·메서드 호출·다른 타입 변수에 할당이 모두 컴파일 에러다. 타입 가드로 타입을 확인한 후에만 쓸 수 있다.
> - `never`: 가능한 값이 아무것도 없는 타입이다. switch 문에서 모든 케이스를 처리했는지 컴파일 타임에 강제하는 Exhaustive Check 패턴에 주로 쓴다.

**any / unknown / never 비교:**

```
              어떤 값이든 받기    받은 뒤 바로 사용    다른 타입 변수에 할당
any           ✅                  ✅ (타입 검사 없음)   ✅
unknown       ✅                  ❌ (타입 가드 필수)   ❌ (unknown/any 외 불가)
never         ❌ (값 자체 없음)   해당 없음             ✅ (모든 타입에 할당 가능)
```

**any 동작:**

```tsx
let a: any = "hello";
a = 42;              // OK — 어떤 값이든 담을 수 있음
a.toUpperCase();     // OK — 타입 검사가 꺼져 있어서 에러 없음
a.nonExistent();     // OK — 존재하지 않는 메서드도 에러 없음. 런타임에서 터짐

let num: number = a; // OK — any는 어떤 타입 변수에도 할당 가능
```

**unknown 동작:**

```tsx
let u: unknown = "hello";
u = 42;              // OK — 어떤 값이든 담을 수 있음

u.toUpperCase();     // ❌ 컴파일 에러 — unknown 상태로는 메서드 호출 불가
let num: number = u; // ❌ 컴파일 에러 — unknown은 number에 할당 불가

// 타입 가드로 타입을 확인한 후에만 사용 가능
if (typeof u === "string") {
  u.toUpperCase();   // ✅ OK — 이 블록 안에서는 u가 string으로 확정됨
}
```

**never 동작:**

`never`는 "이 변수에 넣을 수 있는 값이 아무것도 없다"는 타입이다. 실제로 never 타입의 값을 만들 방법이 없다.

TypeScript는 switch 문에서 케이스를 하나씩 처리할 때, 처리된 타입을 하나씩 제거하며 추적한다. 모든 케이스를 처리하면 남는 타입이 없으므로 자동으로 never가 된다.

```tsx
type Status = "loading" | "success" | "error";

function handle(status: Status) {
  switch (status) {
    case "loading": return; // "loading" 처리 → 남은 타입: "success" | "error"
    case "success": return; // "success" 처리 → 남은 타입: "error"
    case "error":   return; // "error" 처리   → 남은 타입: 없음
    default:
      status; // 타입: never — 모든 케이스가 처리됐으므로 여기 올 수 없음
  }
}
```

**never로 Exhaustive Check (누락 케이스 강제 검출):**

```tsx
// "timeout"을 추가했는데 switch 처리를 빠뜨린 상황
type Status = "loading" | "success" | "error" | "timeout"; // 추가!

function handle(status: Status) {
  switch (status) {
    case "loading": return;
    case "success": return;
    case "error":   return;
    // "timeout" 처리 누락
    default:
      // "timeout"이 아직 남아 있으므로 status 타입은 "timeout"
      // "timeout"은 never가 아니라서 → 컴파일 에러!
      const _check: never = status;
      throw new Error("처리 안 된 케이스");
  }
}
```

`const _check: never = status` 이 줄의 역할: "여기까지 왔을 때 status는 never여야 한다(모든 케이스가 처리됐으니까)"를 코드로 선언하는 것이다. 처리 안 된 케이스가 있으면 status가 never가 아니므로 컴파일 에러가 난다.

**never 연산 규칙:**

```tsx
// never | string = string
// never에 해당하는 값이 없으므로, 유니온에서 기여하는 값이 없다
type A = never | string; // string

// never & string = never
// "never이면서 string"인 값이 존재하려면 never에 해당하는 값이 있어야 하는데, 없다
type B = never & string; // never
```

### **핵심 포인트:**

- `any` → 타입 검사 비활성화. 레거시 마이그레이션 등 불가피한 상황에서만 사용
- `unknown` → 컴파일 타임에 알 수 없는 외부 값(API 응답, JSON.parse 등)을 받을 때 `any` 대신 사용. 반드시 타입 가드와 함께 씀
- `never` → Exhaustive Check 패턴. 유니온 타입에 새 케이스 추가 시 처리 누락을 컴파일 에러로 강제

---

### 2-3. 타입 가드 (Type Guard)

**개념 설명 (내 말로):**

> TypeScript 컴파일러는 조건문 안에서 조건에 따라 변수의 타입을 더 구체적으로 확정한다. 이것을 Narrowing이라고 한다.
예를 들어 `string | number` 유니온 타입인 변수가 있을 때, `if (typeof value === "string")` 블록 안에서는 컴파일러가 `value`를 `string`으로 확정한다.
타입 가드는 이 Narrowing이 일어나도록 조건을 작성하는 방법이다.
`unknown`을 쓰면 타입 가드 없이는 그 값에 아무것도 할 수 없다. `unknown` 상태 그대로는 프로퍼티 접근도 메서드 호출도 전부 컴파일 에러가 나기 때문이다.

**typeof 타입 가드:**

```tsx
function format(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase(); // 이 블록 안에서 value: string으로 확정
  } else {
    return value.toFixed(2);   // 이 블록 안에서 value: number로 확정
  }
}

// typeof로 확인 가능한 타입:
// "string" | "number" | "boolean" | "bigint" | "symbol" | "undefined" | "function"

// ⚠️ 주의: typeof null === "object"
// null은 객체가 아니지만 typeof 결과가 "object"로 나옴
// 객체 타입 가드 쓸 때 반드시 null 체크를 함께 해야 함
if (typeof value === "object" && value !== null) {
  // 안전하게 객체로 처리
}
```

**instanceof 타입 가드:**

```tsx
class NetworkError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends Error {
  field: string;
  constructor(message: string, field: string) {
    super(message);
    this.field = field;
  }
}

function handleError(error: Error) {
  if (error instanceof NetworkError) {
    console.log(error.statusCode); // ✅ 이 블록 안에서 NetworkError로 확정
  } else if (error instanceof ValidationError) {
    console.log(error.field);      // ✅ 이 블록 안에서 ValidationError로 확정
  }
}

// 동작 원리: instanceof는 런타임에 프로토타입 체인을 확인함
// error instanceof NetworkError
// === Object.getPrototypeOf(error) === NetworkError.prototype
```

**사용자 정의 타입 가드 (is):**

인라인 타입 가드 조건을 함수로 분리할 때 쓴다.

TypeScript는 `if` 문 안의 `typeof`, `instanceof` 같은 조건을 직접 읽고 타입을 확정한다. 그런데 그 조건을 함수로 빼는 순간 TypeScript가 함수 안을 추적하지 않는다. 그래서 함수가 `true`를 반환해도 TypeScript는 타입을 확정하지 못한다.

반환 타입에 `value is 타입`을 명시하면 "이 함수가 true를 반환했으면 이 타입으로 확정해"를 컴파일러에게 알려줄 수 있다.

```tsx
// 인라인으로 쓸 때
const data: unknown = { name: "철수" };
if (typeof data === "object" && data !== null && "name" in data) {
  // TypeScript가 조건문을 직접 읽지만
  // "name" in data 는 프로퍼티 존재만 확인, 타입은 모름
  // data.name 접근 시 여전히 에러
}

// is 없이 함수로 분리했을 때
function isUser(data: unknown) {
  return typeof data === "object" && data !== null && "name" in data;
}
if (isUser(data)) {
  data.name; // ❌ 컴파일 에러
  // isUser가 true를 반환했지만 TypeScript는 함수 안을 추적 안 함
  // data는 여전히 unknown
}

// is를 명시했을 때
function isUser(data: unknown): data is { name: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof (data as any).name === "string"
  );
}
if (isUser(data)) {
  data.name; // ✅ OK
  // isUser가 true → 반환 타입 "data is { name: string }" 덕분에
  // TypeScript가 이 블록 안에서 data를 { name: string }으로 확정
}
```

**컴파일 후 JS 비교 — as vs is:**

`as`(타입 단언)는 컴파일러에게 타입을 강제로 선언하는 것이다. 런타임 검사가 없어서 컴파일 후 흔적도 없이 사라진다.

```tsx
// TypeScript
const user = data as { name: string };
console.log(user.name);
```

```jsx
// JavaScript (컴파일 후) — as가 완전히 사라짐
const user = data;
console.log(user.name); // data가 실제로 뭐든 그냥 실행. 값 없으면 undefined
```

`is`를 쓴 함수는 타입 표기만 지워지고, 실제 검사 로직은 JS에 그대로 남는다.

```tsx
// TypeScript
function isUser(data: unknown): data is { name: string } {
  return typeof data === "object" && data !== null && "name" in data;
}
```

```jsx
// JavaScript (컴파일 후) — ": data is { name: string }" 만 지워짐
// 함수 안의 실제 검사 로직은 그대로 남아 런타임에도 실행됨
function isUser(data) {
  return typeof data === "object" && data !== null && "name" in data;
}
```

|  | `as` (타입 단언) | `is` (사용자 정의 타입 가드) |
| --- | --- | --- |
| 런타임 검사 | 없음 — 컴파일 후 사라짐 | 있음 — 검사 로직이 JS에 남음 |
| 틀렸을 때 | 런타임 에러 (컴파일 에러 안 남) | 검사가 false를 반환해서 else 분기로 |
| 용도 | 타입을 확실히 알 때 강제 선언 | 불확실한 값을 직접 검사하고 확정 |

### **핵심 포인트:**

- `typeof` → 원시 타입 구분. `typeof null === "object"` 주의
- `instanceof` → 클래스 인스턴스 구분. 런타임에 프로토타입 체인 확인
- `is` → 인라인 타입 가드를 함수로 분리할 때. 검증 로직 정확성은 개발자 책임
- `as` vs `is` → `as`는 검사 없이 강제, `is`는 실제 검사 후 확정

---

## 3. 🔍 깊이 이해하기

### 왜 이렇게 설계됐을까? (Design Decision)

- **unknown의 등장 배경**
: `any`를 쓰면 타입 안전성이 완전히 무너진다. 외부 값을 받아야 하지만 타입 검사도 유지하고 싶을 때를 위해 도입됐다. `unknown`은 "받을 수 있지만, 쓰려면 직접 확인해라"는 규칙을 강제한다.
- **never의 성질**
: 가능한 값이 하나도 없는 타입이므로, 어떤 타입과 유니온해도 결과가 그 타입 그대로다(`never | T = T`). 어떤 타입과 교차해도 결과가 never다(`never & T = never`). 이 성질 덕에 Exhaustive Check 패턴이 작동한다.
- **type과 interface가 공존하는 이유**
: TypeScript 초기엔 `interface`만 있었고, `type`은 나중에 추가됐다. `interface`의 선언 병합 기능이 라이브러리 생태계에서 널리 사용되고 있어 제거할 수 없기 때문에 둘 다 유지된다.

### 다른 개념과의 비교

| 구분 | `any` | `unknown` | `never` |
| --- | --- | --- | --- |
| 값 대입 | 뭐든 OK | 뭐든 OK | 불가능 (값 없음) |
| 다른 타입에 할당 | OK | ❌ (타입 가드 필요) | OK (모든 타입의 서브타입) |
| 프로퍼티 접근 | OK (검사 없음) | ❌ (타입 가드 필요) | 해당 없음 |
| 타입 안전성 | 없음 | 있음 | 있음 |
| 주 사용처 | 마이그레이션, 불가피한 상황 | 외부 입력, API 응답 | Exhaustive Check, 도달 불가 코드 |

### 실무에서는 어떻게 쓰이나?

- **API 응답 처리**: `fetch` 결과는 `unknown`으로 받고, 사용자 정의 타입 가드로 검증 후 사용
- **에러 핸들링**: `catch (e)`의 `e`는 TS 4.0부터 기본이 `unknown`. `instanceof Error`로 좁혀서 씀
- **라이브러리 타입 확장**: `interface`의 선언 병합으로 Express `Request`에 `user` 프로퍼티 추가
- **Exhaustive Check**: `Status` 타입에 새 케이스 추가 시 switch 처리 누락을 컴파일 에러로 강제

**내가 쓰는 기준:**

- 선언 병합이 필요하거나 외부에 공개하는 타입은 `interface`, 유니온·리터럴처럼 `interface`로 표현할 수 없는 타입은 `type`을 쓴다. 팀 컨벤션이 있으면 그걸 가장 먼저 따른다.

---

## 4. ❓ 스스로 묻고 답하기

### 기본 질문

- **Q1. type과 interface의 차이를 설명해주세요.**
    
    > A: 둘 다 타입을 정의하는 도구인데, 가장 큰 차이는 **선언 병합 가능 여부**와 **표현할 수 있는 타입의 범위**입니다.
    > 
    > 
    > interface는 같은 이름으로 여러 번 선언하면 자동으로 합쳐지는 선언 병합이 됩니다. 그래서 라이브러리 타입을 확장할 때 유리합니다. 반면 type은 중복 선언하면 컴파일 에러가 납니다.
    > 
    > 표현 범위 면에서는 type이 더 넓습니다. interface는 객체 구조 정의에 특화되어 있지만, type은 유니온, 리터럴, 튜플, 함수 타입 등 모든 타입에 이름을 붙일 수 있습니다.
    > 
    > 그래서 선언 병합이 필요하거나 외부에 공개하는 타입은 interface, 유니온이나 리터럴처럼 interface로 표현 불가능한 타입은 type을 씁니다.
    > 
- **Q2. any 대신 unknown을 써야 하는 이유가 뭔가요?**
    
    > A: 핵심 차이는 **타입 검사를 강제하느냐 아니냐**입니다.
    > 
    > 
    > `any` 는 타입 검사가 완전히 꺼집니다. 존재하지 않는 메서드를 호출해도 컴파일 에러가 나지 않고, 런타임까지 문제가 넘어갑니다.
    > 
    > `unknown` 도 어떤 값이든 받을 수 있다는 점은 같지만, `unknown` 상태 그대로는 프로퍼티 접근, 메서드 호출, 다른 타입 변수에 할당이 모두 컴파일 에러입니다. 타입 가드로 타입을 확인한 이후에만 사용할 수 있습니다.
    > 
    > 그래서 외부 API 응답이나 `JSON.parse` 결과처럼 실제 타입을 확신할 수 없는 값을 받을 때는 any 대신 `unknown` 을 써야 합니다.
    > 
- **Q3. 타입 가드란 무엇이고 어떤 종류가 있나요?**
    
    > A: 타입 가드는 **조건문 안에서 변수의 타입을 더 구체적으로 확정(Narrowing)하는 방법**입니다.
    > 
    > 
    > 예를 들어 `string | number` 타입인 변수가 있을 때, `typeof value === "string"` 블록 안에서는 컴파일러가 value를 string으로 확정합니다. 이렇게 조건에 따라 타입을 좁혀주는 것이 타입 가드입니다.
    > 
    > 종류는 세 가지입니다. `typeof`는 string, number 같은 원시 타입을 구분할 때, `instanceof`는 클래스 인스턴스를 구분할 때 씁니다. interface처럼 런타임에 타입 정보가 남지 않는 경우엔 `value is 타입` 형태의 반환 타입을 가진 함수를 직접 작성하는 사용자 정의 타입 가드를 씁니다. 이때 검증 로직이 실제로 올바른지는 개발자 책임입니다.
    > 

---

### 심화 질문

- **Q4. never 타입을 실무에서 어떻게 활용하나요?**
    
    > A: 가장 유용한 패턴은 Exhaustive Check입니다. TypeScript는 switch 문에서 케이스를 처리할 때마다 해당 타입을 제거해가며 추적하는데, 모든 케이스를 처리하면 남는 타입이 없어서 자동으로 never가 됩니다. switch의 default 분기에 `const _check: never = value`를 선언해두면, 유니온 타입에 새 케이스가 추가됐을 때 처리 누락을 컴파일 에러로 강제할 수 있습니다. default에 도달했을 때 처리 안 된 케이스가 남아 있으면 value가 never가 아니므로 할당이 실패해 에러가 납니다. 또 throw만 하는 함수의 반환 타입으로도 씁니다.
    > 
- **Q5. 사용자 정의 타입 가드(is)를 쓰는 이유가 뭔가요?**
    
    > A: **타입 가드 조건을 함수로 분리하면 TypeScript가 그 함수 안을 추적하지 않기 때문**입니다.
    > 
    > 
    > TypeScript는 `if` 문 안의 `typeof`, `instanceof` 같은 조건은 직접 읽고 타입을 확정합니다. 그런데 그 조건을 함수로 빼는 순간 함수가 `true`를 반환해도 TypeScript는 타입을 확정하지 못하고 여전히 unknown으로 취급합니다.
    > 
    > 반환 타입에 `value is 타입`을 명시하면 "이 함수가 true를 반환했으면 이 타입으로 확정해"를 컴파일러에게 알려줄 수 있습니다. 검사 로직은 JS에 그대로 남아 런타임에도 실행되고, `is` 표기 자체는 컴파일 후 사라집니다.
    > 
- **Q6. typeof로 타입 가드를 쓸 때 주의해야 할 예외 케이스가 있나요?**
    
    > A: 대표적인 예외가 두 가지입니다. **null과 배열이 둘 다 `"object"`로 나오는 것**입니다.
    > 
    > 
    > `typeof null === "object"`입니다. null은 객체가 아니지만 typeof 결과가 "object"로 나오기 때문에, 객체 타입 가드를 쓸 때는 `value !== null` 조건을 반드시 함께 써야 합니다.
    > 
    > 배열도 마찬가지입니다. `typeof [] === "object"`이므로, 배열 여부는 typeof 대신 `Array.isArray()`로 따로 확인해야 합니다.
    > 
    > ```tsx
    > // null 체크 누락 — 버그
    > if (typeof value === "object") {
    >   value.someMethod(); // ❌ value가 null일 수 있음
    > }
    > 
    > // 올바른 패턴
    > if (typeof value === "object" && value !== null) {
    >   value.someMethod(); // ✅
    > }
    > ```
    > 

---

### 🧨 헷갈리기 쉬운 질문

- **Q7. interface extends와 type &(교차 타입)는 같은 건가요?**
    
    > A: 비슷해 보이지만 **타입이 충돌했을 때 에러가 나는 시점이 다릅니다.**
    > 
    > 
    > `interface extends`는 부모와 호환되지 않는 타입의 프로퍼티가 있으면 선언 즉시 컴파일 에러를 냅니다. 반면 `type &`는 충돌하는 프로퍼티를 never로 만들어버리고, 선언 자체는 에러가 나지 않습니다. 그 프로퍼티를 실제로 사용하는 코드에서야 에러가 드러납니다.
    > 
    > 충돌을 빨리 발견하고 싶다면 `interface extends`가 더 안전합니다.
    > 
    > ```jsx
    > type A = { x: string } & { x: number };
    > // x의 타입이 string & number = never가 됨
    > // 선언 자체는 에러 없음 — 사용하는 코드에서야 에러
    > 
    > interface B extends { x: string } { x: number } // ❌ 선언 즉시 에러
    > ```
    > 

---

## 5. 📝 나만의 요약 노트

### 오늘 이 주제에서 가장 중요한 것 3가지

1. **type vs interface**
: interface는 객체 전용 + 선언 병합 가능. type은 모든 타입에 사용 가능 + 선언 병합 불가
2. **unknown은 타입 가드 없이 쓸 수 없다**
: unknown 상태 그대로는 프로퍼티 접근·메서드 호출 전부 컴파일 에러
3. **never로 Exhaustive Check**
: switch default에 `const _check: never = value`를 써두면 처리 누락을 컴파일 에러로 강제

### 헷갈렸던 부분 & 해결

| 헷갈린 것 | 알고 보니 |
| --- | --- |
| type이랑 interface 그냥 같은 거 아닌가? | interface는 객체 전용. type은 유니온·리터럴 등 모든 타입에 사용 가능 |
| unknown은 any랑 뭐가 다른 거지? | unknown은 타입 가드로 확인 전까지 아무것도 못 함. any는 바로 사용 가능 |
| never는 왜 필요한가? | switch에서 케이스를 전부 처리하면 TypeScript가 자동으로 never를 붙임. 이를 이용해 처리 누락을 컴파일 에러로 강제 |
| is는 왜 쓰는가? | 인라인 타입 가드를 함수로 분리하면 TypeScript가 함수 안을 추적 못 함. is로 "true 반환 시 이 타입"임을 컴파일러에게 알려줘야 함 |
| as와 is는 뭐가 다른가? | as는 런타임 검사 없이 타입을 강제 선언. is는 실제 검사 후 결과를 컴파일러에게 전달 |
| as는 컴파일 후 어떻게 되나? | 흔적도 없이 사라짐. is를 쓴 함수는 타입 표기만 지워지고 검사 로직은 JS에 그대로 남음 |

---

## 6. 📚 참고 자료

| 자료 | 링크 | 추천 이유 |
| --- | --- | --- |
| TypeScript 공식 문서 — Narrowing | [https://www.typescriptlang.org/docs/handbook/2/narrowing.html](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) | 타입 가드·Narrowing의 공식 설명 |
| TypeScript 공식 문서 — Everyday Types | [https://www.typescriptlang.org/docs/handbook/2/everyday-types.html](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) | any·unknown·never 포함 기본 타입 총정리 |
| TypeScript 공식 문서 — type vs interface | [https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces) | 두 개념 공식 비교 |
