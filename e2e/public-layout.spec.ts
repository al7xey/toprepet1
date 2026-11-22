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


test('у каталога один поиск, у навигации круглая подсветка, а кнопки главной ограничены по ширине', async ({ page, isMobile }) => {
  await page.goto('/teachers');
  await expect(page.getByRole('searchbox')).toHaveCount(1);
  await expect(page.getByText('Подобрать по учебной цели')).toHaveCount(0);
  if (!isMobile) {
    const nav = page.getByRole('navigation', { name: 'Основная навигация' });
    const target = nav.getByRole('link', { name: 'Блог' });
    await target.hover();
    await expect(target).toHaveCSS('border-top-left-radius', '999px');
    await expect(target).toHaveCSS('background-color', 'rgb(255, 243, 236)');
  }
  await page.goto('/');
  const action = page.getByRole('link', { name: 'Бесплатное знакомство', exact: true });
  await expect(action).toBeVisible();
  const width = await action.boundingBox();
  if (!isMobile) expect(width!.width).toBeLessThan(400);
  await expectNoHorizontalScroll(page);
});
