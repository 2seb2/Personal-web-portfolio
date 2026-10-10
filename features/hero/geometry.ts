// 히어로 레이아웃 좌표 계산. spec 7장을 순수 함수로 구현한다.
import { ringGeometry } from '@/content/keywords';

export type Point = { x: number; y: number };

export type RingPosition = Point & {
  /** 중심이 위치한 각도(도). -90이 위쪽 가운데, 시계 방향으로 증가 */
  angleDeg: number;
  /** 이 칩에 적용할 기울기(도) */
  rotateDeg: number;
};

/**
 * 링 배치가 Hero Copy 블록과 겹치지 않는 최소 뷰포트 크기 (spec 7장 결정 로그 2026-10-11).
 * height는 Hero 섹션 높이(Nav 제외) 기준 — 실측 경계(783px)에 여유를 둔 값.
 */
export const MIN_RING_VIEWPORT = { width: 1512, height: 790 };

/** 이 폭·높이 조합에서 링 배치(타원 둘레)를 쓸 수 있는지. 아니면 띠 배치를 쓴다 */
export function canUseRingLayout(viewportWidth: number, viewportHeight: number): boolean {
  return viewportWidth >= MIN_RING_VIEWPORT.width && viewportHeight >= MIN_RING_VIEWPORT.height;
}

/** 칩 높이(px). KeywordPill 패딩 12*2 + type-label-pill 라인하이트 28, 실측 54px */
export const CHIP_HEIGHT_PX = 54;

/**
 * 가장 긴 라벨("Feedback으로 다듬는") 칩의 절반 폭(px). 칩 폰트 크기는 화면 폭과 무관하게 고정이라
 * 뷰포트에 비례해 스케일링하지 않는다. 화면 경계 상한 계산 시 칩 중심뿐 아니라 칩 자체도
 * 화면 밖으로 나가지 않도록 여백에 더한다 (spec 12장 #14 — 좁은 구간에서도 칩이 화면 안에 있어야 함).
 * 띠 배치에서도 모든 칩을 이 고정폭으로 동일하게 취급한다(라벨마다 실측하지 않음).
 */
export const CHIP_MAX_HALF_WIDTH_PX = 100;

/** 띠 배치 칩 사이 가로 간격의 기본값(px). 폭이 좁아지면 이보다 줄어들고, 더 좁아지면 음수(겹침)가 된다 */
export const STRIP_CHIP_GAP_PX = 12;

/** 띠 배치 좌우 여백(px). Hero.tsx의 px-6과 맞춘다 */
export const STRIP_SIDE_PADDING_PX = 24;

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
 * 각 칩의 링 배치 위치(화면 좌표계, px)를 계산한다. `canUseRingLayout`이 true인
 * 뷰포트에서만 호출한다 — 그보다 좁거나 낮으면 띠 배치(`computeStripLayout`)를 쓴다.
 * - Ring 크기(중심·반지름)는 화면 폭에 비례해 스케일링 (spec 7장)
 * - 칩은 Hero Copy 블록이나 다른 칩과 겹쳐도 된다(가림 허용) — 화면 밖으로만 나가지 않도록
 *   반지름 상한을 둔다
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

  return Array.from({ length: chipCount }, (_, i) => {
    const angleDeg = getChipAngleDeg(i, chipCount);
    const angleRad = (angleDeg * Math.PI) / 180;

    return {
      x: scaledCenter.x + safeRadius.x * Math.cos(angleRad),
      y: scaledCenter.y + safeRadius.y * Math.sin(angleRad),
      angleDeg,
      rotateDeg: rotations[i],
    };
  });
}

/**
 * 칩(고정폭 CHIP_MAX_HALF_WIDTH_PX*2 × 높이 CHIP_HEIGHT_PX)을 rotateDeg만큼 돌렸을 때
 * 가로로 차지하는 투영 폭(px). 띠 배치에서 칩끼리 겹치지 않는 가로 간격을 잡는 기준이 된다.
 */
export function getRotatedChipProjectedWidth(rotateDeg: number): number {
  const rad = (rotateDeg * Math.PI) / 180;
  const width = CHIP_MAX_HALF_WIDTH_PX * 2;
  return width * Math.abs(Math.cos(rad)) + CHIP_HEIGHT_PX * Math.abs(Math.sin(rad));
}

/**
 * 같은 칩을 rotateDeg만큼 돌렸을 때 세로로 차지하는 투영 높이(px). 기울어진 칩은 평평할 때보다
 * 세로로도 더 넓은 영역을 차지하므로, 띠가 화면 밖으로 나가지 않도록 clamp할 때 이 값을
 * 기준으로 잡아야 실제로 화면 안에 들어온다.
 */
export function getRotatedChipProjectedHeight(rotateDeg: number): number {
  const rad = (rotateDeg * Math.PI) / 180;
  const width = CHIP_MAX_HALF_WIDTH_PX * 2;
  return width * Math.abs(Math.sin(rad)) + CHIP_HEIGHT_PX * Math.abs(Math.cos(rad));
}

