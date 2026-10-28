import Link from 'next/link';
import { formatArticleDate } from '@/lib/articles';
import { Tag } from '@/components/ui/Tag';
import type { Article } from '@/types/content';

/** 아티클 목록 — 열 폭 전체를 쓰는 가로형 카드를 세로로 쌓는다. 호버는 프로젝트 카드와 같은 연한 주황 */
export function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <ul className="flex flex-col gap-3.5 pt-6.5">
      {articles.map((article) => (
        <li key={article.id}>
          <Link
            href={`/articles/${article.id}`}
            className="flex flex-col gap-2 rounded-card border border-line bg-surface px-6.5 py-6 transition-[background-color,border-color,box-shadow] duration-200 hover:border-brand hover:bg-brand/8 hover:shadow-md"
          >
            <time dateTime={article.date} className="type-mono-xs text-fg-secondary">
              {formatArticleDate(article.date)}
            </time>
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
      ))}
    </ul>
  );
}
