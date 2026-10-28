import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readWebpSize } from './webpSize';

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), 'public/images/articles', file));

describe('readWebpSize', () => {
  it('손실 압축(VP8) 크기를 읽는다', () => {
    expect(readWebpSize(read('article11/01.webp'))).toEqual({ width: 3022, height: 1572 });
  });

  it('확장 형식(VP8X) 크기를 읽는다', () => {
    // RIFF 헤더 + VP8X 청크: 24·27번째 바이트부터 3바이트씩 (가로-1, 세로-1)
    const buffer = Buffer.alloc(30);
    buffer.write('RIFF', 0, 'ascii');
    buffer.write('WEBP', 8, 'ascii');
    buffer.write('VP8X', 12, 'ascii');
    buffer.writeUIntLE(410 - 1, 24, 3);
    buffer.writeUIntLE(296 - 1, 27, 3);
    expect(readWebpSize(buffer)).toEqual({ width: 410, height: 296 });
  });

  it('무손실(VP8L) 크기를 읽는다', () => {
    // RIFF 헤더 + VP8L 청크: 서명 0x2f 뒤 14비트씩 (가로-1, 세로-1)
    const buffer = Buffer.alloc(30);
    buffer.write('RIFF', 0, 'ascii');
    buffer.write('WEBP', 8, 'ascii');
    buffer.write('VP8L', 12, 'ascii');
    buffer[20] = 0x2f;
    buffer.writeUInt32LE((640 - 1) | ((480 - 1) << 14), 21);
    expect(readWebpSize(buffer)).toEqual({ width: 640, height: 480 });
  });

  it('WebP가 아니면 실패한다', () => {
    expect(() => readWebpSize(Buffer.from('not an image at all'))).toThrow('WebP 파일이 아닙니다');
  });
});
