import { test, expect, type Page } from '@playwright/test';

// 아티클 본문 이미지 라이트박스. React Native(article4): 본문 이미지 18장, 모두 캡션 없음
const PATH = '/articles/article4';
const TOTAL = 18;

const dialog = (page: Page) => page.getByRole('dialog', { name: '아티클 이미지 크게 보기' });
const trigger = (page: Page, index: number) => page.locator(`#project-image-${index}`);

test('본문 이미지를 누르면 Article Gallery가 그 이미지부터 열리고, 닫으면 포커스가 돌아온다', async ({ page }) => {
  await page.goto(PATH);
  await trigger(page, 2).scrollIntoViewIfNeeded();
  await expect(trigger(page, 2)).toHaveCSS('cursor', 'zoom-in');
  await expect(trigger(page, 2)).toHaveAccessibleName('React Native 본문 이미지 3 — 크게 보기');

  await trigger(page, 2).click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page).getByText(/Article Gallery/)).toBeVisible();
  await expect(dialog(page).getByText(`/ ${TOTAL}`)).toBeVisible();
  await expect(dialog(page).locator('[aria-current="true"]')).toHaveAccessibleName(/^3번째 이미지/);

  await page.keyboard.press('Escape');
  await expect(dialog(page)).toHaveCount(0);
  await expect(trigger(page, 2)).toBeFocused();
});
