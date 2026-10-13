'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { animate, useDragControls, useMotionValue, useReducedMotion } from 'motion/react';
import { KeywordPill } from '@/components/ui/KeywordPill';
import { NavPill } from '@/components/ui/NavPill';
import type { HeroKeyword } from '@/types/content';
import { canUseRingLayout, computeRingPositions, computeStripLayout, type Point } from './geometry';
import { fromPlacedPosition, getClientPoint, isPointInSlot } from './useDropTarget';
import type { PlacedPosition } from './reducer';
import { RETURN_SPRING, SETTLE_SPRING } from './animation';

/**
 * 드래그 중이거나 자유 배치된 칩의 z-index. Hero Copy 블록·슬롯(모두 기본 쌓임 순서)보다
 * 항상 위에 있어야 한다는 요구사항 때문에 Ring 안의 다른 칩보다도 훨씬 큰 값을 쓴다.
 */
const DRAGGING_Z_INDEX = 1000;
const PLACED_Z_INDEX = 100;

type RingProps = {
  keywords: HeroKeyword[];
  viewportWidth: number;
  viewportHeight: number;
  heroCopyCenterY: number;
  heroCopyHalfHeight: number;
  /** 슬롯에 들어간 keyword id. 이 칩은 Ring에서 자리를 비워둔다(spec 3·7장) */
  slot: string | null;
  onSelect: (keyword: HeroKeyword) => void;
  /** 자유 배치된 칩의 위치 (Hero 영역 기준 비율 0~1). spec 3·4장 */
  placed: Record<string, PlacedPosition>;
  /** 자유 배치 칩의 겹침 순서. 마지막 원소가 맨 위 */
  stack: string[];
  /** 드래그 시작 — 겹침 순서를 맨 위로 올린다 (spec 4장) */
  onDragStart: (keyword: HeroKeyword) => void;
  /**
   * 드래그 종료. point(뷰포트 좌표, 슬롯 판정용)와 chipCenter(Hero 섹션 기준 상대 좌표,
   * 칩 중심 — 자유 배치 저장용)를 함께 넘긴다. 슬롯 판정은 "포인터가 어디 있었는지"가
   * 기준이어야 하지만, 자유 배치 위치는 "칩이 실제로 보이는 자리"(중심)를 저장해야
   * 드롭 직후 포인터 위치로 다시 튀어 보정되는 어긋남이 없다 (spec 4장).
   */
  onDragEnd: (keyword: HeroKeyword, point: { x: number; y: number }, chipCenter: { x: number; y: number }) => void;
  /**
   * 드래그 중 포인터가 슬롯 영역 안/밖으로 넘어갈 때마다 호출 — 슬롯 테두리를 점선→실선
   * brand/orange로, scale(1.03)으로 키워 드롭 가능 여부를 실시간으로 보여준다 (spec 4장).
   */
  onDragOverSlotChange: (isOver: boolean) => void;
  /**
   * 슬롯 DOM을 가리키는 ref 객체 자체(값이 아니라). 드래그 중 매 프레임 포인터와의 교차를
   * 이벤트 핸들러(onDrag) 안에서 판정하는 데 쓴다 — ref.current를 렌더링 중에 직접 읽어
   * prop으로 넘기면 "Cannot access refs during render" 규칙 위반이 되므로, ref 객체를
   * 그대로 전달하고 .current는 항상 이벤트 콜백 안에서만 읽는다.
   */
  slotElRef: RefObject<HTMLElement | null>;
  /** 칩 DOM 요소를 id로 등록해 포커스 이동(spec 10장)에 쓴다 */
  chipRefs: Map<string, HTMLElement>;
};

