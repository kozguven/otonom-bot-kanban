import { test, expect } from '@playwright/test'

test('yeni kart eklenir, kolonda görünür ve yenilemeden sonra kalır', async ({ page }) => {
  await page.goto('/')

  const todo = page.getByRole('region', { name: 'Yapılacak' })
  await todo.getByLabel('Yapılacak kolonuna yeni kart').fill('Playwright ile eklenen kart')
  await todo.getByRole('button', { name: 'Ekle' }).click()

  await expect(todo.getByText('Playwright ile eklenen kart')).toBeVisible()
  await expect(todo.getByLabel('Yapılacak kolonuna yeni kart')).toHaveValue('')

  await page.reload()
  await expect(
    page.getByRole('region', { name: 'Yapılacak' }).getByText('Playwright ile eklenen kart'),
  ).toBeVisible()

  await page.screenshot({ path: 'artifacts/add-card.png', fullPage: true })
})
