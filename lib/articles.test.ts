import { describe, expect, it } from 'vitest';
import {
  formatArticleDate,
  getArticle,
  getArticleImages,
  getArticlePageHref,
  getArticles,
  getArticleListPage,
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
      pinned: false,
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

  it('pinned: true를 읽고, 불리언이 아니면 실패한다', () => {
    expect(parseArticle('article1.md', raw(valid + '\npinned: true')).pinned).toBe(true);
    expect(() => parseArticle('article1.md', raw(valid + '\npinned: "yes"'))).toThrow('pinned는 true 또는 false여야 합니다');
  });

  it('date가 YYYY-MM-DD가 아니면 실패한다', () => {
    expect(() => parseArticle('article1.md', raw(valid.replace('"2025-01-01"', '"2025"')))).toThrow(
      'date(2025)는 YYYY-MM-DD 형식이어야 합니다',
    );
  });
});

describe('sortArticles', () => {
  const base = { title: '', kinds: [], stacks: [], excerpt: '', pinned: false };
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

describe('getArticleListPage', () => {
  // 날짜순 18편, 14·15·16번째가 고정 글 (지금 데이터와 같은 모양)
  const list = Array.from({ length: 18 }, (_, i) => ({ n: i + 1, pinned: [14, 15, 16].includes(i + 1) }));
  const ns = (items: { n: number }[]) => items.map((a) => a.n);

  it('1쪽은 Pinned 3 + 날짜순 4, 이후 7개씩 — 고정 글도 날짜순 자리에 그대로', () => {
    const p1 = getArticleListPage(list, 1)!;
    expect(ns(p1.pinned)).toEqual([14, 15, 16]);
    expect(ns(p1.items)).toEqual([1, 2, 3, 4]);
    expect(p1.totalPages).toBe(3);
    expect(ns(getArticleListPage(list, 2)!.items)).toEqual([5, 6, 7, 8, 9, 10, 11]);
    const p3 = getArticleListPage(list, 3)!;
    expect(ns(p3.items)).toEqual([12, 13, 14, 15, 16, 17, 18]);
    expect(p3.pinned).toEqual([]);
  });

  it('고정 글이 없으면 모든 쪽이 날짜순 7개씩', () => {
    const plain = list.map((a) => ({ ...a, pinned: false }));
    expect(ns(getArticleListPage(plain, 1)!.items)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getArticleListPage(plain, 1)!.totalPages).toBe(3);
    expect(ns(getArticleListPage(plain, 3)!.items)).toEqual([15, 16, 17, 18]);
  });

  it('없는 쪽이면 undefined', () => {
    expect(getArticleListPage(list, 0)).toBeUndefined();
    expect(getArticleListPage(list, 4)).toBeUndefined();
    expect(getArticleListPage(list, 1.5)).toBeUndefined();
  });

  it('글이 없어도 1쪽은 있다', () => {
    expect(getArticleListPage([], 1)).toEqual({ pinned: [], items: [], totalPages: 1 });
  });

  it('고정 글이 7편이면 1쪽은 고정 글만, 날짜순은 2쪽부터', () => {
    const seven = list.map((a) => ({ ...a, pinned: a.n <= 7 }));
    const p1 = getArticleListPage(seven, 1)!;
    expect(ns(p1.pinned)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(p1.items).toEqual([]);
    expect(p1.totalPages).toBe(4);
    expect(ns(getArticleListPage(seven, 2)!.items)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(ns(getArticleListPage(seven, 4)!.items)).toEqual([15, 16, 17, 18]);
  });

  it('고정 글이 7편을 넘으면 실패한다', () => {
    const many = list.map((a) => ({ ...a, pinned: a.n <= 8 }));
    expect(() => getArticleListPage(many, 1)).toThrow('Pinned 아티클은 최대 7편입니다 (지금 8편)');
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