type ChipProps = {
  keyword: HeroKeyword;
  position: Point & { rotateDeg: number };
  /** 이 칩이 지금 자유 배치된 상태인지. true면 "자유 배치 놓기"(안착만), false면 Home 복귀 spring (spec 6장) */
  isPlaced: boolean;
  onSelect: (keyword: HeroKeyword) => void;
  onDragStart: (keyword: HeroKeyword) => void;
  onDragEnd: (keyword: HeroKeyword, point: { x: number; y: number }, chipCenter: { x: number; y: number }) => void;
  onDragOverSlotChange: (isOver: boolean) => void;
  slotElRef: RefObject<HTMLElement | null>;
  chipRefs: Map<string, HTMLElement>;
  zIndex: number;
};

function Chip({
  keyword,
  position,
  isPlaced,
  onSelect,
  onDragStart,
  onDragEnd,
  onDragOverSlotChange,
  slotElRef,
  chipRefs,
  zIndex,
}: ChipProps) {
  const prefersReducedMotion = useReducedMotion();

  // Motion은 같은 pointerup에서 press(tap) 제스처와 drag 제스처를 독립적으로 처리한다.
  // 드래그 종료 시점에 내부 "드래그 중" 전역 플래그가 onDragEnd 콜백 실행보다 먼저 꺼지는
  // 경우가 있어, onTap의 자체 드래그 판별(isDragActive 체크)이 이미 늦어 "드래그가 아니었다"고
  // 오판하고 onSelect를 부를 수 있다 — 포인터를 슬롯 밖에 놓아 자유 배치(DROP_FREE)했는데도
  // 곧바로 onTap이 그 칩을 슬롯에 넣어버리는(PLACE_KEYWORD) 버그가 이것이었다. onDragStart와
  // onTap/onDragEnd 호출 순서가 실행마다 달라질 수 있어(둘 중 하나가 플래그를 리셋), 어느 쪽이
  // 먼저 오든 "이번 포인터 세션에 drag가 있었는지"만 보고 그 다음 onTap 한 번을 무시한다.
  const draggedInThisSessionRef = useRef(false);
  /** 직전 프레임에 포인터가 슬롯 안에 있었는지 — onDragOverSlotChange를 상태 변화 시에만 호출하는 데 쓴다 */
  const wasOverSlotRef = useRef(false);

  // Motion은 drag 중 자신이 관리하는 x/y(변위)를 transform에 합성한다 — 여기에 또 다른
  // transform 문자열(중앙 정렬 -50%, 회전)을 같이 넣으면 Motion이 그 값을 지워버려 칩이
  // 포인터 중심이 아니라 모서리 기준으로 움직이게 된다. 그래서 중앙 정렬은 Motion이 직접
  // 추적하는 motion value(x/y)로 주고, 드래그 변위가 그 위에 더해지게 한다.
  const motionX = useMotionValue('-50%');
  const motionY = useMotionValue('-50%');

  // left/top도 motion value로 직접 든다 — 일반 style 숫자로 주면 Motion이 그 변화를
  // 애니메이션해주지 않아(레이아웃 속성은 `layout` prop이 있을 때만 자동 보간된다), Home
  // 복귀·자유 배치 안착(spec 6장)을 motion value + animate()로 직접 제어한다.
  const motionLeft = useMotionValue(position.x);
  const motionTop = useMotionValue(position.y);
  const isDraggingRef = useRef(false);
  // 드래그 중 누적 이동량(px) — 드래그 종료 시 "포인터가 실제로 도달한 화면 좌표"를
  // 계산하는 데 쓴다(motionLeft/Top의 현재값 + 이 오프셋). PanInfo.offset은 드래그 시작점
  // 기준 누적값이라 매 onDrag마다 덮어쓰면 된다.
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const prevPositionRef = useRef(position);
  useEffect(() => {
    const prev = prevPositionRef.current;
    prevPositionRef.current = position;
    if (isDraggingRef.current) return; // 드래그 중엔 x/y(변위)만 움직이고 left/top은 그대로 둔다.
    // 드래그 종료 직후 onDragEnd가 motionLeft/Top에 구워 넣은 좌표와, 그 뒤 reducer를 거쳐
    // (비율로 저장했다가 다시 px로 복원하며) 돌아오는 position은 수학적으론 같은 지점이어도
    // 부동소수점 연산 특성상 마지막 자리가 다를 수 있다(예: 501.3319091796875 vs
    // ...968756). 완전히 같은 값(===)으로 비교하면 "실질적으로 안 움직였는데" animate()가
    // 걸려, 스프링이 그 미세한 차이에 속아 엉뚱하게 크게 움직였다 되돌아오는(드래그 경로를
    // 다시 밟는 것처럼 보이는) 현상이 있었다 — 1px 미만 차이는 "변화 없음"으로 취급한다.
    const EPSILON_PX = 1;
    if (Math.abs(prev.x - position.x) < EPSILON_PX && Math.abs(prev.y - position.y) < EPSILON_PX) return;

    if (prefersReducedMotion) {
      motionLeft.set(position.x);
      motionTop.set(position.y);
      return;
    }
    const spring = isPlaced ? SETTLE_SPRING : RETURN_SPRING;
    animate(motionLeft, position.x, spring);
    animate(motionTop, position.y, spring);
  }, [position, isPlaced, prefersReducedMotion, motionLeft, motionTop]);

  // 드래그 중 Esc로 취소(spec 4장: 칩은 드래그 시작 전 자리로 복귀) — dragControls.cancel()은
  // 드래그만 중단시킬 뿐 쌓인 변위를 되돌리지는 않으므로, 여기서도 motionX/Y를 직접 리셋한다.
  // onDragEnd는 호출하지 않아 reducer 상태는 그대로 — "드래그 시작 전 자리"는 곧 지금의
  // position(Home 또는 기존 자유 배치 위치)이라 left/top은 건드릴 필요가 없다.
  const dragControls = useDragControls();
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !isDraggingRef.current) return;
      dragControls.cancel();
      // cancel()도 release와 마찬가지로 inertia 애니메이션을 유발할 수 있어 stop()으로 끊는다.
      motionX.stop();
      motionY.stop();
      motionX.set('-50%');
      motionY.set('-50%');
      if (wasOverSlotRef.current) {
        wasOverSlotRef.current = false;
        onDragOverSlotChange(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dragControls, motionX, motionY, onDragOverSlotChange]);

  const style = {
    left: motionLeft,
    top: motionTop,
    x: motionX,
    y: motionY,
    rotate: position.rotateDeg,
    zIndex,
  };
  const setRef = (el: HTMLElement | null) => {
    if (el) chipRefs.set(keyword.id, el);
    else chipRefs.delete(keyword.id);
  };

  // onDragEnd에는 뷰포트 좌표(clientX/Y)를 넘긴다 — info.point는 page 좌표(pageX/Y)라
  // getBoundingClientRect() 기반 슬롯 판정과 스크롤이 있으면 어긋난다.
  const dragHandlers = {
    drag: true as const,
    dragControls,
    dragListener: true,
    dragMomentum: false,
    dragElastic: 0,
    onDragStart: () => {
      isDraggingRef.current = true;
      draggedInThisSessionRef.current = true;
      dragOffsetRef.current = { x: 0, y: 0 };
      wasOverSlotRef.current = false;
      onDragStart(keyword);
    },
    onDrag: (event: PointerEvent | MouseEvent | TouchEvent, info: { offset: Point }) => {
      dragOffsetRef.current = info.offset;
      // 포인터가 슬롯 안/밖을 넘나들 때만 알린다 — 매 프레임 호출하면 Hero.tsx가 매번
      // state를 갱신·리렌더링하게 되므로, 실제로 상태가 바뀔 때만 콜백을 부른다 (spec 4장).
      const isOver = isPointInSlot(getClientPoint(event), slotElRef.current);
      if (isOver !== wasOverSlotRef.current) {
        wasOverSlotRef.current = isOver;
        onDragOverSlotChange(isOver);
      }
    },
    // dragMomentum={false}는 release 시 초기 속도만 0으로 만들 뿐, Motion은 여전히
    // type: "inertia" 애니메이션을 x/y(motionX/Y)에 걸고 몇 프레임에 걸쳐 서서히 끝낸다 —
    // dragConstraints가 없으면 min/max 경계도 없어 그 몇 프레임 동안 값이 미세하게 흔들리며,
    // 이게 우리가 onDragEnd에서 set()한 "구워넣은 자리"와 경쟁해 드롭 직후 몇 프레임 동안
    // 가속도가 붙은 것처럼 밀렸다가 되돌아오는 것처럼 보였다(멀리 드래그할수록 이 관성
    // 애니메이션의 보폭도 커져 체감상 더 두드러진다). stop()으로 모든 motion value의 진행
    // 중인 애니메이션(이 inertia 포함)을 명시적으로 끊은 뒤에 원하는 값을 set()한다.
    onDragEnd: (event: PointerEvent | MouseEvent | TouchEvent) => {
      isDraggingRef.current = false;
      const settledX = motionLeft.get() + dragOffsetRef.current.x;
      const settledY = motionTop.get() + dragOffsetRef.current.y;
      motionX.stop();
      motionY.stop();
      motionLeft.stop();
      motionTop.stop();
      motionLeft.set(settledX);
      motionTop.set(settledY);
      motionX.set('-50%');
      motionY.set('-50%');
      prevPositionRef.current = { x: settledX, y: settledY, rotateDeg: position.rotateDeg };

      if (wasOverSlotRef.current) {
        wasOverSlotRef.current = false;
        onDragOverSlotChange(false);
      }

      onDragEnd(keyword, getClientPoint(event), { x: settledX, y: settledY });
    },
    whileDrag: { zIndex: DRAGGING_Z_INDEX },
  };

  // 클릭이 아니라 Motion의 onTap을 쓴다 — onClick은 평범한 합성 이벤트라 드래그와 무관하게
  // 항상 발생하지만, onTap은 Motion이 내부적으로 드래그 여부를 걸러준다. 다만 위 주석대로
  // 그 판별 타이밍이 우리 쪽 onDragEnd와 경쟁할 수 있어 draggedInThisSessionRef로 한 번 더 막는다.
  function handleTap() {
    if (draggedInThisSessionRef.current) {
      draggedInThisSessionRef.current = false;
      return;
    }
    onSelect(keyword);
  }

  // 슬롯에서 빠진 칩은 Ring에 새로 mount되며 Home 위치에 바로 나타난다(이동할 거리 자체가
  // 없어서 motionLeft/Top 애니메이션이 걸리지 않는다) — 등장 자체가 "짠" 하고 보이지 않도록
  // 짧은 페이드인을 둔다.
  const mountFade = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } };

  if (keyword.type === 'nav') {
    return (
      <NavPill
        ref={setRef}
        label={keyword.label}
        href={keyword.href ?? '#'}
        className="pointer-events-auto absolute"
        style={style}
        {...mountFade}
        {...dragHandlers}
        onClick={(e) => e.preventDefault()}
        onTap={handleTap}
      />
    );
  }

  return (
    <KeywordPill
      ref={setRef}
      label={keyword.label}
      className="pointer-events-auto absolute"
      style={style}
      {...mountFade}
      {...dragHandlers}
      onTap={handleTap}
    />
  );
}

