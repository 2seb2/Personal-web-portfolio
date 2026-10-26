import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getArticles } from '@/lib/articles';
import { Tag } from '@/components/ui/Tag';

export const metadata: Metadata = {
  title: site.pages.articles.title,
  description: site.pages.articles.description,
};

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="mx-auto flex w-full max-w-242 flex-col gap-14 px-6 pt-20 pb-30 md:px-14 md:pt-30 md:pb-40">
      <div className="flex flex-col gap-3">
        <h1 className="type-display-lg text-fg">{site.pages.articles.title}</h1>
        <p className="type-body-lg text-fg-secondary">{site.pages.articles.description}</p>
      </div>
      <div className="grid grid-cols-1 gap-5.5 pt-6.5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => {
          const cardClassName = 'flex flex-col rounded-card border border-line bg-surface p-5.5';
          const content = (
            <>
              <p className="type-body-sm-strong text-fg">{article.title}</p>
              <p className="type-mono-xs mt-1 text-fg-secondary">{article.date}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
              <p className="type-body-sm mt-4 text-fg-strong">{article.excerpt}</p>
            </>
          );

          return article.href ? (
            <a key={article.id} href={article.href} className={cardClassName}>
              {content}
            </a>
          ) : (
            <div key={article.id} className={cardClassName}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