export type StripChipPosition = Point & {
  rotateDeg: number;
};

export type ComputeStripLayoutParams = {
  /** 현재 화면(뷰포트) 폭 */
  viewportWidth: number;
  /** 현재 화면(뷰포트) 높이. 화면 밖 이탈 방지(clamp)에 쓰인다 */
  viewportHeight: number;
  /** 위쪽 띠에 놓을 칩들의 기울기(°). 링 순서(인덱스) 그대로 */
  topRotations: number[];
  /** 아래쪽 띠에 놓을 칩들의 기울기(°). 링 순서(인덱스) 그대로 */
  bottomRotations: number[];
  /** Hero Copy 블록의 세로 중앙 y좌표 */
  heroCopyCenterY: number;
  /** Hero Copy 블록의 세로 절반 높이 */
  heroCopyHalfHeight: number;
};

export type StripLayoutResult = {
  top: StripChipPosition[];
  bottom: StripChipPosition[];
};

/**
 * 한 띠(항상 한 줄)의 칩들을 가로 중앙 정렬한 x좌표를 계산한다. 자연 간격(STRIP_CHIP_GAP_PX)으로
 * 다 들어가면 그 간격을 쓰고, 화면이 좁아 다 안 들어가면 칩 사이 간격을 균등하게 좁혀(겹침
 * 포함, 하한 없음) 띠 전체가 항상 화면 폭 안에 들어가게 한다.
 */
function layoutStripX(rotations: number[], availableWidth: number): number[] {
  const widths = rotations.map(getRotatedChipProjectedWidth);
  const widthSum = widths.reduce((sum, w) => sum + w, 0);
  const gapCount = rotations.length - 1;

  const gap = gapCount > 0 ? Math.min(STRIP_CHIP_GAP_PX, (availableWidth - widthSum) / gapCount) : STRIP_CHIP_GAP_PX;
  const totalWidth = widthSum + gap * gapCount;

  let x = -totalWidth / 2;
  return widths.map((w) => {
    const center = x + w / 2;
    x += w + gap;
    return center;
  });
}

/**
 * 위/아래 두 띠(각각 항상 한 줄)의 칩 위치를 계산한다.
 * - 위쪽 띠는 Hero Copy 상단과 Hero 섹션 상단 사이의 중간, 아래쪽 띠는 대칭으로 Hero Copy
 *   하단과 섹션 하단 사이의 중간에 둔다 (2026-10-11 변경 — 블록에 바짝 붙지 않게)
 * - 화면이 좁아 한 줄에 다 안 들어가면 칩 사이 간격을 좁혀 겹치게 한다(줄바꿈 없음, 하한 없음)
 * - 화면 밖으로 나가면 화면 안쪽으로 밀어 넣는다(clamp) — 그 결과 Hero Copy와 겹치는 것은
 *   허용한다(화면 밖 이탈만 금지, spec 7장 결정 로그 2026-10-11)
 */
export function computeStripLayout({
  viewportWidth,
  viewportHeight,
  topRotations,
  bottomRotations,
  heroCopyCenterY,
  heroCopyHalfHeight,
}: ComputeStripLayoutParams): StripLayoutResult {
  const availableWidth = viewportWidth - STRIP_SIDE_PADDING_PX * 2;
  const edgePadding = ringGeometry.edgePaddingPx;
  const centerX = viewportWidth / 2;

  const heroCopyTop = heroCopyCenterY - heroCopyHalfHeight;
  const heroCopyBottom = heroCopyCenterY + heroCopyHalfHeight;

  // 위쪽 띠: Hero 섹션 상단(0)과 Hero Copy 상단 사이의 중간. 아래쪽 띠는 대칭.
  let topY = heroCopyTop / 2;
  let bottomY = (heroCopyBottom + viewportHeight) / 2;

  const topMaxHalfHeight = topRotations.length > 0 ? Math.max(...topRotations.map(getRotatedChipProjectedHeight)) / 2 : 0;
  const bottomMaxHalfHeight = bottomRotations.length > 0 ? Math.max(...bottomRotations.map(getRotatedChipProjectedHeight)) / 2 : 0;

  topY = Math.max(topY, edgePadding + topMaxHalfHeight);
  bottomY = Math.min(bottomY, viewportHeight - edgePadding - bottomMaxHalfHeight);

  const topXs = layoutStripX(topRotations, availableWidth);
  const bottomXs = layoutStripX(bottomRotations, availableWidth);

  const top: StripChipPosition[] = topRotations.map((rotateDeg, i) => ({ x: centerX + topXs[i], y: topY, rotateDeg }));
  const bottom: StripChipPosition[] = bottomRotations.map((rotateDeg, i) => ({ x: centerX + bottomXs[i], y: bottomY, rotateDeg }));

  return { top, bottom };
}
