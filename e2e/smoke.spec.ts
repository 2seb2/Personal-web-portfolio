import { test, expect } from "@playwright/test";

// 0단계 플레이스홀더. 4단계에서 hero-spec.md 12장 시나리오로 교체한다.
test("dev 서버가 응답한다", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
});
