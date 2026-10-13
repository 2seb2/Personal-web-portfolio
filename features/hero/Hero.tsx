'use client';

import { useEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { site } from '@/content/site';
import { keywords } from '@/content/keywords';
import type { HeroKeyword } from '@/types/content';
import { Ring } from './Ring';
import { MobileKeywordList } from './MobileKeywordList';
import { heroReducer, initialHeroState } from './reducer';
import { consumeHeroResetPending } from './resetEvent';
import { isPointInSlot, toPlacedPositionFromChipCenter } from './useDropTarget';
import {
  RETURN_SPRING,
  SLOT_FILL_DURATION_S,
  SUBCOPY_RISE_PX,
  SUBCOPY_TRANSITION_DURATION_S,
} from './animation';

/** Nav 높이(px). Ring은 Hero 섹션(Nav 아래) 기준 좌표계를 쓰므로 섹션 자체 높이를 구할 때 뺀다 */
const NAV_HEIGHT_PX = 57;
const FALLBACK_SECTION_SIZE = { width: 1512, height: 982 - NAV_HEIGHT_PX };
/** Hero Copy 블록 실측 전 기본값(띠 배치 fallback, 대략적인 1512px 기준 블록 높이) */
const FALLBACK_HERO_COPY = { centerY: FALLBACK_SECTION_SIZE.height / 2, halfHeight: 130 };

/** Navigating 상태에서 페이지 이동까지 대기하는 시간(ms). spec 3·5장 */
const NAVIGATE_DELAY_MS = 1200;

const keywordById = new Map(keywords.map((keyword) => [keyword.id, keyword]));

/** 정리 버튼 라벨 앞 새로고침 아이콘. TidyButton.tsx의 같은 아이콘과 동일한 path를 쓴다 */
function TidyIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1.5 6c0 .89.264 1.76.758 2.5.495.74 1.198 1.317 2.02 1.658.823.34 1.727.429 2.6.255.873-.173 1.675-.602 2.304-1.231.63-.63 1.058-1.431 1.232-2.305.173-.873.085-1.778-.256-2.6a4.502 4.502 0 0 0-1.658-2.02A4.498 4.498 0 0 0 6 1.5c-1.258.005-2.466.496-3.37 1.37L1.5 4"
      />
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M1.5 1.5V4H4" />
    </svg>
  );
}

