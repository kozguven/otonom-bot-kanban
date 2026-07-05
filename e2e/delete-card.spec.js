import { test, expect } from '@playwright/test'

test('kart silinir, listeden kalkar ve yenilemeden sonra geri gelmez', async ({ page }) => {
  await page.goto('/')

  const todo = page.getByRole('region', { name: 'Yapılacak' })
  await todo.getByLabel('Yapılacak kolonuna yeni kart').fill('Silinecek kart')
  await todo.getByRole('button', { name: 'Ekle' }).click()
  await todo.getByLabel('Yapılacak kolonuna yeni kart').fill('Kalacak kart')
  await todo.getByRole('button', { name: 'Ekle' }).click()
  await expect(todo.getByText('Silinecek kart')).toBeVisible()
  await expect(todo.getByText('Kalacak kart')).toBeVisible()

  await todo
    .locator('li', { hasText: 'Silinecek kart' })
    .getByRole('button', { name: 'Sil' })
    .click()

  await expect(todo.getByText('Silinecek kart')).toBeHidden()
  await expect(todo.getByText('Kalacak kart')).toBeVisible()

  await page.reload()
  const todoAfterReload = page.getByRole('region', { name: 'Yapılacak' })
  await expect(todoAfterReload.getByText('Kalacak kart')).toBeVisible()
  await expect(todoAfterReload.getByText('Silinecek kart')).toBeHidden()

  await page.screenshot({ path: 'artifacts/delete-card.png', fullPage: true })
})
