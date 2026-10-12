import { describe, expect, it } from 'vitest';
import { keywords } from '@/content/keywords';
import {
  CHIP_HEIGHT_PX,
  CHIP_MAX_HALF_WIDTH_PX,
  STRIP_CHIP_GAP_PX,
  canUseRingLayout,
  computeRingPositions,
  computeStripLayout,
  getChipAngleDeg,
  getMaxRadiusWithinViewport,
  getRotatedChipProjectedHeight,
  getRotatedChipProjectedWidth,
} from './geometry';

const CHIP_COUNT = keywords.length; // 11
const ROTATIONS = keywords.map((k) => k.ring.rotate);
const TOP_ROTATIONS = ROTATIONS.slice(0, 6);
const BOTTOM_ROTATIONS = ROTATIONS.slice(6);
// spec 7장: 기준 화면 1512 × 982. 화면 폭에 비례해 높이도 같은 비율로 스케일링한다고 가정.
const BASE_VIEWPORT = { width: 1512, height: 982 };

function viewportFor(width: number) {
  const scale = width / BASE_VIEWPORT.width;
  return { viewportWidth: width, viewportHeight: BASE_VIEWPORT.height * scale };
}

describe('getChipAngleDeg', () => {
  it('첫 번째 칩(index 0)은 위쪽 가운데(-90°)에서 시작한다', () => {
    expect(getChipAngleDeg(0, CHIP_COUNT)).toBe(-90);
  });

  it('칩은 360° / 개수 만큼 시계 방향으로 균등 분포한다', () => {
    const step = 360 / CHIP_COUNT;
    expect(getChipAngleDeg(1, CHIP_COUNT)).toBeCloseTo(-90 + step);
    expect(getChipAngleDeg(2, CHIP_COUNT)).toBeCloseTo(-90 + step * 2);
  });

  it('마지막 칩 다음(한 바퀴)은 시작 각도 + 360°와 같다', () => {
    expect(getChipAngleDeg(CHIP_COUNT, CHIP_COUNT)).toBeCloseTo(-90 + 360);
  });
});

describe('getMaxRadiusWithinViewport', () => {
  it('중심이 화면 한가운데면 중심에서 가장자리까지 거리에서 여백을 뺀 값이다', () => {
    const result = getMaxRadiusWithinViewport(1000, 800, { x: 500, y: 400 }, 16);
    expect(result.x).toBe(500 - 16);
    expect(result.y).toBe(400 - 16);
  });

  it('중심이 가장자리에 가까우면 그만큼 상한이 작아진다', () => {
    const result = getMaxRadiusWithinViewport(1000, 800, { x: 900, y: 400 }, 16);
    // min(900, 100) - 16 = 84
    expect(result.x).toBe(84);
  });

  it('음수가 되지 않는다', () => {
    const result = getMaxRadiusWithinViewport(100, 100, { x: 10, y: 10 }, 50);
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeGreaterThanOrEqual(0);
  });
});

describe('canUseRingLayout', () => {
  it('폭·높이가 모두 기준(1350×790) 이상이면 링 배치를 쓸 수 있다', () => {
    expect(canUseRingLayout(1350, 790)).toBe(true);
    expect(canUseRingLayout(1920, 982)).toBe(true);
  });

  it('폭이 기준보다 좁으면 높이가 충분해도 링 배치를 쓸 수 없다 (spec 7장 결정 로그 2026-10-11)', () => {
    expect(canUseRingLayout(1199, 982)).toBe(false);
  });

  it('높이가 기준보다 낮으면 폭이 충분해도 링 배치를 쓸 수 없다', () => {
    expect(canUseRingLayout(1350, 789)).toBe(false);
  });
});

describe('computeRingPositions — 칩 개수와 좌표 형태', () => {
  it('요청한 개수만큼 좌표를 반환한다', () => {
    const positions = computeRingPositions({ ...viewportFor(1512), rotations: ROTATIONS });
    expect(positions).toHaveLength(CHIP_COUNT);
  });

  it('1512px 기준값에서 첫 칩은 화면 중앙 위, 기준 반지름만큼 떨어진 위치다', () => {
    const { viewportWidth, viewportHeight } = viewportFor(1512);
    const positions = computeRingPositions({ viewportWidth, viewportHeight, rotations: ROTATIONS });
    // Ring 중심은 Hero 섹션의 실제 중앙(viewportWidth/2, viewportHeight/2)이다 — Hero Copy
    // 블록도 flex로 같은 중앙에 배치되므로 중심을 일치시킨다 (spec의 고정값 528이 아님).
    // angle -90° → cos(-90)=0, sin(-90)=-1 → (centerX, centerY - ry)
    expect(positions[0].x).toBeCloseTo(viewportWidth / 2);
    expect(positions[0].y).toBeCloseTo(viewportHeight / 2 - 330);
  });

  it('데이터의 기울기를 그대로 쓴다', () => {
    const positions = computeRingPositions({ ...viewportFor(1512), rotations: ROTATIONS });
    positions.forEach((p, i) => expect(p.rotateDeg).toBe(ROTATIONS[i]));
  });
});

