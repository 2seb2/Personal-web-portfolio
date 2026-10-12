// 히어로 상태 관리. spec 3장 상태표를 그대로 구현한다.

export type PlacedPosition = { x: number; y: number };

export type HeroState = {
  /** 슬롯에 들어간 keyword id. 없으면 null (Empty) */
  slot: string | null;
  /** 이동 대기 중인 nav id. 없으면 null */
  navigating: string | null;
  /** 자유 배치된 칩의 위치 (Hero 영역 기준 비율 0~1). 없는 칩은 Home 위치 */
  placed: Record<string, PlacedPosition>;
  /** 자유 배치 칩의 겹침 순서. 마지막 원소가 맨 위 */
  stack: string[];
};

export const initialHeroState: HeroState = {
  slot: null,
  navigating: null,
  placed: {},
  stack: [],
};

export type HeroAction =
  /** keyword를 슬롯에 넣는다 (드래그/클릭/Enter/탭 공통) */
  | { type: 'PLACE_KEYWORD'; id: string }
  /** nav를 슬롯에 넣는다 → Navigating 시작, Ring 숨김 */
  | { type: 'PLACE_NAV'; id: string }
  /** 슬롯 안의 keyword 칩을 탭/클릭/Enter → Empty로, 칩은 Home 위치로 복귀 */
  | { type: 'RESET_SLOT' }
  /** 칩을 슬롯 밖에 자유 배치 */
  | { type: 'DROP_FREE'; id: string; position: PlacedPosition }
  /** 칩을 잡아 드래그를 시작 — 겹침 순서를 맨 위로 올린다 */
  | { type: 'PICK_UP'; id: string }
  /** 정리 버튼 — 자유 배치된 칩을 모두 Home 위치로 되돌린다 */
  | { type: 'TIDY' }
  /** 이동 완료 — Navigating 상태를 정리한다 (실제 페이지 이동은 컴포넌트가 수행) */
  | { type: 'NAVIGATE_SETTLED' }
  /** 다른 페이지로 이동했다 뒤로가기 등으로 홈에 돌아옴 → Empty, 모든 칩 Home 위치 (spec 3장) */
  | { type: 'RESET_ALL' };

function moveToTopOfStack(stack: string[], id: string): string[] {
  return [...stack.filter((stackId) => stackId !== id), id];
}

function removeFromPlaced(
  placed: Record<string, PlacedPosition>,
  id: string,
): Record<string, PlacedPosition> {
  if (!(id in placed)) return placed;
  const next = { ...placed };
  delete next[id];
  return next;
}

export function heroReducer(state: HeroState, action: HeroAction): HeroState {
  // Navigating 중에는 칩 조작을 모두 무시한다 (spec 3장 "Navigating | 칩 드래그 시도 | 무시").
  // RESET_ALL은 예외 — 페이지를 떠나는 도중(Navigating)에 뒤로가기로 돌아와도 반드시 Empty가 되어야 한다.
  if (state.navigating && action.type !== 'NAVIGATE_SETTLED' && action.type !== 'RESET_ALL') {
    return state;
  }

  switch (action.type) {
    case 'PLACE_KEYWORD': {
      // Empty | Filled(k) + keyword 넣기 → Filled(id)
      // 이전에 슬롯에 있던 keyword(k)는 Home 위치로 복귀 (자유 배치 기록 제거)
      const placed =
        state.slot && state.slot !== action.id
          ? removeFromPlaced(state.placed, state.slot)
          : state.placed;

      return { ...state, slot: action.id, placed };
    }

    case 'PLACE_NAV': {
      // Empty·Filled + nav 넣기 → Navigating, Ring 숨김.
      // 이전에 슬롯에 있던 keyword는 Home 위치로 복귀(자유 배치 기록 제거) — Navigating 중
      // Headline 슬롯 자리는 nav 라벨이 차지한다(spec 5장 "I'm 세비 [프로젝트 →] 를 구경해봐요")
      const placed = state.slot ? removeFromPlaced(state.placed, state.slot) : state.placed;
      return { ...state, slot: null, navigating: action.id, placed };
    }

    case 'RESET_SLOT': {
      if (!state.slot) return state;
      // Filled(k) + 슬롯 안 칩 탭 → Empty, k는 Home 위치로 복귀
      return { ...state, slot: null, placed: removeFromPlaced(state.placed, state.slot) };
    }

    case 'DROP_FREE': {
      return {
        ...state,
        placed: { ...state.placed, [action.id]: action.position },
        stack: moveToTopOfStack(state.stack, action.id),
      };
    }

    case 'PICK_UP': {
      return { ...state, stack: moveToTopOfStack(state.stack, action.id) };
    }

    case 'TIDY': {
      // 자유 배치된 칩 모두 Home 위치로. 슬롯에 들어간 칩은 그대로 (slot은 건드리지 않음)
      return { ...state, placed: {}, stack: [] };
    }

    case 'NAVIGATE_SETTLED': {
      return { ...state, navigating: null };
    }

    case 'RESET_ALL': {
      return initialHeroState;
    }

    default:
      return state;
  }
}
