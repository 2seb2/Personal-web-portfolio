import { describe, expect, it } from 'vitest';
import {
  formatArticleDate,
  getArticle,
  getArticleImages,
  getArticlePageHref,
  getArticles,
  paginateArticles,
  parseArticlePage,
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

describe('formatArticleDate', () => {
  it('"YYYY년 M월 D일"로, 월·일 앞의 0은 뺀다', () => {
    expect(formatArticleDate('2026-03-09')).toBe('2026년 3월 9일');
    expect(formatArticleDate('2025-12-27')).toBe('2025년 12월 27일');
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

describe('paginateArticles', () => {
  const list = Array.from({ length: 18 }, (_, i) => i + 1);

  it('8개씩 나누고 마지막 쪽은 남은 만큼', () => {
    expect(paginateArticles(list, 1)).toEqual({ items: [1, 2, 3, 4, 5, 6, 7, 8], totalPages: 3 });
    expect(paginateArticles(list, 3)).toEqual({ items: [17, 18], totalPages: 3 });
  });

  it('없는 쪽이면 undefined', () => {
    expect(paginateArticles(list, 0)).toBeUndefined();
    expect(paginateArticles(list, 4)).toBeUndefined();
    expect(paginateArticles(list, 1.5)).toBeUndefined();
  });

  it('글이 없어도 1쪽은 있다', () => {
    expect(paginateArticles([], 1)).toEqual({ items: [], totalPages: 1 });
  });
});

describe('parseArticlePage · getArticlePageHref', () => {
  it('양의 정수만 쪽 번호로 읽는다', () => {
    expect(parseArticlePage('2')).toBe(2);
    expect(parseArticlePage('02')).toBeUndefined();
    expect(parseArticlePage('0')).toBeUndefined();
    expect(parseArticlePage('abc')).toBeUndefined();
  });

  it('1쪽은 /articles, 나머지는 /articles/page/n', () => {
    expect(getArticlePageHref(1)).toBe('/articles');
    expect(getArticlePageHref(3)).toBe('/articles/page/3');
  });
});
