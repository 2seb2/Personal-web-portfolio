// 드래그 놓기 판정. spec 4장을 순수 함수로 구현한다.
import { ringGeometry } from '@/content/keywords';
import type { PlacedPosition } from './reducer';

/**
 * 포인터 좌표(뷰포트 기준)가 슬롯 영역(+ dropSlopPx 여유) 안인지 판정한다.
 * 슬롯 DOM이 아직 없으면(렌더 전) 항상 false.
 */
export function isPointInSlot(point: { x: number; y: number }, slotEl: HTMLElement | null): boolean {
  if (!slotEl) return false;
  const rect = slotEl.getBoundingClientRect();
  const slop = ringGeometry.dropSlopPx;

  return (
    point.x >= rect.left - slop &&
    point.x <= rect.right + slop &&
    point.y >= rect.top - slop &&
    point.y <= rect.bottom + slop
  );
}

/**
 * 뷰포트 좌표의 포인터 위치를 Hero 섹션 기준 비율(0~1) 좌표로 변환한다.
 * 자유 배치 위치는 이 비율로 저장해 창 크기가 바뀌어도 같은 비율 위치를 유지한다 (spec 4장).
 * 섹션 가장자리 안쪽 edgePaddingPx 여유로 clamp한다.
 */
export function toPlacedPosition(
  point: { x: number; y: number },
  sectionEl: HTMLElement,
): PlacedPosition {
  const rect = sectionEl.getBoundingClientRect();
  const padding = ringGeometry.edgePaddingPx;

  const x = clamp(point.x - rect.left, padding, rect.width - padding);
  const y = clamp(point.y - rect.top, padding, rect.height - padding);

  return {
    x: rect.width > 0 ? x / rect.width : 0,
    y: rect.height > 0 ? y / rect.height : 0,
  };
}

/** 비율(0~1) 좌표를 섹션 크기 기준 px 좌표로 되돌린다. Ring이 자유 배치 칩을 그릴 때 쓴다. */
export function fromPlacedPosition(
  position: PlacedPosition,
  sectionSize: { width: number; height: number },
): { x: number; y: number } {
  return {
    x: position.x * sectionSize.width,
    y: position.y * sectionSize.height,
  };
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Motion의 onDragEnd(event, info)에서 뷰포트 기준 포인터 좌표를 뽑아낸다.
 * info.point는 page 좌표(pageX/Y)라 getBoundingClientRect() 기반 판정과 스크롤이 있으면
 * 어긋나므로 쓰지 않는다 — event의 clientX/Y(TouchEvent는 changedTouches[0])를 쓴다.
 */
export function getClientPoint(event: MouseEvent | TouchEvent | PointerEvent): { x: number; y: number } {
  if ('clientX' in event) return { x: event.clientX, y: event.clientY };
  const touch = event.changedTouches[0];
  return { x: touch.clientX, y: touch.clientY };
}
