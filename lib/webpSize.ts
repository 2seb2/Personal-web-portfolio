/**
 * WebP 파일 헤더에서 가로·세로 크기를 읽는다 — 아티클 본문 이미지를 next/image로 그리려면 크기가 필요하다.
 * 형식: RIFF 헤더 뒤 첫 청크가 VP8(손실) · VP8L(무손실) · VP8X(확장) 중 하나.
 */
export function readWebpSize(buffer: Buffer): { width: number; height: number } {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('WebP 파일이 아닙니다');
  }
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  }
  if (chunk === 'VP8 ') {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`알 수 없는 WebP 청크: ${chunk}`);
}
