import { test, expect } from '@playwright/test'

test('ana sayfa yüklenir ve başlık görünür', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Kanban Board')
  await expect(page.getByRole('heading', { level: 1, name: 'Kanban Board' })).toBeVisible()
  await page.screenshot({ path: 'artifacts/smoke.png', fullPage: true })
})

test('board üç sabit kolonu API verisiyle render eder', async ({ page }) => {
  await page.goto('/')
  for (const title of ['Yapılacak', 'Yapılıyor', 'Bitti']) {
    await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible()
    await expect(page.getByRole('region', { name: title })).toBeVisible()
  }
  await page.screenshot({ path: 'artifacts/board-columns.png', fullPage: true })
})
