import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { site } from '@/content/site';
import { readWebpSize } from '@/lib/webpSize';
import type { Article, ArticleDetail, ArticleImage } from '@/types/content';

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

/**
 * .md 하나를 읽어 frontmatter를 검증한다. 형식이 어긋나면 빌드를 멈춘다 —
 * 나중에 자동화(Notion → n8n)가 만든 파일의 누락·오타도 배포 전에 걸러진다.
 */
export function parseArticle(fileName: string, raw: string): ArticleDetail {
  const id = fileName.replace(/\.md$/, '');
  const { data, content } = matter(raw);

  const fail = (message: string): never => {
    throw new Error(`content/articles/${fileName}: ${message}`);
  };
  const text = (key: string): string => {
    const value: unknown = data[key];
    return typeof value === 'string' && value.trim() ? value : fail(`${key}가 비어 있습니다`);
  };
  const list = (key: string): string[] => {
    const value: unknown = data[key];
    return Array.isArray(value) && value.every((item) => typeof item === 'string')
      ? value
      : fail(`${key}는 문자열 배열이어야 합니다`);
  };

  if (data.id !== id) fail(`id(${String(data.id)})가 파일명과 다릅니다`);
  if (data.pinned !== undefined && typeof data.pinned !== 'boolean') fail('pinned는 true 또는 false여야 합니다');
  const date = text('date');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`date(${date})는 YYYY-MM-DD 형식이어야 합니다`);

  return {
    id,
    title: text('title'),
    date,
    kinds: list('kinds'),
    stacks: list('stacks'),
    excerpt: text('excerpt'),
    pinned: data.pinned === true,
    body: content.trim(),
  };
}

/** 최신 날짜 먼저, 같은 날짜면 article1, article2 … 순서 */
export function sortArticles<T extends Article>(articles: T[]): T[] {
  return [...articles].sort(
    (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id, 'en', { numeric: true }),
  );
}

function readArticles(): ArticleDetail[] {
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => parseArticle(fileName, fs.readFileSync(path.join(ARTICLES_DIR, fileName), 'utf8')));
}

export function getArticles(): Article[] {
  return sortArticles(readArticles()).map((article) => ({
    id: article.id,
    title: article.title,
    date: article.date,
    kinds: article.kinds,
    stacks: article.stacks,
    excerpt: article.excerpt,
    pinned: article.pinned,
  }));
}

export function getArticle(id: string): ArticleDetail | undefined {
  if (!/^[\w-]+$/.test(id)) return undefined;
  const file = path.join(ARTICLES_DIR, `${id}.md`);
  if (!fs.existsSync(file)) return undefined;
  return parseArticle(`${id}.md`, fs.readFileSync(file, 'utf8'));
}

/** 화면 표시용 — "2026-03-09" → "2026년 3월 9일" */
export function formatArticleDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * public/images/articles 아래 모든 webp 크기. 렌더링 중에 파일을 읽으면 Cache Components가
 * 사전 렌더링을 막으므로 모듈을 불러올 때 한 번만 읽는다.
 */
const IMAGES_DIR = path.join(process.cwd(), 'public/images/articles');
const imageSizes: Record<string, { width: number; height: number }> = Object.fromEntries(
  fs
    .readdirSync(IMAGES_DIR, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.webp'))
    .map((file) => [
      `/images/articles/${file.split(path.sep).join('/')}`,
      readWebpSize(fs.readFileSync(path.join(IMAGES_DIR, file))),
    ]),
);

/**
 * 본문 이미지를 화면 순서대로 모은다 — 라이트박스 갤러리 범위. 같은 파일을 두 번 쓰면 두 장으로 센다.
 * 파일이 없으면 빌드를 멈춘다.
 */
export function getArticleImages(article: Pick<ArticleDetail, 'title' | 'body'>): ArticleImage[] {
  return [...article.body.matchAll(/!\[([^\]]*)\]\((\/images\/[^)\s]+)\)/g)].map((match, i) => {
    const [, caption, src] = match;
    const size = imageSizes[src];
    if (!size) throw new Error(`아티클 이미지가 없습니다: public${src}`);
    return {
      src,
      alt: caption || site.articleDetail.imageAlt(article.title, i + 1),
      caption,
      ...size,
      offset: match.index,
    };
  });
}

/** 목록 한 쪽에 보이는 카드 수 (1쪽은 Pinned 포함) */
export const ARTICLES_PER_PAGE = 7;
/** Pinned로 올릴 수 있는 최대 글 수 */
export const MAX_PINNED_ARTICLES = 7;

/** 목록 n쪽 주소 — 1쪽은 /articles, 나머지는 /articles/page/n */
export function getArticlePageHref(page: number): string {
  return page === 1 ? '/articles' : `/articles/page/${page}`;
}

/** URL의 쪽 번호("2")를 숫자로 — 0으로 시작하거나 숫자가 아니면 undefined */
export function parseArticlePage(value: string): number | undefined {
  return /^[1-9]\d*$/.test(value) ? Number(value) : undefined;
}

/**
 * 목록 n쪽 구성 — 원칙은 docs/design-system.md '쪽 나누기 원칙'.
 * 1쪽: Pinned(최신순, 최대 7편) + 날짜순 글로 남은 자리 채움. 2쪽부터: 날짜순 이어서 perPage개씩.
 * 고정 글은 날짜순 목록에서 빼지 않는다. 없는 쪽이면 undefined.
 * articles는 날짜순으로 정렬된 상태로 받는다(getArticles).
 */
export function getArticleListPage<T extends { pinned: boolean }>(
  articles: T[],
  page: number,
  perPage = ARTICLES_PER_PAGE,
): { pinned: T[]; items: T[]; totalPages: number } | undefined {
  const pinned = articles.filter((article) => article.pinned);
  if (pinned.length > MAX_PINNED_ARTICLES) {
    throw new Error(`Pinned 아티클은 최대 ${MAX_PINNED_ARTICLES}편입니다 (지금 ${pinned.length}편)`);
  }
  const firstPageSlots = perPage - pinned.length;
  const rest = Math.max(0, articles.length - firstPageSlots);
  const totalPages = 1 + Math.ceil(rest / perPage);
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return undefined;

  if (page === 1) return { pinned, items: articles.slice(0, firstPageSlots), totalPages };
  const start = firstPageSlots + (page - 2) * perPage;
  return { pinned: [], items: articles.slice(start, start + perPage), totalPages };
}
