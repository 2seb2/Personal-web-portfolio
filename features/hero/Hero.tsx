'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { site } from '@/content/site';
import { keywords } from '@/content/keywords';
import type { HeroKeyword } from '@/types/content';
import { Ring } from './Ring';
import { MobileKeywordList } from './MobileKeywordList';
import { heroReducer, initialHeroState } from './reducer';
import { consumeHeroResetPending } from './resetEvent';
import { isPointInSlot, toPlacedPosition } from './useDropTarget';

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
  usePathname();

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
  // Next.js Router Cache는 뒤로가기 시 이 페이지의 DOM·React 상태를 그대로 재사용하므로
  // (컴포넌트가 리마운트되지 않음), 페이지를 떠나기 직전에 상태를 Empty로 되돌려 둔다 —
  // 그래야 캐시에서 복원됐을 때도 Empty로 보인다 (spec 3장 "뒤로가기로 돌아옴: Empty").
  useEffect(() => {
    if (!state.navigating) return;
    const target = keywordById.get(state.navigating);
    if (!target?.href) return;

    const timer = setTimeout(() => {
      router.push(target.href!);
      dispatch({ type: 'RESET_ALL' });
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
  function handleDragEnd(keyword: HeroKeyword, point: { x: number; y: number }) {
    if (state.navigating) return;

    if (isPointInSlot(point, slotRef.current)) {
      handleSelect(keyword);
      return;
    }

    if (!sectionRef.current) return;
    const position = toPlacedPosition(point, sectionRef.current);
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
    dispatch({ type: 'RESET_ALL' });
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
          Hero Copy 블록(기본 쌓임 순서상 DOM에서 나중에 와 위에 쌓임)보다 앞세운다. */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden md:block">
        <Ring
          keywords={keywords}
          viewportWidth={sectionSize.width}
          viewportHeight={sectionSize.height}
          heroCopyCenterY={heroCopyMetrics.centerY}
          heroCopyHalfHeight={heroCopyMetrics.halfHeight}
          slot={state.slot}
          navigating={state.navigating !== null}
          onSelect={handleSelect}
          placed={state.placed}
          stack={state.stack}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          chipRefs={desktopChipRefs}
        />
      </div>

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
          {slotKeyword ? (
            <button
              ref={setSlotRef}
              type="button"
              onClick={() => handleSelect(slotKeyword)}
              aria-label={`${slotKeyword.label} 선택됨, 누르면 비우기`}
              className="type-heading-slot rounded-pill bg-selected px-6 py-2 text-on-selected"
            >
              {slotKeyword.label}
            </button>
          ) : navigatingKeyword ? (
            <span ref={setSlotRef} className="type-heading-slot rounded-pill bg-selected px-6 py-2 text-on-selected">
              {navigatingKeyword.label}
            </span>
          ) : (
            <span
              ref={setSlotRef}
              aria-label="키워드를 넣는 칸"
              className="type-heading-slot rounded-pill border-[1.5px] border-dashed border-brand px-6 py-2 text-fg-placeholder"
            >
              <span className="md:hidden">{hero.slotPlaceholder.mobile}</span>
              <span className="hidden md:inline">{hero.slotPlaceholder.desktop}</span>
            </span>
          )}
          <span>{trailing}</span>
        </h1>

        {/* spec 10장: Subcopy 영역에 aria-live="polite". 이벤트 안내(넣음/비움)는 sr-only 접두사로,
            Navigating 안내는 화면에도 그대로 보이는 subcopy로 교체한다. */}
        {navigatingKeyword ? (
          <p aria-live="polite" className="type-lead whitespace-pre-line text-fg-secondary">
            {navigatingKeyword.navigatingSubcopy}
          </p>
        ) : slotKeyword ? (
          <p aria-live="polite" className="type-lead whitespace-pre-line text-fg-secondary">
            <span className="sr-only">{announcementPrefix}</span>
            {slotKeyword.subcopy}
          </p>
        ) : (
          <p aria-live="polite" className="type-lead whitespace-pre-line text-fg-secondary">
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
          </p>
        )}

        <p className="type-mono-xs text-fg-muted">
          <span className="md:hidden">{hero.hint.mobile}</span>
          <span className="hidden md:inline">{hero.hint.desktop}</span>
          {hasPlacedChips ? (
            <button type="button" onClick={handleTidy} className="type-mono-xs ml-3 hidden underline md:inline">
              {hero.tidyLabel}
            </button>
          ) : null}
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
