'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { site } from '@/content/site';
import type { ProjectImage } from '@/types/content';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  clampOffset,
  clampZoom,
  formatZoom,
  getFitScale,
  getNextZoomStep,
  getPrevZoomStep,
  zoomAtPoint,
} from './zoom';
import type { Point, Size } from './zoom';
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  MaximizeIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from './icons';

const text = site.lightbox;

/** 화면 맞춤 상태에서 좌우로 이만큼 밀면 이전·다음 이미지 */
const SWIPE_THRESHOLD_PX = 60;
/** 이보다 많이 움직였으면 클릭이 아니라 드래그 — 드래그를 오버레이 위에서 끝내도 닫히지 않게 */
const DRAG_TOLERANCE_PX = 6;
/** 첫·마지막 이미지에서 더 넘기려 하면 손가락을 덜 따라온다 */
const SWIPE_EDGE_RESISTANCE = 0.3;
/** ctrl+휠(트랙패드 핀치) 감도 */
const WHEEL_ZOOM_SENSITIVITY = 0.01;
/** 열릴 때 페이드 */
const OPEN_FADE_DURATION_S = 0.2;

type View = { zoom: number; offset: Point };
const FIT_VIEW: View = { zoom: MIN_ZOOM, offset: { x: 0, y: 0 } };

type Gesture =
  | { type: 'pan'; pointerId: number; start: Point; startOffset: Point }
  | { type: 'swipe'; pointerId: number; start: Point }
  | { type: 'pinch'; startDistance: number; startMid: Point; startView: View };

/** 이 표시가 붙은 요소를 누르고 떼면 닫힌다 (이미지·버튼·툴바는 해당 없음) */
const BACKDROP_ATTR = { 'data-lightbox-backdrop': '' };

function isBackdrop(target: EventTarget | null) {
  return target instanceof HTMLElement && target.dataset.lightboxBackdrop !== undefined;
}

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function sizeOf(element: HTMLElement): Size {
  return { width: element.clientWidth, height: element.clientHeight };
}

/** 갤러리 이름 — 기본은 프로젝트용(site.lightbox) */
export type LightboxLabels = { title: string; dialogLabel: string };

type LightboxProps = {
  images: ProjectImage[];
  labels?: LightboxLabels;
  initialIndex: number;
  /** reveal: '본문에서 보기'로 닫았는지 */
  onClose: (options: { index: number; reveal: boolean }) => void;
};

