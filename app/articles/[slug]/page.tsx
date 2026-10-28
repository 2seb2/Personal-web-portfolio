import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { formatArticleYear, getArticle, getArticleImages, getArticles } from '@/lib/articles';
import { ArticleBody } from '@/components/article/ArticleBody';
import { Tag } from '@/components/ui/Tag';
import { LightboxProvider } from '@/features/lightbox/LightboxProvider';

export function generateStaticParams() {
  return getArticles().map((article) => ({ slug: article.id }));
}

export async function generateMetadata({ params }: PageProps<'/articles/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default function ArticleDetailPage({ params }: PageProps<'/articles/[slug]'>) {
  return (
    <div className="mx-auto flex w-full max-w-242 flex-col items-center px-6 pt-12 pb-11 md:px-14">
      <div className="w-full max-w-205">
        <Link href="/articles" className="type-mono-sm text-fg-secondary">
          {site.articleDetail.back}
        </Link>

        <Suspense>
          <ArticleDetailContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function ArticleDetailContent({ params }: Pick<PageProps<'/articles/[slug]'>, 'params'>) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const images = getArticleImages(article);

  return (
    <LightboxProvider images={images} labels={site.articleDetail.gallery}>
      <div className="flex flex-col pt-10 pb-9">
        <p className="type-mono-sm text-brand-text">{formatArticleYear(article.date)}</p>
        <h1 className="type-display-lg mt-3.5 text-fg">{article.title}</h1>
        <div className="mt-4.5 flex flex-wrap gap-1.5">
          {article.kinds.map((kind) => (
            <Tag key={`kind-${kind}`} label={kind} tone="neutral" />
          ))}
          {article.stacks.map((stack) => (
            <Tag key={`stack-${stack}`} label={stack} />
          ))}
        </div>
      </div>

      <div className="border-t border-line pt-11 pb-11">
        <ArticleBody body={article.body} images={images} />
      </div>
    </LightboxProvider>
  );
}
