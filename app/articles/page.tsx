import type { Metadata } from 'next';
import { site } from '@/content/site';
import { getArticles, paginateArticles } from '@/lib/articles';
import { ArticleIndex } from '@/components/article/ArticleIndex';
import { ArticleList } from '@/components/article/ArticleList';
import { ArticlePagination } from '@/components/article/ArticlePagination';

export const metadata: Metadata = {
  title: site.pages.articles.title,
  description: site.pages.articles.description,
};

export default function ArticlesPage() {
  const { items, totalPages } = paginateArticles(getArticles(), 1)!;

  return (
    <ArticleIndex>
      <ArticleList articles={items} />
      <ArticlePagination page={1} totalPages={totalPages} />
    </ArticleIndex>
  );
}
