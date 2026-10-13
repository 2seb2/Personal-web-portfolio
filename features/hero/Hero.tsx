'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
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
import { RETURN_SPRING, SUBCOPY_RISE_PX, SUBCOPY_TRANSITION_DURATION_S } from './animation';

/** Nav 높이(px). Ring은 Hero 섹션(Nav 아래) 기준 좌표계를 쓰므로 섹션 자체 높이를 구할 때 뺀다 */
const NAV_HEIGHT_PX = 57;
const FALLBACK_SECTION_SIZE = { width: 1512, height: 982 - NAV_HEIGHT_PX };
/** Hero Copy 블록 실측 전 기본값(띠 배치 fallback, 대략적인 1512px 기준 블록 높이) */
const FALLBACK_HERO_COPY = { centerY: FALLBACK_SECTION_SIZE.height / 2, halfHeight: 130 };

/** Navigating 상태에서 페이지 이동까지 대기하는 시간(ms). spec 3·5장 */
const NAVIGATE_DELAY_MS = 1200;

const keywordById = new Map(keywords.map((keyword) => [keyword.id, keyword]));

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

  const trailing = navigatingKeyword?.trailing ?? hero.trailing;

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
              요소로 분리하고, 슬롯 쪽은 내용이 바뀔 때 제자리에서 페이드 전환만 한다 — 위치가
              이어 붙는 "따라오는" 느낌은 포기하지만, 어떤 조합에서도 예측 가능하게 동작한다. */}
          <AnimatePresence mode="wait">
            {slotKeyword ? (
              <motion.button
                key={`slot-${slotKeyword.id}`}
                ref={setSlotRef}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                transition={prefersReducedMotion ? { duration: 0 } : RETURN_SPRING}
                type="button"
                onClick={() => handleSelect(slotKeyword)}
                aria-label={`${slotKeyword.label} 선택됨, 누르면 비우기`}
                className="type-heading-slot rounded-pill bg-selected px-6 py-2 text-on-selected"
              >
                {slotKeyword.label}
              </motion.button>
            ) : navigatingKeyword ? (
              <motion.span
                key={`nav-${navigatingKeyword.id}`}
                ref={setSlotRef}
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                transition={prefersReducedMotion ? { duration: 0 } : RETURN_SPRING}
                className="type-heading-slot rounded-pill bg-selected px-6 py-2 text-on-selected"
              >
                {navigatingKeyword.label}
              </motion.span>
            ) : (
              <span
                key="slot-empty"
                ref={setSlotRef}
                aria-label="키워드를 넣는 칸"
                className="type-heading-slot rounded-pill border-[1.5px] border-dashed border-brand px-6 py-2 text-fg-placeholder"
              >
                <span className="md:hidden">{hero.slotPlaceholder.mobile}</span>
                <span className="hidden md:inline">{hero.slotPlaceholder.desktop}</span>
              </span>
            )}
          </AnimatePresence>
          <span>{trailing}</span>
        </h1>

        {/* spec 10장: Subcopy 영역에 aria-live="polite". 이벤트 안내(넣음/비움)는 sr-only 접두사로,
            Navigating 안내는 화면에도 그대로 보이는 subcopy로 교체한다.
            spec 6장: 이전 문구 페이드 아웃 → 새 문구 페이드 + 위로 8px 등장, 각 0.25s.
            key를 문구 종류별로 다르게 둬야 AnimatePresence가 교체를 전환으로 인식한다. */}
        <p aria-live="polite" className="type-lead relative whitespace-pre-line text-fg-secondary">
          <AnimatePresence mode="wait" initial={false}>
            {navigatingKeyword ? (
              <motion.span
                key={`nav-${navigatingKeyword.id}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: SUBCOPY_RISE_PX }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : SUBCOPY_TRANSITION_DURATION_S }}
                className="block"
              >
                {navigatingKeyword.navigatingSubcopy}
              </motion.span>
            ) : slotKeyword ? (
              <motion.span
                key={`slot-${slotKeyword.id}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: SUBCOPY_RISE_PX }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : SUBCOPY_TRANSITION_DURATION_S }}
                className="block"
              >
                <span className="sr-only">{announcementPrefix}</span>
                {slotKeyword.subcopy}
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={prefersReducedMotion ? false : { opacity: 0, y: SUBCOPY_RISE_PX }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : SUBCOPY_TRANSITION_DURATION_S }}
                className="block"
              >
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
              </motion.span>
            )}
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
                className="type-mono-xs ml-3 hidden underline md:inline"
              >
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
