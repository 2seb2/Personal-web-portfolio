import { describe, expect, it } from 'vitest';
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

describe('getFitScale', () => {
  it('가로가 꽉 차는 경우 가로 비율을 쓴다', () => {
    expect(getFitScale({ width: 1640, height: 1006 }, { width: 820, height: 1000 })).toBe(0.5);
  });

  it('세로가 꽉 차는 경우 세로 비율을 쓴다', () => {
    expect(getFitScale({ width: 1640, height: 1006 }, { width: 1600, height: 503 })).toBe(0.5);
  });

  it('원본보다 크게 키우지 않는다', () => {
    expect(getFitScale({ width: 400, height: 300 }, { width: 2000, height: 2000 })).toBe(1);
  });

  it('아직 측정 전(크기 0)이면 0', () => {
    expect(getFitScale({ width: 400, height: 300 }, { width: 0, height: 0 })).toBe(0);
  });
});

describe('확대 단계', () => {
  it('100%에서 확대하면 150%, 다시 200%', () => {
    expect(getNextZoomStep(1)).toBe(1.5);
    expect(getNextZoomStep(1.5)).toBe(2);
  });

  it('핀치로 단계 사이 값이 되어도 바로 다음·이전 단계로 간다', () => {
    expect(getNextZoomStep(1.7)).toBe(2);
    expect(getPrevZoomStep(1.7)).toBe(1.5);
  });

  it('최대·최소를 넘지 않는다', () => {
    expect(getNextZoomStep(MAX_ZOOM)).toBe(MAX_ZOOM);
    expect(getPrevZoomStep(MIN_ZOOM)).toBe(MIN_ZOOM);
    expect(clampZoom(10)).toBe(MAX_ZOOM);
    expect(clampZoom(0.2)).toBe(MIN_ZOOM);
  });
});

describe('clampOffset', () => {
  const stage = { width: 1000, height: 600 };

  it('이미지가 stage보다 작으면 가운데 고정', () => {
    expect(clampOffset({ x: 120, y: -80 }, { width: 800, height: 500 }, stage)).toEqual({ x: 0, y: 0 });
  });

  it('이미지가 크면 가장자리가 stage 안으로 들어오지 않을 만큼만 이동', () => {
    // 2000×1200 → x는 ±500, y는 ±300까지
    expect(clampOffset({ x: 900, y: -900 }, { width: 2000, height: 1200 }, stage)).toEqual({ x: 500, y: -300 });
    expect(clampOffset({ x: 100, y: 50 }, { width: 2000, height: 1200 }, stage)).toEqual({ x: 100, y: 50 });
  });
});

describe('zoomAtPoint', () => {
  it('stage 중심 기준이면 offset만 비율대로 늘어난다', () => {
    expect(zoomAtPoint(1, { x: 10, y: -20 }, 2, { x: 0, y: 0 })).toEqual({ x: 20, y: -40 });
  });

  it('anchor 아래 지점이 확대 후에도 같은 화면 위치에 남는다', () => {
    const zoom = 1;
    const offset = { x: 0, y: 0 };
    const anchor = { x: 200, y: 100 };
    const next = zoomAtPoint(zoom, offset, 2, anchor);
    // anchor 아래 이미지 좌표(이미지 중심 기준, 확대 전 단위)는 확대 전후로 같아야 한다
    expect((anchor.x - next.x) / 2).toBeCloseTo((anchor.x - offset.x) / zoom);
    expect((anchor.y - next.y) / 2).toBeCloseTo((anchor.y - offset.y) / zoom);
  });
});

describe('formatZoom', () => {
  it('정수 %로 표시', () => {
    expect(formatZoom(1)).toBe('100%');
    expect(formatZoom(1.5)).toBe('150%');
    expect(formatZoom(1.234)).toBe('123%');
  });
});