describe('링 배치 구간에서 칩이 화면(viewport) 밖으로 나가지 않는다 (spec 12장 #14)', () => {
  // 칩은 Hero Copy 블록이나 다른 칩과 겹쳐도 된다(7장 결정 로그 2026-10-11).
  // 유일한 하드 제약은 "화면 밖으로 나가지 않는다"이다 — 칩 bounding box(가장 긴 라벨
  // 기준 반폭 CHIP_MAX_HALF_WIDTH_PX)까지 포함해 확인한다.
  it.each([1350, 1512])('%dpx 폭에서 모든 칩의 bounding box가 화면 안에 있다', (width) => {
    const { viewportWidth, viewportHeight } = viewportFor(width);
    const positions = computeRingPositions({ viewportWidth, viewportHeight, rotations: ROTATIONS });

    for (const position of positions) {
      expect(position.x - CHIP_MAX_HALF_WIDTH_PX).toBeGreaterThanOrEqual(-1);
      expect(position.x + CHIP_MAX_HALF_WIDTH_PX).toBeLessThanOrEqual(viewportWidth + 1);
      expect(position.y - CHIP_HEIGHT_PX / 2).toBeGreaterThanOrEqual(-1);
      expect(position.y + CHIP_HEIGHT_PX / 2).toBeLessThanOrEqual(viewportHeight + 1);
    }
  });
});

describe('getRotatedChipProjectedWidth', () => {
  it('기울기 0°면 투영 폭은 칩의 실제 폭(고정폭)과 같다', () => {
    expect(getRotatedChipProjectedWidth(0)).toBeCloseTo(CHIP_MAX_HALF_WIDTH_PX * 2);
  });

  it('기울기가 있으면 투영 폭이 더 커진다 (높이 성분이 섞여 들어감)', () => {
    expect(getRotatedChipProjectedWidth(5)).toBeGreaterThan(CHIP_MAX_HALF_WIDTH_PX * 2);
  });
});

describe('computeStripLayout — 폭이 좁아지면 칩 간격이 좁혀지다 겹친다 (2026-10-11 변경, flow wrap 대체)', () => {
  const heroCopyHalfHeight = 130; // 임의의 Hero Copy 블록 절반 높이(테스트용 근사치)

  function gapBetween(a: { x: number; rotateDeg: number }, b: { x: number; rotateDeg: number }) {
    const aHalf = getRotatedChipProjectedWidth(a.rotateDeg) / 2;
    const bHalf = getRotatedChipProjectedWidth(b.rotateDeg) / 2;
    return b.x - a.x - aHalf - bHalf;
  }

  it('화면이 충분히 넓으면(1511px) 칩 사이 간격이 자연 간격(기본값)을 유지한다', () => {
    const { top } = computeStripLayout({
      viewportWidth: 1511,
      viewportHeight: 982,
      topRotations: TOP_ROTATIONS,
      bottomRotations: BOTTOM_ROTATIONS,
      heroCopyCenterY: 982 / 2,
      heroCopyHalfHeight,
    });
    for (let i = 1; i < top.length; i++) {
      expect(gapBetween(top[i - 1], top[i])).toBeCloseTo(STRIP_CHIP_GAP_PX);
    }
  });

  it('화면 폭이 줄어들수록 칩 사이 간격이 점점 좁아진다(음수=겹침 포함)', () => {
    const widths = [1400, 1199, 900, 768];
    const gaps = widths.map((viewportWidth) => {
      const { top } = computeStripLayout({
        viewportWidth,
        viewportHeight: 982,
        topRotations: TOP_ROTATIONS,
        bottomRotations: BOTTOM_ROTATIONS,
        heroCopyCenterY: 982 / 2,
        heroCopyHalfHeight,
      });
      return gapBetween(top[0], top[1]);
    });

    for (let i = 1; i < gaps.length; i++) {
      expect(gaps[i]).toBeLessThan(gaps[i - 1]);
    }
    // 768px은 간격이 자연 간격보다 좁아져 겹친다(음수)
    expect(gaps[gaps.length - 1]).toBeLessThan(0);
  });

  it.each([768, 900, 1199])('%dpx 폭에서도 각 띠는 줄바꿈 없이 한 줄을 유지한다', (viewportWidth) => {
    const { top, bottom } = computeStripLayout({
      viewportWidth,
      viewportHeight: 982,
      topRotations: TOP_ROTATIONS,
      bottomRotations: BOTTOM_ROTATIONS,
      heroCopyCenterY: 982 / 2,
      heroCopyHalfHeight,
    });
    // 한 줄이므로 모든 칩의 y가 각 띠 안에서 동일하다
    expect(new Set(top.map((c) => c.y)).size).toBe(1);
    expect(new Set(bottom.map((c) => c.y)).size).toBe(1);
  });

  it('Tab 순서(배열 순서)는 링 순서(인덱스) 그대로 유지된다 — 위쪽 띠 다음 아래쪽 띠', () => {
    const { top, bottom } = computeStripLayout({
      viewportWidth: 900,
      viewportHeight: 982,
      topRotations: TOP_ROTATIONS,
      bottomRotations: BOTTOM_ROTATIONS,
      heroCopyCenterY: 982 / 2,
      heroCopyHalfHeight,
    });
    expect(top).toHaveLength(TOP_ROTATIONS.length);
    expect(bottom).toHaveLength(BOTTOM_ROTATIONS.length);
    expect(top.map((c) => c.rotateDeg)).toEqual(TOP_ROTATIONS);
    expect(bottom.map((c) => c.rotateDeg)).toEqual(BOTTOM_ROTATIONS);
  });
});