export function Lightbox({ images, labels = text, initialIndex, onClose }: LightboxProps) {
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  /** 이미지가 움직일 수 있는 전체 영역 (확대 시 좌우 버튼 아래까지) */
  const stageRef = useRef<HTMLDivElement>(null);
  /** 화면 맞춤 기준 영역 — stage에서 좌우 버튼 자리를 뺀 곳 */
  const fitBoxRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [index, setIndex] = useState(initialIndex);
  const [view, setView] = useState<View>(FIT_VIEW);
  const [swipeX, setSwipeX] = useState(0);
  /** 버튼 확대·스와이프 복귀만 부드럽게. 손가락·휠을 따라갈 때는 즉시 */
  const [smooth, setSmooth] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [stage, setStage] = useState<Size>({ width: 0, height: 0 });
  const [fitBox, setFitBox] = useState<Size>({ width: 0, height: 0 });

  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const press = useRef<{ start: Point; onBackdrop: boolean; moved: boolean } | null>(null);

  const image = images[index];
  const total = images.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const fitScale = getFitScale(image, fitBox);
  const base: Size = { width: image.width * fitScale, height: image.height * fitScale };
  const displayed: Size = { width: base.width * view.zoom, height: base.height * view.zoom };
  const offset = clampOffset(view.offset, displayed, stage);

  // ---------- 열기·닫기 ----------
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const close = (reveal = false) => onClose({ index, reveal });

  // ---------- 크기 측정 ----------
  useEffect(() => {
    const stageEl = stageRef.current;
    const fitEl = fitBoxRef.current;
    if (!stageEl || !fitEl) return;

    // observe 직후 첫 콜백이 페인트 전에 한 번 불려 초기 크기도 여기서 잡힌다
    const observer = new ResizeObserver(() => {
      setStage(sizeOf(stageEl));
      setFitBox(sizeOf(fitEl));
    });
    observer.observe(stageEl);
    observer.observe(fitEl);
    return () => observer.disconnect();
  }, []);

  // ---------- 이동 ----------
  const goTo = (next: number) => {
    if (next < 0 || next >= total || next === index) return;
    setIndex(next);
    // 다른 이미지로 가면 화면 맞춤으로 초기화
    setView(FIT_VIEW);
    setSwipeX(0);
    setSmooth(false);
  };

  // 현재 썸네일이 목록 밖에 있으면 보이게
  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [index, prefersReducedMotion]);

  // 이웃 이미지를 미리 받아 넘길 때 빈 화면이 덜 보이게
  useEffect(() => {
    for (const neighbor of [images[index - 1], images[index + 1]]) {
      if (neighbor) new window.Image().src = neighbor.src;
    }
  }, [images, index]);

  // ---------- 확대 ----------
  /** 범위 안으로 정리해서 저장 — 다음 제스처가 항상 보이는 위치에서 시작하도록 */
  const commitView = (zoom: number, rawOffset: Point) => {
    const nextDisplayed = { width: base.width * zoom, height: base.height * zoom };
    setView({ zoom, offset: clampOffset(rawOffset, nextDisplayed, stage) });
  };

  const zoomFromButton = (nextZoom: number) => {
    setSmooth(true);
    commitView(nextZoom, zoomAtPoint(view.zoom, offset, nextZoom, { x: 0, y: 0 }));
  };

  /** stage 중심 기준 좌표 */
  const toStagePoint = (event: { clientX: number; clientY: number }): Point => {
    const rect = stageRef.current!.getBoundingClientRect();
    return {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2,
    };
  };

  // 트랙패드 핀치·ctrl+휠. 일반 휠은 아무것도 하지 않는다
  const onWheel = useEffectEvent((event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const nextZoom = clampZoom(view.zoom * Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY));
    setSmooth(false);
    commitView(nextZoom, zoomAtPoint(view.zoom, offset, nextZoom, toStagePoint(event)));
  });

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    // passive가 아니어야 브라우저 확대를 막을 수 있다
    const listener = (event: WheelEvent) => onWheel(event);
    stageEl.addEventListener('wheel', listener, { passive: false });
    return () => stageEl.removeEventListener('wheel', listener);
  }, []);

  // ---------- 드래그·스와이프·핀치 ----------
  const startSinglePointer = (pointerId: number, point: Point, pointerType: string) => {
    if (view.zoom > MIN_ZOOM) {
      gesture.current = { type: 'pan', pointerId, start: point, startOffset: offset };
    } else if (pointerType !== 'mouse' && total > 1) {
      gesture.current = { type: 'swipe', pointerId, start: point };
    } else {
      gesture.current = null;
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const point = toStagePoint(event);
    pointers.current.set(event.pointerId, point);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        type: 'pinch',
        startDistance: distance(a, b),
        startMid: midpoint(a, b),
        startView: { zoom: view.zoom, offset },
      };
      setSwipeX(0);
    } else if (pointers.current.size === 1) {
      startSinglePointer(event.pointerId, point, event.pointerType);
    }

    if (gesture.current) {
      // 포인터가 stage 밖으로 나가도 끝까지 따라가게
      event.currentTarget.setPointerCapture(event.pointerId);
      setSmooth(false);
      setIsPanning(gesture.current.type === 'pan');
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    const point = toStagePoint(event);
    pointers.current.set(event.pointerId, point);

    const current = gesture.current;
    if (!current) return;

    if (current.type === 'pinch') {
      if (pointers.current.size < 2) return;
      const [a, b] = [...pointers.current.values()];
      const { startView, startMid, startDistance } = current;
      const nextZoom = clampZoom((startView.zoom * distance(a, b)) / startDistance);
      const zoomed = zoomAtPoint(startView.zoom, startView.offset, nextZoom, startMid);
      // 두 손가락이 함께 움직인 만큼 이동도 같이
      const mid = midpoint(a, b);
      commitView(nextZoom, { x: zoomed.x + mid.x - startMid.x, y: zoomed.y + mid.y - startMid.y });
    } else if (current.pointerId === event.pointerId) {
      const dx = point.x - current.start.x;
      const dy = point.y - current.start.y;
      if (current.type === 'pan') {
        commitView(view.zoom, { x: current.startOffset.x + dx, y: current.startOffset.y + dy });
      } else {
        const pastEdge = (dx > 0 && isFirst) || (dx < 0 && isLast);
        setSwipeX(pastEdge ? dx * SWIPE_EDGE_RESISTANCE : dx);
      }
    }
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    const point = toStagePoint(event);
    pointers.current.delete(event.pointerId);

    const current = gesture.current;
    if (current?.type === 'swipe' && current.pointerId === event.pointerId) {
      const dx = point.x - current.start.x;
      const dy = point.y - current.start.y;
      const isSwipe =
        event.type === 'pointerup' && Math.abs(dx) > SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy);
      if (isSwipe && !(dx > 0 && isFirst) && !(dx < 0 && isLast)) {
        goTo(index + (dx < 0 ? 1 : -1));
      } else {
        // 제자리로 부드럽게 돌아가기
        setSmooth(true);
        setSwipeX(0);
      }
    }

    const remaining = [...pointers.current.entries()];
    if (remaining.length === 0) {
      gesture.current = null;
    } else if (current?.type === 'pinch') {
      // 핀치하다 한 손가락만 떼면 남은 손가락으로 이어서 이동 (스와이프로는 넘어가지 않음)
      const [pointerId, start] = remaining[0];
      gesture.current =
        view.zoom > MIN_ZOOM ? { type: 'pan', pointerId, start, startOffset: offset } : null;
    }
    setIsPanning(gesture.current?.type === 'pan');
  };

  // ---------- 오버레이 클릭으로 닫기 ----------
  const handlePressStart = (event: PointerEvent<HTMLDivElement>) => {
    press.current = {
      start: { x: event.clientX, y: event.clientY },
      onBackdrop: isBackdrop(event.target),
      moved: false,
    };
  };

  const handlePressMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = press.current;
    if (!current || current.moved) return;
    if (distance(current.start, { x: event.clientX, y: event.clientY }) > DRAG_TOLERANCE_PX) {
      current.moved = true;
    }
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const current = press.current;
    press.current = null;
    // 누른 곳과 뗀 곳이 모두 오버레이이고, 끌지 않았을 때만
    if (current?.onBackdrop && !current.moved && isBackdrop(event.target)) close();
  };

  // ---------- 키보드 ----------
  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(index + 1);
    }
  };

  const order = (n: number) => String(n).padStart(2, '0');
  const isZoomed = view.zoom > MIN_ZOOM;

  return (
    <dialog
      ref={dialogRef}
      aria-label={labels.dialogLabel}
      data-theme="dark"
      // ESC: 브라우저가 바로 닫지 않게 막고 상태로 닫는다
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      // 브라우저가 cancel을 무시하고 닫아 버린 경우에도 상태를 맞춘다
      onClose={() => close()}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden overscroll-contain border-0 bg-transparent p-0 text-fg backdrop:bg-transparent"
    >
      <motion.div
        {...BACKDROP_ATTR}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : OPEN_FADE_DURATION_S }}
        onPointerDownCapture={handlePressStart}
        onPointerMoveCapture={handlePressMove}
        onClick={handleClick}
        className="flex h-full w-full flex-col bg-page/97 backdrop-blur-sm"
      >
        {/* 상단: 위치 + 닫기 */}
        <div {...BACKDROP_ATTR} className="flex h-14 shrink-0 items-center justify-between pr-2 pl-5 md:pr-4 md:pl-8">
          <p className="type-mono-label text-fg-secondary uppercase" aria-hidden="true">
            {labels.title} · <span className="text-fg">{order(index + 1)}</span> / {order(total)}
          </p>
          <IconButton label={text.close} onClick={() => close()}>
            <CloseIcon />
          </IconButton>
        </div>

        <p className="sr-only" aria-live="polite">
          {text.position(index + 1, total)}: {image.alt}
        </p>

        {/* 가운데: 이미지 */}
        <div className="relative min-h-0 flex-1">
          <div
            ref={stageRef}
            {...BACKDROP_ATTR}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            className="absolute inset-0 touch-none overflow-hidden select-none"
          >
            <div ref={fitBoxRef} aria-hidden="true" className="pointer-events-none absolute inset-x-4 inset-y-2 md:inset-x-20" />
            {fitScale > 0 && (
              <Image
                // 이미지가 바뀌면 새로 그려 이전 이미지가 새 크기로 잠깐 보이지 않게
                key={image.src}
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                // 확대해서 보는 용도라 재압축 없이 원본 그대로
                unoptimized
                loading="eager"
                draggable={false}
                className={`absolute top-1/2 left-1/2 max-w-none rounded-img bg-sunken ${
                  smooth ? 'transition-[width,height,transform] duration-200 ease-out motion-reduce:transition-none' : ''
                } ${isZoomed ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
                style={{
                  width: displayed.width,
                  height: displayed.height,
                  transform: `translate(calc(-50% + ${offset.x + swipeX}px), calc(-50% + ${offset.y}px))`,
                }}
              />
            )}
          </div>

          {total > 1 && (
            <>
              <IconButton
                label={text.prev}
                onClick={() => goTo(index - 1)}
                disabled={isFirst}
                className="absolute top-1/2 left-4 hidden -translate-y-1/2 md:flex"
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                label={text.next}
                onClick={() => goTo(index + 1)}
                disabled={isLast}
                className="absolute top-1/2 right-4 hidden -translate-y-1/2 md:flex"
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          )}
        </div>

        {/* 하단: 툴바 + 썸네일 */}
        <div {...BACKDROP_ATTR} className="flex shrink-0 flex-col items-center gap-3 px-4 pt-3 pb-4 md:gap-4 md:pt-4 md:pb-6">
          <div
            role="toolbar"
            aria-label={text.toolbar}
            className="flex items-center gap-0.5 rounded-pill border border-line bg-surface p-1 shadow-md md:gap-1"
          >
            <ToolbarButton
              label={text.zoomOut}
              onClick={() => zoomFromButton(getPrevZoomStep(view.zoom))}
              disabled={view.zoom <= MIN_ZOOM}
            >
              <ZoomOutIcon />
            </ToolbarButton>
            <ToolbarButton
              label={text.zoomIn}
              onClick={() => zoomFromButton(getNextZoomStep(view.zoom))}
              disabled={view.zoom >= MAX_ZOOM}
            >
              <ZoomInIcon />
            </ToolbarButton>
            <ToolbarButton
              label={text.fit}
              onClick={() => zoomFromButton(MIN_ZOOM)}
              disabled={!isZoomed}
            >
              <MaximizeIcon />
            </ToolbarButton>
            <ToolbarButton label={text.reveal} onClick={() => close(true)}>
              <BookOpenIcon />
            </ToolbarButton>
            <output
              aria-label={text.zoomLevel}
              className="w-13 text-center type-mono-sm text-fg tabular-nums md:w-14"
            >
              {formatZoom(view.zoom)}
            </output>
          </div>

          {total > 1 && (
            <ul aria-label={text.thumbnails} className="flex max-w-full gap-2 overflow-x-auto p-1 md:gap-3">
              {images.map((item, i) => {
                const isCurrent = i === index;
                return (
                  <li key={item.src} className="shrink-0">
                    <button
                      ref={(element) => {
                        thumbRefs.current[i] = element;
                      }}
                      type="button"
                      aria-label={text.thumbnail(i + 1, item.alt)}
                      aria-current={isCurrent ? 'true' : undefined}
                      onClick={() => goTo(i)}
                      className={`relative block h-10 w-16 overflow-hidden rounded-swatch border-2 bg-sunken transition-[opacity,border-color] duration-180 ease-out md:h-12.5 md:w-20 ${
                        isCurrent ? 'border-brand' : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <Image src={item.src} alt="" fill sizes="80px" className="object-cover" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    </dialog>
  );
}

type IconButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/** 닫기·이전·다음 — 평소엔 아이콘만, 호버 시 면이 생긴다 */
function IconButton({ label, onClick, disabled, className, children }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex size-11 items-center justify-center rounded-pill text-fg-secondary transition-colors duration-180 ease-out hover:bg-surface hover:text-fg disabled:cursor-not-allowed disabled:text-fg-placeholder disabled:hover:bg-transparent ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

/** 툴바 버튼 — 호버·키보드 포커스 시 위에 이름표(툴팁) */
function ToolbarButton({ label, onClick, disabled, children }: Omit<IconButtonProps, 'className'>) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="group relative flex size-9 items-center justify-center rounded-pill text-fg transition-colors duration-180 ease-out hover:bg-sunken disabled:cursor-not-allowed disabled:text-fg-placeholder disabled:hover:bg-transparent md:size-10"
    >
      {children}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-pill bg-inverse px-2.5 py-0.5 whitespace-nowrap type-mono-xs text-fg-inverse opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {label}
      </span>
    </button>
  );
}
