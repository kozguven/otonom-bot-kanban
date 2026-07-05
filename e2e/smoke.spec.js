import { test, expect } from '@playwright/test'

test('ana sayfa yüklenir ve başlık görünür', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Kanban Board')
  await expect(page.getByRole('heading', { level: 1, name: 'Kanban Board' })).toBeVisible()
  await page.screenshot({ path: 'artifacts/smoke.png', fullPage: true })
})
