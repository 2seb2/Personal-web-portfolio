// spec 3장 상태표의 모든 행을 테스트한다.
import { describe, expect, it } from 'vitest';
import { heroReducer, initialHeroState, type HeroState } from './reducer';

describe('heroReducer', () => {
  it('Empty + keyword 넣기 → Filled(k), k는 Ring에서 빠짐(=slot)', () => {
    const next = heroReducer(initialHeroState, { type: 'PLACE_KEYWORD', id: 'rewrite' });
    expect(next.slot).toBe('rewrite');
  });

  it('Filled(k) + 다른 keyword 넣기 → Filled(k2), k는 Home 위치로 복귀(자유 배치됐던 자리 아님)', () => {
    const filled: HeroState = {
      ...initialHeroState,
      slot: 'rewrite',
      placed: { rewrite: { x: 0.3, y: 0.4 } },
    };

    const next = heroReducer(filled, { type: 'PLACE_KEYWORD', id: 'e2e' });

    expect(next.slot).toBe('e2e');
    expect(next.placed).not.toHaveProperty('rewrite');
  });

  it('Filled(k) + 슬롯 안의 칩 탭/클릭/Enter → Empty, k는 Home 위치로 복귀', () => {
    const filled: HeroState = {
      ...initialHeroState,
      slot: 'rewrite',
      placed: { rewrite: { x: 0.3, y: 0.4 } },
    };

    const next = heroReducer(filled, { type: 'RESET_SLOT' });

    expect(next.slot).toBeNull();
    expect(next.placed).not.toHaveProperty('rewrite');
  });

  it('Empty + nav 넣기 → Navigating, Ring 숨김', () => {
    const next = heroReducer(initialHeroState, { type: 'PLACE_NAV', id: 'go-projects' });
    expect(next.navigating).toBe('go-projects');
  });

  it('Filled + nav 넣기 → Navigating, 슬롯은 비워짐(Navigating 중 Headline 슬롯 자리는 nav가 차지, spec 5장)', () => {
    const filled: HeroState = {
      ...initialHeroState,
      slot: 'rewrite',
      placed: { rewrite: { x: 0.3, y: 0.4 } },
    };
    const next = heroReducer(filled, { type: 'PLACE_NAV', id: 'go-articles' });
    expect(next.navigating).toBe('go-articles');
    expect(next.slot).toBeNull();
    expect(next.placed).not.toHaveProperty('rewrite');
  });

  it('Navigating + 1.2s 경과(NAVIGATE_SETTLED) → navigating 정리 (실제 이동은 컴포넌트가 수행)', () => {
    const navigating: HeroState = { ...initialHeroState, navigating: 'go-projects' };
    const next = heroReducer(navigating, { type: 'NAVIGATE_SETTLED' });
    expect(next.navigating).toBeNull();
  });

  it('Navigating + 칩 드래그 시도(PLACE_KEYWORD) → 무시, 상태 그대로', () => {
    const navigating: HeroState = { ...initialHeroState, navigating: 'go-projects' };
    const next = heroReducer(navigating, { type: 'PLACE_KEYWORD', id: 'rewrite' });
    expect(next).toEqual(navigating);
  });

  it('Navigating + 다른 nav 넣기 시도 → 무시, 상태 그대로', () => {
    const navigating: HeroState = { ...initialHeroState, navigating: 'go-projects' };
    const next = heroReducer(navigating, { type: 'PLACE_NAV', id: 'go-articles' });
    expect(next).toEqual(navigating);
  });

  it('드래그 중 슬롯 밖에 놓음(DROP_FREE) → 상태 그대로, 칩은 놓은 자리에 머묾', () => {
    const next = heroReducer(initialHeroState, {
      type: 'DROP_FREE',
      id: 'rewrite',
      position: { x: 0.2, y: 0.5 },
    });

    expect(next.slot).toBeNull();
    expect(next.placed.rewrite).toEqual({ x: 0.2, y: 0.5 });
  });

  it('아무 상태 + 정리 버튼(TIDY) → 상태 그대로, 자유 배치된 칩 모두 Home 위치로. 슬롯에 들어간 칩은 그대로', () => {
    const withPlaced: HeroState = {
      ...initialHeroState,
      slot: 'rewrite',
      placed: { e2e: { x: 0.1, y: 0.1 }, bundle47: { x: 0.9, y: 0.9 } },
      stack: ['e2e', 'bundle47'],
    };

    const next = heroReducer(withPlaced, { type: 'TIDY' });

    expect(next.placed).toEqual({});
    expect(next.stack).toEqual([]);
    expect(next.slot).toBe('rewrite'); // 슬롯 상태는 그대로
  });

  it('같은 keyword를 다시 넣어도(PLACE_KEYWORD 동일 id) 상태가 바뀌지 않는다', () => {
    const filled: HeroState = { ...initialHeroState, slot: 'rewrite' };
    const next = heroReducer(filled, { type: 'PLACE_KEYWORD', id: 'rewrite' });
    expect(next.slot).toBe('rewrite');
    expect(next.placed).toEqual(filled.placed);
  });

  it('RESET_SLOT을 Empty 상태에서 호출해도 안전하게 무시된다', () => {
    const next = heroReducer(initialHeroState, { type: 'RESET_SLOT' });
    expect(next).toEqual(initialHeroState);
  });

  it('RESET_ALL → 어떤 상태에서든 초기 상태(Empty, 모든 칩 Home 위치)로 돌아간다 (spec 3장 "뒤로가기로 돌아옴")', () => {
    const messy: HeroState = {
      slot: 'rewrite',
      navigating: null,
      placed: { e2e: { x: 0.1, y: 0.1 } },
      stack: ['e2e'],
    };
    const next = heroReducer(messy, { type: 'RESET_ALL' });
    expect(next).toEqual(initialHeroState);
  });

  it('Navigating 중에도 RESET_ALL은 무시되지 않는다 (페이지를 떠나는 도중 뒤로가기로 돌아올 수 있음)', () => {
    const navigating: HeroState = { ...initialHeroState, navigating: 'go-projects', slot: 'rewrite' };
    const next = heroReducer(navigating, { type: 'RESET_ALL' });
    expect(next).toEqual(initialHeroState);
  });

  describe('겹침 순서 (stack)', () => {
    it('칩을 잡으면(PICK_UP) 겹침 순서 맨 위로 올라간다', () => {
      const state: HeroState = { ...initialHeroState, stack: ['a', 'b'] };
      const next = heroReducer(state, { type: 'PICK_UP', id: 'a' });
      expect(next.stack).toEqual(['b', 'a']);
    });

    it('자유 배치(DROP_FREE)도 겹침 순서를 맨 위로 올린다', () => {
      const state: HeroState = {
        ...initialHeroState,
        stack: ['a', 'b'],
        placed: { a: { x: 0, y: 0 }, b: { x: 1, y: 1 } },
      };
      const next = heroReducer(state, {
        type: 'DROP_FREE',
        id: 'a',
        position: { x: 0.5, y: 0.5 },
      });
      expect(next.stack).toEqual(['b', 'a']);
    });
  });
});
