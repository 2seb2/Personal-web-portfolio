import Link from 'next/link';
import { site } from '@/content/site';
import { formatArticleDate } from '@/lib/articles';
import { Tag } from '@/components/ui/Tag';
import type { Article } from '@/types/content';

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  );
}

/** 가로형 카드 하나. pinned면 날짜 앞에 '📌 Pinned ·' */
function ArticleCard({ article, pinned = false }: { article: Article; pinned?: boolean }) {
  return (
    <li>
      <Link
        href={`/articles/${article.id}`}
        className="flex flex-col gap-2 rounded-card border border-line bg-surface px-6.5 py-6 transition-[background-color,border-color,box-shadow] duration-200 hover:border-brand hover:bg-brand/8 hover:shadow-md"
      >
        <p className="flex items-center gap-1 type-mono-xs text-fg-secondary">
          {pinned && (
            <>
              <PinIcon />
              <span>{site.articleList.pinned}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
        </p>
        <h2 className="type-heading-md text-fg">{article.title}</h2>
        <p className="type-body-sm text-fg-secondary">{article.excerpt}</p>
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {article.kinds.map((kind) => (
            <Tag key={`kind-${kind}`} label={kind} tone="neutral" />
          ))}
          {article.stacks.map((stack) => (
            <Tag key={`stack-${stack}`} label={stack} />
          ))}
        </div>
      </Link>
    </li>
  );
}

type ArticleListProps = {
  /** 1쪽 맨 앞 고정 글 — 다른 쪽에서는 빈 배열 */
  pinned: Article[];
  /** 날짜순 목록의 이 쪽 몫 */
  articles: Article[];
};

/**
 * 아티클 목록 — 열 폭 전체를 쓰는 가로형 카드를 세로로 쌓는다. 호버는 프로젝트 카드와 같은 연한 주황.
 * Pinned 묶음과 날짜순 목록 사이는 간격만 넓힌다(14 → 28).
 */
export function ArticleList({ pinned, articles }: ArticleListProps) {
  return (
    <>
      {pinned.length > 0 && (
        <ul className="flex flex-col gap-3.5 pt-6.5">
          {pinned.map((article) => (
            <ArticleCard key={article.id} article={article} pinned />
          ))}
        </ul>
      )}
      {/* 고정 글이 7편이면 1쪽에는 날짜순 글이 없다 */}
      {articles.length > 0 && (
        <ul className={`flex flex-col gap-3.5 ${pinned.length > 0 ? 'pt-7' : 'pt-6.5'}`}>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </ul>
      )}
    </>
  );
}
