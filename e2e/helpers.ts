import { expect, type Page } from '@playwright/test';

export const ACCOUNTS = {
  student: 'olga@mail.ru',
  tutor: 'anastasia@toprepet.ru',
  admin: 'admin@toprepet.ru',
} as const;

/** Вход под учётной записью из тестовой базы (пароль у всех «demo»). */
export async function login(page: Page, role: keyof typeof ACCOUNTS | string) {
  const email = role in ACCOUNTS ? ACCOUNTS[role as keyof typeof ACCOUNTS] : role;
  await page.goto('/login');
  await page.locator('input[type=email]').fill(email);
  await page.locator('input[type=password]').fill('demo');
  await page.locator('button[type=submit]').click();
  await expect(page).not.toHaveURL(/\/login/);
}


export const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1440) < 600;

/** Горизонтальной прокрутки быть не должно ни на одном экране. */
export async function expectNoHorizontalScroll(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, 'страница шире экрана').toBeLessThanOrEqual(0);
}
