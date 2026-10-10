// 히어로 링(Ring) 좌표 계산. spec 7장을 순수 함수로 구현한다.
import { ringGeometry } from '@/content/keywords';

export type Point = { x: number; y: number };

export type RingPosition = Point & {
  /** 중심이 위치한 각도(도). -90이 위쪽 가운데, 시계 방향으로 증가 */
  angleDeg: number;
  /** 이 칩에 적용할 기울기(도). 768~1023px 구간에서는 0으로 강제된다 */
  rotateDeg: number;
};

/** 기울기를 0으로 강제하는 폭 구간 (spec 7장 "768px ~ 1023px 구간" 보조 규칙) */
export const NARROW_DESKTOP_RANGE = { min: 768, max: 1023 };

export function isNarrowDesktopWidth(viewportWidth: number): boolean {
  return viewportWidth >= NARROW_DESKTOP_RANGE.min && viewportWidth <= NARROW_DESKTOP_RANGE.max;
}

/** 칩 높이(px, 1512px 기준). KeywordPill 패딩 12*2 + type-label-pill 라인하이트 28 */
export const CHIP_HEIGHT_PX = 52;

/**
 * 가장 긴 라벨("Feedback으로 다듬는") 칩의 절반 폭(px). 칩 폰트 크기는 화면 폭과 무관하게 고정이라
 * 뷰포트에 비례해 스케일링하지 않는다. 화면 경계 상한 계산 시 칩 중심뿐 아니라 칩 자체도
 * 화면 밖으로 나가지 않도록 여백에 더한다 (spec 12장 #14 — 좁은 구간에서도 칩이 화면 안에 있어야 함).
 */
export const CHIP_MAX_HALF_WIDTH_PX = 100;

/**
 * 칩 i(0-based)의 각도. 위쪽 가운데(-90°)에서 시작해 시계 방향으로 균등 분포.
 * spec 7장: 칩 i의 각도 = -90° + i × 360° / 칩 개수
 */
export function getChipAngleDeg(index: number, chipCount: number): number {
  return -90 + (index * 360) / chipCount;
}

/**
 * 칩 중심이 화면 가장자리 안쪽(edgePaddingPx 여백)에 머물도록 하는 반지름 상한.
 * 칩은 Hero Copy 블록이나 다른 칩과 겹쳐도 되지만(7장 결정 로그 2026-10-11), 화면 밖으로
 * 나가는 것은 막는다.
 */
export function getMaxRadiusWithinViewport(
  viewportWidth: number,
  viewportHeight: number,
  center: Point,
  edgePaddingPx: number = ringGeometry.edgePaddingPx,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(center.x, viewportWidth - center.x) - edgePaddingPx),
    y: Math.max(0, Math.min(center.y, viewportHeight - center.y) - edgePaddingPx),
  };
}

export type ComputeRingPositionsParams = {
  /** 현재 화면(뷰포트) 폭 */
  viewportWidth: number;
  /** 현재 화면(뷰포트) 높이. 화면 경계 상한 계산에 쓰인다 */
  viewportHeight: number;
  /** 각 칩의 기울기(°). 데이터 순서(= Ring 순서) 그대로 */
  rotations: number[];
};

/**
 * 각 칩의 Home 위치(화면 좌표계, px)를 계산한다.
 * - Ring 크기(중심·반지름)는 화면 폭에 비례해 스케일링 (spec 7장)
 * - 칩은 Hero Copy 블록이나 다른 칩과 겹쳐도 된다(가림 허용) — 화면 밖으로만 나가지 않도록
 *   반지름 상한을 둔다
 * - 768~1023px 구간에서는 기울기를 0으로 강제한다 (spec 7장 보조 규칙)
 */
export function computeRingPositions({
  viewportWidth,
  viewportHeight,
  rotations,
}: ComputeRingPositionsParams): RingPosition[] {
  const chipCount = rotations.length;
  const scale = viewportWidth / ringGeometry.baseWidth;

  // Ring 중심은 Hero 섹션(Nav를 뺀 영역)의 실제 중앙이다. Hero Copy 블록도 flex로 이
  // 중앙에 배치되므로, 칩도 같은 중심을 쓰면 블록을 정확히 둘러싸는 구도가 된다.
  // spec의 고정값(756, 528)은 "1512×982 프레임 기준"이라 Nav를 포함한 좌표라 그대로 쓰면
  // Ring이 Hero 섹션 중앙보다 아래로 치우친다 — 화면 중앙 기준으로 다시 잡는다.
  const scaledCenter: Point = {
    x: viewportWidth / 2,
    y: viewportHeight / 2,
  };
  const scaledRadius = {
    x: ringGeometry.radius.x * scale,
    y: ringGeometry.radius.y * scale,
  };

  // 칩의 중심뿐 아니라 칩 자체(가장 긴 라벨 기준)도 화면 밖으로 나가지 않도록 여백을 더한다.
  const maxRadius = getMaxRadiusWithinViewport(
    viewportWidth,
    viewportHeight,
    scaledCenter,
    ringGeometry.edgePaddingPx + CHIP_MAX_HALF_WIDTH_PX,
  );
  const safeRadius = {
    x: Math.min(scaledRadius.x, maxRadius.x),
    y: Math.min(scaledRadius.y, maxRadius.y),
  };

  const forceFlatRotation = isNarrowDesktopWidth(viewportWidth);

  return Array.from({ length: chipCount }, (_, i) => {
    const angleDeg = getChipAngleDeg(i, chipCount);
    const angleRad = (angleDeg * Math.PI) / 180;

    return {
      x: scaledCenter.x + safeRadius.x * Math.cos(angleRad),
      y: scaledCenter.y + safeRadius.y * Math.sin(angleRad),
      angleDeg,
      rotateDeg: forceFlatRotation ? 0 : rotations[i],
    };
  });
}
