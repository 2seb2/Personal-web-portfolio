import Link from 'next/link';
import { site } from '@/content/site';
import { getArticlePageHref } from '@/lib/articles';

type ArticlePaginationProps = {
  page: number;
  totalPages: number;
};

const text = site.articleList;

function ChevronIcon({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={dir === 'prev' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  );
}

/** ‹ 이전 · 쪽 번호 · 다음 › — 첫·마지막 쪽에서는 이전·다음이 흐린 글자로 남는다 */
function Step({ dir, target }: { dir: 'prev' | 'next'; target?: number }) {
  const label = dir === 'prev' ? text.prev : text.next;
  const content = (
    <>
      {dir === 'prev' && <ChevronIcon dir="prev" />}
      {label}
      {dir === 'next' && <ChevronIcon dir="next" />}
    </>
  );
  const className = 'flex h-9 items-center gap-0.5 rounded-pill px-2.5 type-body-sm-medium';

  if (target === undefined) {
    return (
      <span aria-disabled="true" className={`${className} text-fg-placeholder`}>
        {content}
      </span>
    );
  }
  return (
    <Link
      href={getArticlePageHref(target)}
      rel={dir}
      className={`${className} text-fg-secondary transition-colors duration-180 ease-out hover:text-fg`}
    >
      {content}
    </Link>
  );
}

export function ArticlePagination({ page, totalPages }: ArticlePaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label={text.pagination} className="flex items-center justify-center gap-1 pt-12">
      <Step dir="prev" target={page > 1 ? page - 1 : undefined} />
      {pages.map((n) =>
        n === page ? (
          <span
            key={n}
            aria-current="page"
            aria-label={text.page(n)}
            className="flex size-9 items-center justify-center rounded-pill bg-inverse type-body-sm-medium text-fg-inverse"
          >
            {n}
          </span>
        ) : (
          <Link
            key={n}
            href={getArticlePageHref(n)}
            aria-label={text.page(n)}
            className="flex size-9 items-center justify-center rounded-pill type-body-sm-medium text-fg-secondary transition-colors duration-180 ease-out hover:text-fg"
          >
            {n}
          </Link>
        ),
      )}
      <Step dir="next" target={page < totalPages ? page + 1 : undefined} />
    </nav>
  );
}
