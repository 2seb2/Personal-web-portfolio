import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getArticles, paginateArticles, parseArticlePage } from '@/lib/articles';
import { ArticleIndex } from '@/components/article/ArticleIndex';
import { ArticleList } from '@/components/article/ArticleList';
import { ArticlePagination } from '@/components/article/ArticlePagination';

/** 2쪽부터 — 1쪽은 /articles */
export function generateStaticParams() {
  const { totalPages } = paginateArticles(getArticles(), 1)!;
  return Array.from({ length: totalPages - 1 }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: PageProps<'/articles/page/[page]'>): Promise<Metadata> {
  const page = parseArticlePage((await params).page);
  if (!page) return {};
  return {
    title: site.articleList.pageTitle(page),
    description: site.pages.articles.description,
  };
}

export default function ArticlesPagedPage({ params }: PageProps<'/articles/page/[page]'>) {
  return (
    <ArticleIndex>
      <Suspense>
        <ArticlesPageContent params={params} />
      </Suspense>
    </ArticleIndex>
  );
}

async function ArticlesPageContent({ params }: Pick<PageProps<'/articles/page/[page]'>, 'params'>) {
  const page = parseArticlePage((await params).page);
  // 1쪽은 /articles 하나만 둔다
  const result = page && page > 1 ? paginateArticles(getArticles(), page) : undefined;

  if (!page || !result) {
    notFound();
  }

  return (
    <>
      <ArticleList articles={result.items} />
      <ArticlePagination page={page} totalPages={result.totalPages} />
    </>
  );
}
