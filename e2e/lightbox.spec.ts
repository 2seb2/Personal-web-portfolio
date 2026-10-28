import { test, expect, type Page } from '@playwright/test';

// 프로젝트 상세 이미지 라이트박스. 지켜줘홈즈: 대표 1 + 섹션 5 = 6장
const PATH = '/projects/jikyeojwo-homes';
const TOTAL = 6;

const dialog = (page: Page) => page.getByRole('dialog', { name: '프로젝트 이미지 크게 보기' });
const zoomLevel = (page: Page) => dialog(page).getByLabel('확대 비율 (화면 맞춤 크기 기준)');
const currentThumb = (page: Page) => dialog(page).locator('[aria-current="true"]');
const trigger = (page: Page, index: number) => page.locator(`#project-image-${index}`);

async function openAt(page: Page, index: number) {
  await trigger(page, index).scrollIntoViewIfNeeded();
  await trigger(page, index).click();
  await expect(dialog(page)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto(PATH);
});

test('본문 이미지는 zoom-in 커서이고, 누르면 그 이미지부터 열린다', async ({ page }) => {
  await expect(trigger(page, 2)).toHaveCSS('cursor', 'zoom-in');
  await openAt(page, 2);

  await expect(currentThumb(page)).toHaveAccessibleName(/^3번째 이미지/);
  await expect(dialog(page).getByText(`/ 0${TOTAL}`)).toBeVisible();
  await expect(zoomLevel(page)).toHaveText('100%');
});

test('열려 있는 동안 배경 스크롤을 막고, 닫으면 스크롤 위치가 그대로다', async ({ page }) => {
  await openAt(page, 3);
  const before = await page.evaluate(() => window.scrollY);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');

  await page.mouse.wheel(0, 800);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);

  await page.keyboard.press('Escape');
  await expect(dialog(page)).toHaveCount(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  // 연 이미지로 포커스가 돌아온다
  await expect(trigger(page, 3)).toBeFocused();
});

test('키보드 ←/→로 이동하고 처음·끝에서 멈춘다', async ({ page }) => {
  await openAt(page, 0);
  await page.keyboard.press('ArrowLeft');
  await expect(currentThumb(page)).toHaveAccessibleName(/^1번째 이미지/);

  for (let i = 0; i < TOTAL + 2; i++) await page.keyboard.press('ArrowRight');
  await expect(currentThumb(page)).toHaveAccessibleName(new RegExp(`^${TOTAL}번째 이미지`));
});

test('썸네일을 누르면 그 이미지로 간다', async ({ page }) => {
  await openAt(page, 0);
  await dialog(page).getByRole('button', { name: /^5번째 이미지/ }).click();
  await expect(currentThumb(page)).toHaveAccessibleName(/^5번째 이미지/);
});

test('이전/다음 버튼은 처음·끝에서 비활성화된다', async ({ page, isMobile }) => {
  test.skip(isMobile, '모바일은 좌우 버튼 대신 스와이프·썸네일');
  await openAt(page, 0);
  const prev = dialog(page).getByRole('button', { name: '이전 이미지' });
  const next = dialog(page).getByRole('button', { name: '다음 이미지' });

  await expect(prev).toBeDisabled();
  await next.click();
  await expect(currentThumb(page)).toHaveAccessibleName(/^2번째 이미지/);
  await expect(prev).toBeEnabled();

  await dialog(page).getByRole('button', { name: new RegExp(`^${TOTAL}번째 이미지`) }).click();
  await expect(next).toBeDisabled();
});

test('확대·축소·화면 맞춤, 다른 이미지로 가면 100%로 돌아간다', async ({ page }) => {
  await openAt(page, 1);
  const zoomIn = dialog(page).getByRole('button', { name: '확대', exact: true });
  const zoomOut = dialog(page).getByRole('button', { name: '축소' });
  const fit = dialog(page).getByRole('button', { name: '화면에 맞추기' });

  await expect(zoomOut).toBeDisabled();
  await expect(fit).toBeDisabled();
  await zoomIn.click();
  await expect(zoomLevel(page)).toHaveText('150%');
  await zoomIn.click();
  await expect(zoomLevel(page)).toHaveText('200%');
  await zoomOut.click();
  await expect(zoomLevel(page)).toHaveText('150%');
  await fit.click();
  await expect(zoomLevel(page)).toHaveText('100%');

  await zoomIn.click();
  await page.keyboard.press('ArrowRight');
  await expect(zoomLevel(page)).toHaveText('100%');
});

test('확대한 이미지는 끌어서 옮길 수 있고, 끌다 놓아도 닫히지 않는다', async ({ page, isMobile }) => {
  test.skip(isMobile, '마우스 드래그 시나리오');
  await openAt(page, 2);
  await dialog(page).getByRole('button', { name: '확대', exact: true }).click();
  await dialog(page).getByRole('button', { name: '확대', exact: true }).click();

  const img = dialog(page).getByRole('img', { name: /입력창 글자 크기/ });
  // 버튼 확대는 0.2s 동안 크기가 바뀐다 — 다 끝난 뒤 위치를 잰다
  await expect.poll(async () => (await img.boundingBox())!.width).toBeGreaterThan(page.viewportSize()!.width);
  await page.waitForTimeout(300);
  const before = await img.boundingBox();
  const box = before!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 150, box.y + box.height / 2 + 60, { steps: 8 });
  await page.mouse.up();

  const after = await img.boundingBox();
  // 가장자리에서 멈추므로 끈 거리(150)보다 적게 움직일 수 있다
  expect(after!.x).toBeGreaterThan(before!.x + 50);
  await expect(dialog(page)).toBeVisible();
});

test('이미지·툴바를 눌러도 닫히지 않고, 오버레이를 누르면 닫힌다', async ({ page }) => {
  await openAt(page, 0);
  await dialog(page).getByRole('img', { name: /지켜줘홈즈 서비스 화면/ }).click();
  await zoomLevel(page).click();
  await expect(dialog(page)).toBeVisible();

  // 이미지 아래 툴바 옆 빈 곳
  const viewport = page.viewportSize()!;
  await page.mouse.click(8, viewport.height - 8);
  await expect(dialog(page)).toHaveCount(0);
});

test('X 버튼으로 닫힌다', async ({ page }) => {
  await openAt(page, 0);
  await dialog(page).getByRole('button', { name: '닫기', exact: true }).click();
  await expect(dialog(page)).toHaveCount(0);
});

test('본문에서 보기: 닫고 지금 보던 이미지를 화면 가운데로 스크롤한다', async ({ page }) => {
  await openAt(page, 0);
  await dialog(page).getByRole('button', { name: /^5번째 이미지/ }).click();
  await dialog(page).getByRole('button', { name: '본문에서 보기' }).click();
  await expect(dialog(page)).toHaveCount(0);

  const target = trigger(page, 4);
  await expect(target).toBeFocused();
  await expect
    .poll(async () => {
      const box = await target.boundingBox();
      const viewport = page.viewportSize()!;
      return Math.abs(box!.y + box!.height / 2 - viewport.height / 2);
    })
    .toBeLessThan(4);
});
