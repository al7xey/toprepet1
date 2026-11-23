import { expect, test } from '@playwright/test';
import { login, expectNoHorizontalScroll } from './helpers';

test('new workspace: lesson search and keyboard tabs', async ({ page }) => {
  await login(page, 'student');
  await page.goto('/me/lessons');
  await expect(page.getByRole('searchbox', { name: 'Найти занятие' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Найти занятие' }).fill('несуществующий предмет');
  await expect(page.getByText('Занятия не найдены', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Сбросить поиск' }).click();
  await expect(page.getByRole('searchbox', { name: 'Найти занятие' })).toHaveValue('');
  await page.getByRole('tab', { name: 'Предстоящие' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Прошедшие' })).toHaveAttribute('aria-selected', 'true');
  await expectNoHorizontalScroll(page);
});

test('help search recovers from empty results', async ({ page }) => {
  await page.goto('/help');
  const search = page.getByRole('searchbox', { name: 'Поиск по помощи' });
  await search.fill('несуществующий запрос');
  await expect(page.getByText('Ответ не найден', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Все вопросы' }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('details').first()).toBeVisible();
});