export function Ring({
  keywords,
  viewportWidth,
  viewportHeight,
  heroCopyCenterY,
  heroCopyHalfHeight,
  slot,
  onSelect,
  placed,
  stack,
  onDragStart,
  onDragEnd,
  onDragOverSlotChange,
  slotElRef,
  chipRefs,
}: RingProps) {
  // 슬롯에 들어간 칩은 Ring에서 자리를 비워둔다 — 나머지 칩은 각자의 각도/순서를 그대로 유지
  const visibleKeywords = keywords.filter((keyword) => keyword.id !== slot);

  const useRingLayout = canUseRingLayout(viewportWidth, viewportHeight);

  const homePositionById = useRingLayout
    ? new Map(
        computeRingPositions({
          viewportWidth,
          viewportHeight,
          rotations: keywords.map((k) => k.ring.rotate),
        }).map((position, i) => [keywords[i].id, position]),
      )
    : null;

  function resolvePosition(keyword: HeroKeyword, homePosition: Point & { rotateDeg: number }) {
    const placedPosition = placed[keyword.id];
    if (!placedPosition) return { position: homePosition, isPlaced: false };

    return {
      position: { ...fromPlacedPosition(placedPosition, { width: viewportWidth, height: viewportHeight }), rotateDeg: homePosition.rotateDeg },
      isPlaced: true,
    };
  }

  function zIndexFor(keyword: HeroKeyword, isPlaced: boolean, fallback: number) {
    if (!isPlaced) return fallback;
    // 자유 배치 칩끼리는 stack(마지막이 맨 위) 순서를 따른다 — PLACED_Z_INDEX를 베이스로 둬
    // Home 위치의 칩들보다는 항상 위, 서로 간의 순서는 stack 인덱스로 정한다.
    const stackIndex = stack.indexOf(keyword.id);
    return PLACED_Z_INDEX + (stackIndex === -1 ? 0 : stackIndex);
  }

  if (useRingLayout) {
    return (
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden={false}>
        {visibleKeywords.map((keyword) => {
          const { position, isPlaced } = resolvePosition(keyword, homePositionById!.get(keyword.id)!);
          return (
            <Chip
              key={keyword.id}
              keyword={keyword}
              position={position}
              isPlaced={isPlaced}
              onSelect={onSelect}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOverSlotChange={onDragOverSlotChange}
              slotElRef={slotElRef}
              chipRefs={chipRefs}
              zIndex={zIndexFor(keyword, isPlaced, 0)}
            />
          );
        })}
      </div>
    );
  }

  // 띠 배치: 링 순서(인덱스) 기준 앞쪽 절반은 위쪽 띠, 뒤쪽 절반은 아래쪽 띠 (spec 7장).
  // 위치는 항상 전체 칩 기준으로 계산하고(슬롯에 들어간 칩도 자리를 차지한 채로 계산), 렌더링
  // 시에만 슬롯에 들어간 칩을 제외한다 — 그래야 자리가 "비워질" 뿐 나머지 칩이 당겨붙지 않는다.
  const splitIndex = Math.ceil(keywords.length / 2);
  const topKeywords = keywords.slice(0, splitIndex);
  const bottomKeywords = keywords.slice(splitIndex);

  const { top, bottom } = computeStripLayout({
    viewportWidth,
    viewportHeight,
    topRotations: topKeywords.map((k) => k.ring.rotate),
    bottomRotations: bottomKeywords.map((k) => k.ring.rotate),
    heroCopyCenterY,
    heroCopyHalfHeight,
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden={false}>
      {/* 폭이 좁아 칩끼리 겹칠 때 링 순서(인덱스)가 뒤인 칩이 위로 쌓이게 z-index를 순서대로 준다 */}
      {topKeywords.map((keyword, i) => {
        if (keyword.id === slot) return null;
        const { position, isPlaced } = resolvePosition(keyword, top[i]);
        return (
          <Chip
            key={keyword.id}
            keyword={keyword}
            position={position}
            isPlaced={isPlaced}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOverSlotChange={onDragOverSlotChange}
            slotElRef={slotElRef}
            chipRefs={chipRefs}
            zIndex={zIndexFor(keyword, isPlaced, i)}
          />
        );
      })}
      {bottomKeywords.map((keyword, i) => {
        if (keyword.id === slot) return null;
        const { position, isPlaced } = resolvePosition(keyword, bottom[i]);
        return (
          <Chip
            key={keyword.id}
            keyword={keyword}
            position={position}
            isPlaced={isPlaced}
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOverSlotChange={onDragOverSlotChange}
            slotElRef={slotElRef}
            chipRefs={chipRefs}
            zIndex={zIndexFor(keyword, isPlaced, topKeywords.length + i)}
          />
        );
      })}
    </div>
  );
}
