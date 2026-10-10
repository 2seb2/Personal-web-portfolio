import { describe, expect, it } from 'vitest';
import { keywords } from '@/content/keywords';
import {
  CHIP_HEIGHT_PX,
  CHIP_MAX_HALF_WIDTH_PX,
  computeRingPositions,
  getChipAngleDeg,
  getMaxRadiusWithinViewport,
  isNarrowDesktopWidth,
} from './geometry';

const CHIP_COUNT = keywords.length; // 11
const ROTATIONS = keywords.map((k) => k.ring.rotate);
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

describe('isNarrowDesktopWidth', () => {
  it('768~1023px 구간을 좁은 데스크톱으로 판단한다', () => {
    expect(isNarrowDesktopWidth(768)).toBe(true);
    expect(isNarrowDesktopWidth(900)).toBe(true);
    expect(isNarrowDesktopWidth(1023)).toBe(true);
  });

  it('그 밖의 폭은 좁은 데스크톱이 아니다', () => {
    expect(isNarrowDesktopWidth(767)).toBe(false);
    expect(isNarrowDesktopWidth(1024)).toBe(false);
    expect(isNarrowDesktopWidth(1512)).toBe(false);
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

  it('1512px(좁은 데스크톱 구간 밖)에서는 데이터의 기울기를 그대로 쓴다', () => {
    const positions = computeRingPositions({ ...viewportFor(1512), rotations: ROTATIONS });
    positions.forEach((p, i) => expect(p.rotateDeg).toBe(ROTATIONS[i]));
  });

  it('768~1023px 구간에서는 기울기가 모두 0이다', () => {
    for (const width of [768, 900, 1023]) {
      const positions = computeRingPositions({ ...viewportFor(width), rotations: ROTATIONS });
      positions.forEach((p) => expect(p.rotateDeg).toBe(0));
    }
  });
});

describe('768/900/1023/1512 폭에서 칩이 화면(viewport) 밖으로 나가지 않는다 (spec 12장 #14)', () => {
  // 칩은 Hero Copy 블록이나 다른 칩과 겹쳐도 된다(7장 결정 로그 2026-10-11).
  // 유일한 하드 제약은 "화면 밖으로 나가지 않는다"이다 — 칩 bounding box(가장 긴 라벨
  // 기준 반폭 CHIP_MAX_HALF_WIDTH_PX)까지 포함해 확인한다.
  const widths = [768, 900, 1023, 1512];

  it.each(widths)('%dpx 폭에서 모든 칩의 bounding box가 화면 안에 있다', (viewportWidth) => {
    const { viewportHeight } = viewportFor(viewportWidth);
    const positions = computeRingPositions({ viewportWidth, viewportHeight, rotations: ROTATIONS });

    for (const position of positions) {
      expect(position.x - CHIP_MAX_HALF_WIDTH_PX).toBeGreaterThanOrEqual(-1);
      expect(position.x + CHIP_MAX_HALF_WIDTH_PX).toBeLessThanOrEqual(viewportWidth + 1);
      expect(position.y - CHIP_HEIGHT_PX / 2).toBeGreaterThanOrEqual(-1);
      expect(position.y + CHIP_HEIGHT_PX / 2).toBeLessThanOrEqual(viewportHeight + 1);
    }
  });
});
