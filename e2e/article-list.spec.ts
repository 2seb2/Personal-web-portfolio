import { test, expect, type Page } from '@playwright/test';

// 아티클 목록: 18편을 8개씩 → 1쪽 8, 2쪽 8, 3쪽 2
// Next가 이전 화면을 display:none으로 남겨 두므로(Activity) 보이는 카드만 센다
const cards = (page: Page) => page.locator('main ul > li > a[href^="/articles/article"]:visible');
const pager = (page: Page) => page.getByRole('navigation', { name: '아티클 목록 쪽' });

test('쪽마다 8개씩 보이고, 이전·다음과 쪽 번호로 이동한다', async ({ page }) => {
  await page.goto('/articles');
  await expect(cards(page)).toHaveCount(8);
  await expect(pager(page).locator('[aria-current="page"]')).toHaveText('1');
  await expect(pager(page).getByText('이전')).toHaveAttribute('aria-disabled', 'true');

  await pager(page).getByRole('link', { name: '다음' }).click();
  await expect(page).toHaveURL('/articles/page/2');
  await expect(cards(page)).toHaveCount(8);
  await expect(pager(page).locator('[aria-current="page"]')).toHaveText('2');

  await pager(page).getByRole('link', { name: '3쪽' }).click();
  await expect(page).toHaveURL('/articles/page/3');
  await expect(cards(page)).toHaveCount(2);
  await expect(pager(page).getByText('다음')).toHaveAttribute('aria-disabled', 'true');

  await pager(page).getByRole('link', { name: '1쪽' }).click();
  await expect(page).toHaveURL('/articles');
});

test('최신 글이 맨 위에 오고, 카드를 누르면 상세로 간다', async ({ page }) => {
  await page.goto('/articles');
  const first = cards(page).first();
  await expect(first.locator('time')).toHaveAttribute('dateTime', '2026-05-13');
  await first.click();
  await expect(page).toHaveURL('/articles/article17');
});

// Suspense 안의 notFound()는 스트리밍 뒤라 상태 코드가 200으로 남는다 — 404 화면과 noindex로 확인
test('없는 쪽과 /articles/page/1은 404 화면', async ({ page }) => {
  for (const path of ['/articles/page/1', '/articles/page/4', '/articles/page/abc']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first(), path).toBeAttached();
    await expect(cards(page), path).toHaveCount(0);
  }
});
