import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/content/site';
import { formatArticleDate, getArticles } from '@/lib/articles';
import { Tag } from '@/components/ui/Tag';

export const metadata: Metadata = {
  title: site.pages.articles.title,
  description: site.pages.articles.description,
};

export default function ArticlesPage() {
  const articles = getArticles();

  return (
    <div className="mx-auto flex w-full max-w-242 flex-col gap-14 px-6 pt-20 pb-30 md:px-14 md:pt-30 md:pb-40">
      <div className="flex flex-col gap-3">
        <h1 className="type-display-lg text-fg">{site.pages.articles.title}</h1>
        <p className="type-body-lg text-fg-secondary">{site.pages.articles.description}</p>
      </div>
      <div className="grid grid-cols-1 gap-5.5 pt-6.5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.id}`}
            className="flex flex-col rounded-card border border-line bg-surface p-5.5"
          >
            <p className="type-body-sm-strong text-fg">{article.title}</p>
            <p className="type-mono-xs mt-1 text-fg-secondary">{formatArticleDate(article.date)}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {article.kinds.map((kind) => (
                <Tag key={`kind-${kind}`} label={kind} tone="neutral" />
              ))}
              {article.stacks.map((stack) => (
                <Tag key={`stack-${stack}`} label={stack} />
              ))}
            </div>
            <p className="type-body-sm mt-4 text-fg-strong">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
