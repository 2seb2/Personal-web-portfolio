'use client';

import { useRef } from 'react';
import { useMotionValue } from 'motion/react';
import { KeywordPill } from '@/components/ui/KeywordPill';
import { NavPill } from '@/components/ui/NavPill';
import type { HeroKeyword } from '@/types/content';
import { canUseRingLayout, computeRingPositions, computeStripLayout, type Point } from './geometry';
import { fromPlacedPosition, getClientPoint } from './useDropTarget';
import type { PlacedPosition } from './reducer';

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
  /** Navigating 중이면 Ring 전체를 숨긴다(spec 5장) */
  navigating: boolean;
  onSelect: (keyword: HeroKeyword) => void;
  /** 자유 배치된 칩의 위치 (Hero 영역 기준 비율 0~1). spec 3·4장 */
  placed: Record<string, PlacedPosition>;
  /** 자유 배치 칩의 겹침 순서. 마지막 원소가 맨 위 */
  stack: string[];
  /** 드래그 시작 — 겹침 순서를 맨 위로 올린다 (spec 4장) */
  onDragStart: (keyword: HeroKeyword) => void;
  /** 드래그 종료 — 포인터 좌표로 슬롯 안/밖을 판정해 PLACE_* 또는 DROP_FREE를 결정한다 (spec 4장) */
  onDragEnd: (keyword: HeroKeyword, point: { x: number; y: number }) => void;
  /** 칩 DOM 요소를 id로 등록해 포커스 이동(spec 10장)에 쓴다 */
  chipRefs: Map<string, HTMLElement>;
};

type ChipProps = {
  keyword: HeroKeyword;
  position: Point & { rotateDeg: number };
  onSelect: (keyword: HeroKeyword) => void;
  onDragStart: (keyword: HeroKeyword) => void;
  onDragEnd: (keyword: HeroKeyword, point: { x: number; y: number }) => void;
  chipRefs: Map<string, HTMLElement>;
  zIndex: number;
};

function Chip({ keyword, position, onSelect, onDragStart, onDragEnd, chipRefs, zIndex }: ChipProps) {
  // Motion은 같은 pointerup에서 press(tap) 제스처와 drag 제스처를 독립적으로 처리한다.
  // 드래그 종료 시점에 내부 "드래그 중" 전역 플래그가 onDragEnd 콜백 실행보다 먼저 꺼지는
  // 경우가 있어, onTap의 자체 드래그 판별(isDragActive 체크)이 이미 늦어 "드래그가 아니었다"고
  // 오판하고 onSelect를 부를 수 있다 — 포인터를 슬롯 밖에 놓아 자유 배치(DROP_FREE)했는데도
  // 곧바로 onTap이 그 칩을 슬롯에 넣어버리는(PLACE_KEYWORD) 버그가 이것이었다. onDragStart와
  // onTap/onDragEnd 호출 순서가 실행마다 달라질 수 있어(둘 중 하나가 플래그를 리셋), 어느 쪽이
  // 먼저 오든 "이번 포인터 세션에 drag가 있었는지"만 보고 그 다음 onTap 한 번을 무시한다.
  const draggedInThisSessionRef = useRef(false);

  // Motion은 drag 중 자신이 관리하는 x/y(변위)를 transform에 합성한다 — 여기에 또 다른
  // transform 문자열(중앙 정렬 -50%, 회전)을 같이 넣으면 Motion이 그 값을 지워버려 칩이
  // 포인터 중심이 아니라 모서리 기준으로 움직이게 된다. 그래서 중앙 정렬은 Motion이 직접
  // 추적하는 motion value(x/y)로 주고, 드래그 변위가 그 위에 더해지게 한다. x/y를 motion
  // value로 직접 들고 있는 이유는 드래그가 끝난 뒤 리셋하기 위해서다 — Motion은 드래그가
  // 끝나도 쌓인 변위를 자동으로 비우지 않아서, left/top(좌표 자체)이 새 위치로 바뀌어도
  // 이전 드래그 변위가 transform에 그대로 남아 전혀 엉뚱한 화면 위치에 그려지는 버그가 있었다.
  const motionX = useMotionValue('-50%');
  const motionY = useMotionValue('-50%');
  const style = {
    left: position.x,
    top: position.y,
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
    dragMomentum: false,
    dragElastic: 0,
    onDragStart: () => {
      draggedInThisSessionRef.current = true;
      onDragStart(keyword);
    },
    onDragEnd: (event: PointerEvent | MouseEvent | TouchEvent) => {
      onDragEnd(keyword, getClientPoint(event));
      // 드래그로 쌓인 변위를 비우고 중앙 정렬 기준으로 되돌린다 — 다음 렌더에서 left/top이
      // (슬롯이든 자유 배치든) 새 위치로 바뀌므로, x/y는 그 위에 다시 "-50%"만 더하면 된다.
      motionX.set('-50%');
      motionY.set('-50%');
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

  if (keyword.type === 'nav') {
    return (
      <NavPill
        ref={setRef}
        label={keyword.label}
        href={keyword.href ?? '#'}
        className="pointer-events-auto absolute"
        style={style}
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
  navigating,
  onSelect,
  placed,
  stack,
  onDragStart,
  onDragEnd,
  chipRefs,
}: RingProps) {
  if (navigating) return null;

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
              onSelect={onSelect}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
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
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
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
            onSelect={onSelect}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            chipRefs={chipRefs}
            zIndex={zIndexFor(keyword, isPlaced, topKeywords.length + i)}
          />
        );
      })}
    </div>
  );
}
