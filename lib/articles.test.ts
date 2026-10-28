import { describe, expect, it } from 'vitest';
import {
  formatArticleYear,
  getArticle,
  getArticleImages,
  getArticles,
  parseArticle,
  sortArticles,
} from './articles';

const raw = (front: string, body = '본문') => `---\n${front}\n---\n\n${body}\n`;
const valid = [
  'id: "article1"',
  'title: "제목"',
  'kinds: ["스터디"]',
  'stacks: ["React", "Vue"]',
  'date: "2025-01-01"   # 주석은 무시',
  'excerpt: "요약..."',
].join('\n');

describe('parseArticle', () => {
  it('frontmatter와 본문을 나눠 읽는다', () => {
    expect(parseArticle('article1.md', raw(valid, '## 제목\n\n문단'))).toEqual({
      id: 'article1',
      title: '제목',
      date: '2025-01-01',
      kinds: ['스터디'],
      stacks: ['React', 'Vue'],
      excerpt: '요약...',
      body: '## 제목\n\n문단',
    });
  });

  it('id가 파일명과 다르면 실패한다', () => {
    expect(() => parseArticle('article2.md', raw(valid))).toThrow('article2.md: id(article1)가 파일명과 다릅니다');
  });

  it('필수 문자열이 비어 있으면 실패한다', () => {
    expect(() => parseArticle('article1.md', raw(valid.replace('title: "제목"', 'title: ""')))).toThrow(
      'title가 비어 있습니다',
    );
  });

  it('태그가 문자열 배열이 아니면 실패한다', () => {
    expect(() => parseArticle('article1.md', raw(valid.replace('kinds: ["스터디"]', 'kinds: "스터디"')))).toThrow(
      'kinds는 문자열 배열이어야 합니다',
    );
  });

  it('date가 YYYY-MM-DD가 아니면 실패한다', () => {
    expect(() => parseArticle('article1.md', raw(valid.replace('"2025-01-01"', '"2025"')))).toThrow(
      'date(2025)는 YYYY-MM-DD 형식이어야 합니다',
    );
  });
});

describe('sortArticles', () => {
  const base = { title: '', kinds: [], stacks: [], excerpt: '' };
  it('최신 날짜 먼저, 같은 날짜면 번호 순서', () => {
    const sorted = sortArticles([
      { ...base, id: 'article10', date: '2025-01-01' },
      { ...base, id: 'article2', date: '2025-01-01' },
      { ...base, id: 'article3', date: '2026-03-09' },
    ]);
    expect(sorted.map((a) => a.id)).toEqual(['article3', 'article2', 'article10']);
  });
});

describe('formatArticleYear', () => {
  it('연도만 남긴다', () => {
    expect(formatArticleYear('2025-09-01')).toBe('2025');
  });
});

describe('content/articles', () => {
  it('모든 글이 검증을 통과하고 id가 겹치지 않는다', () => {
    const articles = getArticles();
    expect(articles.length).toBeGreaterThan(0);
    expect(new Set(articles.map((a) => a.id)).size).toBe(articles.length);
  });

  it('없는 id나 경로 문자가 섞인 id는 undefined', () => {
    expect(getArticle('no-such-article')).toBeUndefined();
    expect(getArticle('../package')).toBeUndefined();
  });
});

describe('getArticleImages', () => {
  it('본문 순서대로 모으고, 캡션이 없으면 대체 이름을 붙인다', () => {
    const body = '문단\n\n![](/images/articles/article11/01.webp)\n\n![캡션](/images/articles/article11/01.webp)';
    expect(getArticleImages({ title: 'SDK', body })).toEqual([
      { src: '/images/articles/article11/01.webp', alt: 'SDK 본문 이미지 1', caption: '', width: 3022, height: 1572, offset: 4 },
      { src: '/images/articles/article11/01.webp', alt: '캡션', caption: '캡션', width: 3022, height: 1572, offset: 45 },
    ]);
  });

  it('파일이 없으면 실패한다', () => {
    expect(() => getArticleImages({ title: '', body: '![](/images/articles/none/01.webp)' })).toThrow(
      '아티클 이미지가 없습니다: public/images/articles/none/01.webp',
    );
  });

  it('모든 글의 본문 이미지가 실제로 있다', () => {
    for (const { id } of getArticles()) {
      expect(() => getArticleImages(getArticle(id)!)).not.toThrow();
    }
  });
});
