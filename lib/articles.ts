import { articlesMock } from '@/content/articles.mock';
import type { Article } from '@/types/content';

/** 지금은 목데이터를 그대로 반환. 노션 연동 시 이 함수 내부만 교체 (반환 타입은 그대로 유지) */
export async function getArticles(): Promise<Article[]> {
  return articlesMock;
}
