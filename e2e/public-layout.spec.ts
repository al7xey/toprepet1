import { expect, test } from '@playwright/test';
import { expectNoHorizontalScroll } from './helpers';

test('вход, регистрация и каталог помещаются в окно', async ({ page }) => {
  for (const path of ['/login', '/signup', '/teachers', '/for-repetitor']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);
  }
  await page.goto('/teachers');
  await page.getByRole('button', { name: 'Фильтры', exact: true }).click();
  await expect(page.getByText('Бесплатное знакомство', { exact: true })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test('на компактном ПК иллюстрация и обе кнопки видны рядом с заголовком', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Настольная раскладка');
  for (const width of [800, 1024, 1280]) {
    await page.setViewportSize({ width, height: 750 });
    await page.goto('/');
    const hero = page.locator('.trh-hero').first();
    const illustration = hero.locator('.trh-hero-media');
    const first = hero.getByRole('link', { name: 'Найти репетитора', exact: true });
    const second = hero.getByRole('link', { name: 'Создать заявку', exact: true });
    await expect(first).toBeVisible();
    await expect(second).toBeVisible();
    const [a, b, media] = await Promise.all([first.boundingBox(), second.boundingBox(), illustration.boundingBox()]);
    expect(a!.x + a!.width).toBeLessThanOrEqual(b!.x);
    expect(b!.x + b!.width).toBeLessThan(media!.x);
    expect(a!.height).toBe(b!.height);
    await expectNoHorizontalScroll(page);
  }
});