export function Hero() {
  const { hero } = site;
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [sectionSize, setSectionSize] = useState(FALLBACK_SECTION_SIZE);
  const [heroCopyMetrics, setHeroCopyMetrics] = useState(FALLBACK_HERO_COPY);
  const [state, dispatch] = useReducer(heroReducer, initialHeroState);
  /** spec 10장 aria-live 안내 중 "이벤트성" 문구(리셋 안내 등). Subcopy 앞에 sr-only로 붙는다 */
  const [announcementPrefix, setAnnouncementPrefix] = useState('');
  /** 드래그 중 포인터가 슬롯 영역 위에 있는지 — 슬롯 테두리·scale로 드롭 가능 여부를 보여준다 (spec 4장) */
  const [isOverSlot, setIsOverSlot] = useState(false);
  /**
   * 정리 버튼이 막 나타난 순간인지 — true인 동안만 brand 색으로 보이다가 CSS transition으로
   * 기본 색으로 식는다. 처음 자유 배치를 만들 때 버튼 등장이 눈에 잘 안 띈다는 피드백으로 추가.
   * 색 자체는 Tailwind 클래스 토글(순수 CSS transition)로 처리한다 — Motion whileHover의
   * borderColor 캐싱 버그(KeywordPill 참고)를 피하기 위해 색상 보간은 Motion에 맡기지 않는다.
   */
  const [tidyJustAppeared, setTidyJustAppeared] = useState(false);
  /**
   * 슬롯 pill이 지금 Empty↔Filled "색이 채워지거나 빠지는" 모핑 중인지, 어느 방향인지.
   * 'filling'(Empty→Filled) 동안은 Subcopy·꼬리말을 비워두고 모핑이 끝난 뒤 페이드인한다.
   * 'draining'(Filled→Empty) 동안은 기본 Subcopy가 즉시 겹쳐서 나타나고 기존 것만 fade out.
   * 칩을 다른 칩으로 교체(Filled→Filled)할 때는 모핑이 없으므로(null) 건드리지 않는다.
   */
  const [slotMorphDirection, setSlotMorphDirection] = useState<'filling' | 'draining' | null>(null);

  // Ring(링·띠)과 모바일 목록은 뷰포트와 무관하게 둘 다 DOM에 존재한다(CSS로만 숨김).
  // 같은 id가 두 곳에 있을 수 있으므로 레이아웃별로 Map을 분리해 보이는 쪽만 포커스한다.
  const [desktopChipRefs] = useState(() => new Map<string, HTMLElement>());
  const [mobileChipRefs] = useState(() => new Map<string, HTMLElement>());
  // Empty·Filled·Navigating 세 상태가 각각 다른 요소(span/button/span)를 렌더링하므로, 드래그
  // 판정이 상태와 무관하게 항상 같은 슬롯 영역을 보도록 공통 ref 콜백으로 그때그때 현재
  // 렌더링된 요소를 받는다 — Filled일 때의 <button>에만 ref를 달면 Empty(placeholder)일 때는
  // slotRef.current가 계속 null이라 "슬롯이 비어 있을 때는 드래그로 아예 넣을 수 없는" 버그가 된다.
  const slotRef = useRef<HTMLElement | null>(null);
  const setSlotRef = (el: HTMLElement | null) => {
    slotRef.current = el;
  };
  /** 다음 렌더 후 포커스를 옮길 대상. 'slot' 또는 칩 id */
  const pendingFocusTarget = useRef<'slot' | string | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      setSectionSize({ width: window.innerWidth, height: window.innerHeight - NAV_HEIGHT_PX });

      const sectionRect = sectionRef.current?.getBoundingClientRect();
      const copyRect = copyRef.current?.getBoundingClientRect();
      if (sectionRect && copyRect) {
        setHeroCopyMetrics({
          centerY: copyRect.top - sectionRect.top + copyRect.height / 2,
          halfHeight: copyRect.height / 2,
        });
      }
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  // 로고(홈 링크)를 누르면 어디서 왔든, 심지어 이미 홈이어도 항상 Empty로 초기화한다.
  // Nav는 Hero와 다른 컴포넌트 트리라 props로 직접 연결할 수 없어 sessionStorage 플래그로
  // 전달한다(resetEvent.ts 주석 참고 — CustomEvent는 Router Cache 재사용 시 타이밍이 안 맞음).
  // deps 없이 둬서 어떤 이유로 리렌더링되든(pathname 변화 포함) 매번 플래그를 확인한다 —
  // 플래그가 없으면 consumeHeroResetPending()이 즉시 false를 반환해 비용이 거의 없다.
  useEffect(() => {
    if (consumeHeroResetPending()) dispatch({ type: 'RESET_ALL' });
  });

  // pathname이 바뀌는 것 자체가 리렌더링을 보장하지 않을 수 있는 경우(예: 이미 홈에서 다시
  // 홈 링크를 눌러 pathname이 그대로인 경우)를 대비해, pathname을 구독해 강제로 리렌더링을
  // 유발한다 — 그러면 위 effect가 다시 실행되어 플래그를 확인하게 된다.
  const pathname = usePathname();

  // router.push()는 완료를 알려주는 Promise/콜백이 없다(void 반환) — "실제로 다른 페이지로
  // 이동했는지"는 Next.js가 공식 권장하는 대로 usePathname()의 변화로 관찰한다. Navigating
  // 중 router.push를 호출한 바로 그 틱에 RESET_ALL을 dispatch하면, 라우팅은 비동기라 아직
  // 이 페이지(Empty로 돌아간 홈)가 화면에 떠 있는 채로 한 프레임 보였다가 전환되는 깜빡임이
  // 있었다 — pathname이 실제로 바뀐 뒤에만 리셋해 그 깜빡임을 없앤다.
  const wasNavigatingRef = useRef(false);
  useEffect(() => {
    if (state.navigating) wasNavigatingRef.current = true;
  }, [state.navigating]);
  useEffect(() => {
    if (!wasNavigatingRef.current) return;
    wasNavigatingRef.current = false;
    dispatch({ type: 'RESET_ALL' });
  }, [pathname]);

  // 브라우저 자체의 뒤로가기 캐시(bfcache)로 복원되는 경우를 위한 보조 안전장치.
  // Next.js Router Cache를 쓰는 일반적인 페이지 전환에서는 발생하지 않지만(그 경우는
  // 위 로고 클릭 리셋과 아래 "떠나기 직전 리셋"으로 커버), 완전한 브라우저 bfcache
  // 복원 시에는 이 이벤트가 발생한다.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) dispatch({ type: 'RESET_ALL' });
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Navigating 상태가 되면 1.2s 뒤 이동한다 (spec 3·5장). Hero Copy 클릭 시 즉시 이동(아래 handleHeroCopyClick).
  // RESET_ALL은 여기서 바로 dispatch하지 않는다 — router.push 직후 같은 틱에 리셋하면 아직
  // 라우팅이 끝나기 전(비동기)인 홈 화면이 Empty로 되돌아간 모습이 한 프레임 보였다가 전환되는
  // 깜빡임이 있었다. 실제로 리셋하는 시점은 위 pathname 변화 감지 effect가 맡는다(spec 3장
  // "뒤로가기로 돌아옴: Empty"도 같은 경로로 커버된다 — 뒤로가기도 pathname이 바뀌니까).
  useEffect(() => {
    if (!state.navigating) return;
    const target = keywordById.get(state.navigating);
    if (!target?.href) return;

    const timer = setTimeout(() => {
      router.push(target.href!);
    }, NAVIGATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state.navigating, router]);

  // 칩을 슬롯에 넣거나 슬롯을 비운 뒤 포커스를 옮긴다 (spec 10장 "포커스는 누른 칩 자리에 그대로").
  // 슬롯은 DOM상 항상 Headline 위치에 있어 Tab 자연 순서로는 그 "자리"로 보낼 수 없으므로,
  // 선택 직후 JS로 슬롯 버튼(넣을 때) 또는 원래 칩(비울 때)으로 포커스를 직접 옮긴다.
  useEffect(() => {
    const target = pendingFocusTarget.current;
    if (!target) return;
    pendingFocusTarget.current = null;
    if (target === 'slot') {
      slotRef.current?.focus();
      return;
    }
    const isMobile = sectionSize.width < 768;
    const refs = isMobile ? mobileChipRefs : desktopChipRefs;
    refs.get(target)?.focus();
  }, [state.slot, sectionSize.width, desktopChipRefs, mobileChipRefs]);

  function handleSelect(keyword: HeroKeyword) {
    if (state.navigating) return;

    if (state.slot === keyword.id) {
      // 슬롯 안의 칩을 다시 선택 → 비우기. 칩이 Ring/목록에 다시 나타나므로 포커스를 그 칩으로 옮긴다.
      pendingFocusTarget.current = keyword.id;
      dispatch({ type: 'RESET_SLOT' });
      setAnnouncementPrefix(hero.live.reset + ' ');
      return;
    }

    // 슬롯에 넣기 → 그 칩은 Ring/목록에서 사라지고 슬롯 버튼이 자리를 대신하므로 포커스를 슬롯으로 옮긴다.
    pendingFocusTarget.current = 'slot';

    if (keyword.type === 'nav') {
      dispatch({ type: 'PLACE_NAV', id: keyword.id });
    } else {
      dispatch({ type: 'PLACE_KEYWORD', id: keyword.id });
      setAnnouncementPrefix(hero.live.filled(keyword.label));
    }
  }

  function handleDragStart(keyword: HeroKeyword) {
    if (state.navigating) return;
    dispatch({ type: 'PICK_UP', id: keyword.id });
  }

  // 드래그를 놓는 순간 포인터 좌표(뷰포트 기준)로 슬롯 안/밖을 판정한다 (spec 4장).
  // 슬롯 안이면 클릭과 같은 결과(PLACE_KEYWORD/PLACE_NAV), 밖이면 그 자리에 자유 배치(DROP_FREE).
  // 자유 배치 위치는 포인터 좌표가 아니라 칩 중심 좌표(chipCenter)로 저장한다 — 포인터로
  // 저장하면 드래그 시작 시 포인터가 칩 중심을 정확히 잡지 않은 만큼 어긋나, 드롭 직후 칩이
  // 그 차이만큼 다시 튀어 보정되는(스프링 오버슈트처럼 보이는) 문제가 있었다.
  function handleDragEnd(
    keyword: HeroKeyword,
    point: { x: number; y: number },
    chipCenter: { x: number; y: number },
  ) {
    if (state.navigating) return;

    if (isPointInSlot(point, slotRef.current)) {
      handleSelect(keyword);
      return;
    }

    const position = toPlacedPositionFromChipCenter(chipCenter, sectionSize);
    dispatch({ type: 'DROP_FREE', id: keyword.id, position });
  }

  function handleTidy() {
    dispatch({ type: 'TIDY' });
    setAnnouncementPrefix(hero.live.tidy + ' ');
  }

  function handleHeroCopyClick() {
    if (!state.navigating) return;
    const target = keywordById.get(state.navigating);
    if (!target?.href) return;
    router.push(target.href);
  }

  const slotKeyword = state.slot ? keywordById.get(state.slot) : null;
  const navigatingKeyword = state.navigating ? keywordById.get(state.navigating) : null;
  const hasPlacedChips = Object.keys(state.placed).length > 0;
  // 슬롯 pill이 지금 "무언가로 채워진" 상태인지 — keyword든 nav든 상관없이, Empty가 아니면 true.
  // Empty↔(Filled|Navigating) 전환에서 pill의 배경·글자색이 채워지거나/빠지는 모핑이 필요하고,
  // Filled→Navigating(둘 다 채워진 상태끼리 전환)에서는 모핑 없이 텍스트만 바뀌어야 한다.
  const isSlotFilled = Boolean(slotKeyword) || Boolean(navigatingKeyword);
  // pill에 보여줄 라벨 — keyword든 nav든 같은 자리에 표시한다.
  const filledLabel = navigatingKeyword?.label ?? slotKeyword?.label ?? null;

  // draining(Filled→Empty 모핑) 중에는 state.slot이 이미 null이라 slotKeyword도 null이다 —
  // 그 동안 "빠지기 전 칩"의 subcopy를 계속 fade out으로 보여줘야 하므로 마지막 값을 기억한다.
  // 렌더링 중 state를 조정하는 React 권장 패턴(ref가 아니라 state로 이전 값을 들고, 값이
  // 달라졌을 때만 렌더 중에 바로 set) — ref는 렌더 중 읽거나 쓸 수 없어 lint 규칙에 걸린다.
  const [lastSlotKeyword, setLastSlotKeyword] = useState(slotKeyword);
  if (slotKeyword && slotKeyword !== lastSlotKeyword) setLastSlotKeyword(slotKeyword);

  // Empty↔(Filled|Navigating) 전환(isSlotFilled가 바뀜)일 때만 "색이 채워지거나 빠지는"
  // 모핑을 건다. Filled→Filled나 Filled→Navigating처럼 둘 다 "채워진" 상태끼리 바뀌는
  // 전환은 모핑 대상이 아니다 — pill 배경은 이미 selected라 다시 채울 필요가 없다.
  const [prevIsSlotFilled, setPrevIsSlotFilled] = useState(isSlotFilled);
  if (isSlotFilled !== prevIsSlotFilled) {
    setPrevIsSlotFilled(isSlotFilled);
    setSlotMorphDirection(prefersReducedMotion ? null : isSlotFilled ? 'filling' : 'draining');
  }

  // 모핑 시작 후 SLOT_FILL_DURATION_S 뒤 자동으로 끝낸다. slotMorphDirection이 바뀔 때만
  // 타이머를 새로 건다 — "외부 시스템(타이머)을 React state와 동기화"하는 전형적인 effect 용도.
  useEffect(() => {
    if (!slotMorphDirection) return;
    const timer = setTimeout(() => setSlotMorphDirection(null), SLOT_FILL_DURATION_S * 1000);
    return () => clearTimeout(timer);
  }, [slotMorphDirection]);

  // 정리 버튼이 false → true로 막 나타난 순간에만 짧게 강조색을 켠다 (아래 tidyJustAppeared).
  const hadPlacedChipsRef = useRef(hasPlacedChips);
  useEffect(() => {
    if (!hadPlacedChipsRef.current && hasPlacedChips) {
      setTidyJustAppeared(true);
      const timer = setTimeout(() => setTidyJustAppeared(false), prefersReducedMotion ? 0 : 900);
      hadPlacedChipsRef.current = hasPlacedChips;
      return () => clearTimeout(timer);
    }
    hadPlacedChipsRef.current = hasPlacedChips;
  }, [hasPlacedChips, prefersReducedMotion]);

  // Empty(슬롯이 비어 있는 상태)에서는 꼬리말을 보여주지 않는다 — spec 5장은 "Developer."
  // 꼬리말을 Filled 상태에서만 명시한다. 슬롯에 아직 아무것도 넣지 않았는데 "Developer."가
  // 보이면 "넣어야 완성되는 문장"이라는 느낌이 옅어진다. Navigating일 때는 nav별 꼬리말.
  const trailing = navigatingKeyword?.trailing ?? hero.trailing;
  // 꼬리말이 "보여야 하는지"를 전환 종류별로 다르게 판단한다 (filledLabel 자체는 filling
  // 모핑 시작과 동시에 이미 새 값이라, 보일지 여부는 slotMorphDirection과 함께 봐야 한다):
  // - filling 중(Empty→Filled|Navigating 모핑 진행 중): isSlotFilled는 이미 true지만 아직
  //   숨김 → 모핑이 끝나(slotMorphDirection이 null로) 처음 true가 되는 순간 페이드인한다.
  // - Filled|Navigating 안정 상태: true, 그대로 유지(바뀌어도 계속 true라 애니메이션 없이
  //   가만히 있음 — Filled→Navigating도 이 규칙으로 커버된다).
  // - 칩을 빼는 순간(draining 시작): isSlotFilled가 바로 false가 되어 즉시 false로 바뀌고, 그
  //   전환 자체가 AnimatePresence exit(페이드아웃)를 트리거한다 — "바꿈과 동시에 페이드아웃
  //   시작"이라는 요구사항과 맞아, draining 동안 true로 묶어둘 필요가 없다.
  const showTrailing = isSlotFilled && slotMorphDirection !== 'filling';
  // Subcopy 오버레이(nav/slot 문구)를 보여줄지 — 꼬리말과 같은 조건.
  const showFilledSubcopy = isSlotFilled && slotMorphDirection !== 'filling';
  // 기본 Subcopy(바닥 레이어)를 보여줄지 — Empty 안정 상태(isSlotFilled가 false이고 모핑
  // 없음)에는 정상적으로 보이고, draining 중(막 false가 된 직후)에는 기존 문구가 fade out
  // 하는 동안 그 밑에 애니메이션 없이 즉시 겹쳐 드러난다(사용자 요구: "빼는 순간부터 겹침
  // 시작"). filling 중과 Filled|Navigating 안정 상태에서는 숨긴다.
  const showDefaultSubcopy = !isSlotFilled && slotMorphDirection !== 'filling';
  // Subcopy 오버레이에 보여줄 내용 — Navigating이 최우선, 그다음 slotKeyword(draining 중엔
  // state.slot이 이미 null이라 lastSlotKeyword로 "빠지기 전 칩"의 문구를 계속 보여준다).
  const filledSubcopyContent = navigatingKeyword
    ? { key: `nav-${navigatingKeyword.id}`, text: navigatingKeyword.navigatingSubcopy }
    : (slotKeyword ?? lastSlotKeyword)
      ? { key: `slot-${(slotKeyword ?? lastSlotKeyword)!.id}`, text: (slotKeyword ?? lastSlotKeyword)!.subcopy }
      : null;

  return (
    <div
      ref={sectionRef}
      className="relative flex min-h-[calc(100vh-57px)] items-center justify-center px-6 py-20 md:px-14"
    >
      {/* 칩(Ring)은 항상 Hero Copy 블록·슬롯보다 위 레이어에 있어야 한다 — 드래그로 끌어다
          놓을 때 슬롯이나 문구에 가려지면 안 되므로, 이 래퍼 자체에 z-index를 둬 아래
          Hero Copy 블록(기본 쌓임 순서상 DOM에서 나중에 와 위에 쌓임)보다 앞세운다.
          Navigating 진입 시 Ring을 즉시 언마운트하지 않고 opacity 0으로 페이드 아웃한다
          (spec 6장) — Ring 자체는 if(navigating) return null 가드 없이 항상 렌더링되고,
          AnimatePresence가 "보여줄지"를 결정해 exit 애니메이션이 끝난 뒤에만 언마운트한다. */}
      <AnimatePresence>
        {!state.navigating && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 hidden md:block"
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          >
            <Ring
              keywords={keywords}
              viewportWidth={sectionSize.width}
              viewportHeight={sectionSize.height}
              heroCopyCenterY={heroCopyMetrics.centerY}
              heroCopyHalfHeight={heroCopyMetrics.halfHeight}
              slot={state.slot}
              onSelect={handleSelect}
              placed={state.placed}
              stack={state.stack}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOverSlotChange={setIsOverSlot}
              slotElRef={slotRef}
              chipRefs={desktopChipRefs}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={copyRef}
        onClick={handleHeroCopyClick}
        className="relative flex w-[min(846px,100%)] flex-col items-start gap-4.5"
      >
        <p className="type-mono-xs text-brand-text">{hero.eyebrow}</p>

        <h1 className="type-display-hero flex flex-wrap items-center gap-3.5 text-fg-secondary">
          <span>
            {hero.name.before}
            <span className="type-display-hero-strong text-brand-text">{hero.name.strong}</span>
          </span>
          {/* 칩 → 슬롯 전환(spec 6장): 처음엔 Ring의 칩과 layoutId를 공유해 Smart Animate처럼
              위치까지 이어 붙이려 했으나, 드래그(변위 재생 — 위 Ring.tsx 주석 참고)·다른
              키워드로 교체(같은 layoutId가 겹치는 순간 슬롯이 잠깐 빈 것처럼 보임)·Navigating
              전환(지연·깜빡임) 세 가지 모두에서 어긋났다. 그래서 칩과 슬롯을 완전히 독립된
              요소로 분리했다 — 위치가 이어 붙는 "따라오는" 느낌은 포기하지만, 어떤 조합에서도
              예측 가능하게 동작한다. 슬롯 쪽 자체의 전환 방식은 아래 주석 참고. */}
          {/* 슬롯 pill은 Empty/Filled/Navigating 세 상태를 하나의 persistent 엘리먼트로 모핑한다
              (key 고정) — "빈 슬롯이 그대로 색이 채워지며/빠지며 칩(또는 nav)으로 변환"되려면
              서로 다른 요소로 교체(언마운트/마운트)하면 안 된다. 텍스트는 상태가 바뀌는 즉시
              교체하고, 배경·글자색·테두리만 className 토글 + transition-colors(순수 CSS)로
              서서히 바뀐다 — Motion의 backgroundColor/color 애니메이션은 테마 전환 시 그 순간
              색이 inline style에 고정되는 버그(KeywordPill 참고)가 있어 피한다. 이미 채워진
              상태끼리의 전환(Filled→Filled, Filled→Navigating)은 className이 그대로 유지돼
              (둘 다 selected 배경) transition이 트리거되지 않으므로 pill 자체는 애니메이션
              없이 텍스트만 바뀐다. Empty(Navigating도 아닌 상태)일 때만 네이티브 disabled로
              포커스·클릭을 막는다(기존 동작 유지) — Navigating 중에는 disabled를 걸지 않는다.
              네이티브 disabled는 클릭 이벤트 자체를 막아 버블링도 끊으므로, Navigating 중
              이 pill을 클릭했을 때 부모 Hero Copy 블록의 handleHeroCopyClick으로 버블링되어
              즉시 이동하는 동작(spec 5장)을 Navigating 중에는 막지 않아야 한다. */}
          <motion.button
            ref={setSlotRef}
            type="button"
            onClick={() => slotKeyword && handleSelect(slotKeyword)}
            disabled={!slotKeyword && !navigatingKeyword}
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: isOverSlot ? 1.03 : 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { opacity: RETURN_SPRING, scale: { duration: 0.15 } }
            }
            aria-label={
              navigatingKeyword
                ? navigatingKeyword.label
                : slotKeyword
                  ? `${slotKeyword.label} 선택됨, 누르면 비우기`
                  : '키워드를 넣는 칸'
            }
            // 드래그 중 isOverSlot 토글(점선↔실선, 투명↔연한 배경)은 빠르게(150ms) 반응해야
            // 하고, Empty↔(Filled|Navigating) 모핑(slotMorphDirection)은 "색이 서서히
            // 채워지거나 빠지는" 느낌을 위해 느리게(SLOT_FILL_DURATION_S) 간다 — 둘이 같은
            // transition-colors 클래스를 쓰므로 slotMorphDirection 여부로 duration을 바꿔 끼운다.
            className={`type-heading-slot rounded-pill border-[1.5px] px-6 py-2 transition-colors ${
              slotMorphDirection ? 'duration-(--slot-fill-ms)' : 'duration-150'
            } ${
              isSlotFilled
                ? 'border-transparent bg-selected text-on-selected'
                : isOverSlot
                  ? 'border-solid border-brand bg-brand/10 text-fg-placeholder'
                  : 'border-dashed border-brand bg-transparent text-fg-placeholder'
            }`}
            style={{ '--slot-fill-ms': `${SLOT_FILL_DURATION_S * 1000}ms` } as CSSProperties}
          >
            {filledLabel ?? (
              <>
                <span className="md:hidden">{hero.slotPlaceholder.mobile}</span>
                <span className="hidden md:inline">{hero.slotPlaceholder.desktop}</span>
              </>
            )}
          </motion.button>
          <AnimatePresence>
            {showTrailing && (
              <motion.span
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : SUBCOPY_TRANSITION_DURATION_S }}
              >
                {trailing}
              </motion.span>
            )}
          </AnimatePresence>
        </h1>

        {/* spec 10장: Subcopy 영역에 aria-live="polite". 이벤트 안내(넣음/비움)는 sr-only 접두사로,
            Navigating 안내는 화면에도 그대로 보이는 subcopy로 교체한다.
            spec 6장: 이전 문구 페이드 아웃 → 새 문구 페이드 + 위로 8px 등장, 각 0.25s.

            기본 서브텍스트(default)는 항상 DOM에 깔려 있는 "바닥 레이어"이고, nav/slot
            서브텍스트는 그 위에 겹치는 "오버레이"다 — Filled→Empty(draining)로 칩을 뺄 때
            기존 서브텍스트가 fade out하는 동안 기본 서브텍스트가 애니메이션 없이 즉시 그
            아래에서 겹쳐 드러나야 하는데(사용자 요구), 두 레이어가 동시에 DOM에 존재해야만
            가능하다. 두 레이어를 같은 grid 영역에 겹쳐 두면(absolute 대신) 둘 중 더 큰 쪽이
            컨테이너 높이를 결정해, 길이가 다른 문구끼리 겹쳐도 넘치거나 잘리지 않는다. */}
        <p
          aria-live="polite"
          className="type-lead relative grid whitespace-pre-line text-fg-secondary"
        >
          <span className={`col-start-1 row-start-1 block ${showDefaultSubcopy ? '' : 'invisible'}`}>
            <span className="sr-only">{announcementPrefix}</span>
            {hero.subcopy.map((part, i) =>
              typeof part === 'string' ? (
                <span key={i}>{part}</span>
              ) : (
                <span key={i} className="text-brand-text">
                  {part.strong}
                </span>
              ),
            )}
          </span>
          <AnimatePresence mode="wait" initial={false}>
            {showFilledSubcopy && filledSubcopyContent ? (
              <motion.span
                key={filledSubcopyContent.key}
                initial={prefersReducedMotion ? false : { opacity: 0, y: SUBCOPY_RISE_PX }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : SUBCOPY_TRANSITION_DURATION_S }}
                className="col-start-1 row-start-1 block"
              >
                {!navigatingKeyword && <span className="sr-only">{announcementPrefix}</span>}
                {filledSubcopyContent.text}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </p>

        <p className="type-mono-xs text-fg-muted">
          <span className="md:hidden">{hero.hint.mobile}</span>
          <span className="hidden md:inline">{hero.hint.desktop}</span>
          <AnimatePresence>
            {hasPlacedChips ? (
              <motion.button
                type="button"
                onClick={handleTidy}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                transition={prefersReducedMotion ? { duration: 0 } : RETURN_SPRING}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                // 등장 직후(tidyJustAppeared)에는 brand 색으로 보이다가, 색 자체는 Tailwind
                // transition-colors(순수 CSS)로 기본 색으로 식는다 — 눈에 안 띈다는 피드백 보완.
                className={`type-mono-xs ml-3 hidden cursor-pointer items-center gap-1 underline transition-colors duration-180 ease-out hover:text-brand-text md:inline-flex ${
                  tidyJustAppeared ? 'text-brand-text duration-700' : 'text-fg-muted'
                }`}
              >
                <TidyIcon />
                {hero.tidyLabel}
              </motion.button>
            ) : null}
          </AnimatePresence>
        </p>

        <MobileKeywordList
          keywords={keywords}
          slot={state.slot}
          navigating={state.navigating !== null}
          onSelect={handleSelect}
          chipRefs={mobileChipRefs}
        />
      </div>
    </div>
  );
}