describe('computeStripLayout — 띠는 Hero Copy와 화면 가장자리 사이 중간에 위치한다 (2026-10-11 변경)', () => {
  it('위쪽 띠 중심은 Hero Copy 상단과 화면(섹션) 상단의 중간이다', () => {
    const viewportHeight = 982;
    const heroCopyCenterY = viewportHeight / 2;
    const heroCopyHalfHeight = 130;
    const heroCopyTop = heroCopyCenterY - heroCopyHalfHeight;
    const { top } = computeStripLayout({
      viewportWidth: 900,
      viewportHeight,
      topRotations: TOP_ROTATIONS,
      bottomRotations: BOTTOM_ROTATIONS,
      heroCopyCenterY,
      heroCopyHalfHeight,
    });
    expect(top[0].y).toBeCloseTo(heroCopyTop / 2);
  });

  it('아래쪽 띠 중심은 Hero Copy 하단과 화면(섹션) 하단의 중간이다', () => {
    const viewportHeight = 982;
    const heroCopyCenterY = viewportHeight / 2;
    const heroCopyHalfHeight = 130;
    const heroCopyBottom = heroCopyCenterY + heroCopyHalfHeight;
    const { bottom } = computeStripLayout({
      viewportWidth: 900,
      viewportHeight,
      topRotations: TOP_ROTATIONS,
      bottomRotations: BOTTOM_ROTATIONS,
      heroCopyCenterY,
      heroCopyHalfHeight,
    });
    expect(bottom[0].y).toBeCloseTo((heroCopyBottom + viewportHeight) / 2);
  });
});

describe('computeStripLayout — 세로 공간이 부족한(높이 600px) 화면에서도 칩이 화면 밖으로 나가지 않는다', () => {
  it.each([768, 900, 1199])('%dpx 폭, 600px 높이에서 모든 칩이 화면 안에 있다', (viewportWidth) => {
    const viewportHeight = 600;
    const heroCopyCenterY = viewportHeight / 2;
    const heroCopyHalfHeight = 130;
    const { top, bottom } = computeStripLayout({
      viewportWidth,
      viewportHeight,
      topRotations: TOP_ROTATIONS,
      bottomRotations: BOTTOM_ROTATIONS,
      heroCopyCenterY,
      heroCopyHalfHeight,
    });

    for (const chip of [...top, ...bottom]) {
      const chipHalfHeight = getRotatedChipProjectedHeight(chip.rotateDeg) / 2;
      expect(chip.y - chipHalfHeight).toBeGreaterThanOrEqual(-1);
      expect(chip.y + chipHalfHeight).toBeLessThanOrEqual(viewportHeight + 1);
    }
  });
});
