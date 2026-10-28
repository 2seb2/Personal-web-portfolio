// 라이트박스 확대·이동 계산. DOM 없이 테스트할 수 있게 순수 함수로만 둔다.
//
// 확대 비율의 기준: 100% = "화면에 맞춤" 크기 (이미지 전체가 보이는 가장 큰 크기, 원본보다 키우지 않음).
// 화면 맞춤보다 작게는 줄이지 않는다 — 그 아래는 볼 이유가 없고, 100%가 항상 최솟값이라 기준이 흔들리지 않는다.

export type Size = { width: number; height: number };
export type Point = { x: number; y: number };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;
/** 확대·축소 버튼이 거치는 단계 */
export const ZOOM_STEPS = [1, 1.5, 2, 3, 4];

/** 부동소수 오차로 같은 단계를 다시 고르지 않게 하는 여유 */
const STEP_EPSILON = 0.01;

/** 원본 크기 대비, 이미지 전체가 box 안에 들어오는 배율. 원본보다 키우지 않는다 */
export function getFitScale(image: Size, box: Size): number {
  if (box.width <= 0 || box.height <= 0) return 0;
  return Math.min(box.width / image.width, box.height / image.height, 1);
}

export function clampZoom(zoom: number): number {
  return Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
}

export function getNextZoomStep(zoom: number): number {
  return ZOOM_STEPS.find((step) => step > zoom + STEP_EPSILON) ?? MAX_ZOOM;
}

export function getPrevZoomStep(zoom: number): number {
  for (let i = ZOOM_STEPS.length - 1; i >= 0; i--) {
    if (ZOOM_STEPS[i] < zoom - STEP_EPSILON) return ZOOM_STEPS[i];
  }
  return MIN_ZOOM;
}

/**
 * 이미지 중심이 stage 중심에서 얼마나 떨어질 수 있는지 제한한다.
 * 이미지가 stage보다 작은 축은 가운데 고정, 큰 축은 가장자리가 stage 안으로 들어오지 않을 만큼만 이동.
 */
export function clampOffset(offset: Point, displayed: Size, stage: Size): Point {
  const maxX = Math.max(0, (displayed.width - stage.width) / 2);
  const maxY = Math.max(0, (displayed.height - stage.height) / 2);
  // `|| 0`: -0을 0으로 정리
  return {
    x: Math.min(Math.max(offset.x, -maxX), maxX) || 0,
    y: Math.min(Math.max(offset.y, -maxY), maxY) || 0,
  };
}

/**
 * anchor(stage 중심 기준 좌표) 아래의 이미지 지점이 확대 후에도 같은 자리에 있도록 하는 offset.
 * 버튼은 stage 중심, 핀치·ctrl+휠은 손가락·포인터 위치를 anchor로 쓴다.
 */
export function zoomAtPoint(zoom: number, offset: Point, nextZoom: number, anchor: Point): Point {
  const ratio = nextZoom / zoom;
  return {
    x: anchor.x - (anchor.x - offset.x) * ratio,
    y: anchor.y - (anchor.y - offset.y) * ratio,
  };
}

export function formatZoom(zoom: number): string {
  return `${Math.round(zoom * 100)}%`;
}
