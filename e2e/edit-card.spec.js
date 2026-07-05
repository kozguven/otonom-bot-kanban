import { test, expect } from '@playwright/test'

test('kart düzenlenir, yeni başlık görünür ve yenilemeden sonra kalır', async ({ page }) => {
  await page.goto('/')

  const todo = page.getByRole('region', { name: 'Yapılacak' })
  await todo.getByLabel('Yapılacak kolonuna yeni kart').fill('Düzenlenecek kart')
  await todo.getByRole('button', { name: 'Ekle' }).click()
  await expect(todo.getByText('Düzenlenecek kart')).toBeVisible()

  await todo.getByRole('button', { name: 'Düzenle' }).click()
  const input = todo.getByLabel('Kart başlığını düzenle')
  await expect(input).toHaveValue('Düzenlenecek kart')
  await input.fill('Playwright ile düzenlenen kart')
  await todo.getByRole('button', { name: 'Kaydet' }).click()

  await expect(todo.getByText('Playwright ile düzenlenen kart')).toBeVisible()
  await expect(todo.getByText('Düzenlenecek kart')).toBeHidden()

  await page.reload()
  const todoAfterReload = page.getByRole('region', { name: 'Yapılacak' })
  await expect(todoAfterReload.getByText('Playwright ile düzenlenen kart')).toBeVisible()
  await expect(todoAfterReload.getByText('Düzenlenecek kart')).toBeHidden()

  await page.screenshot({ path: 'artifacts/edit-card.png', fullPage: true })
})
