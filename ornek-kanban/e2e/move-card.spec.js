import { test, expect } from '@playwright/test'

test('kart başka kolona sürüklenir ve yenilemeden sonra yeni yerinde kalır', async ({ page }) => {
  await page.goto('/')

  const todo = page.getByRole('region', { name: 'Yapılacak' })
  const inProgress = page.getByRole('region', { name: 'Yapılıyor' })

  await todo.getByLabel('Yapılacak kolonuna yeni kart').fill('Taşınacak kart')
  await todo.getByRole('button', { name: 'Ekle', exact: true }).click()
  await expect(todo.getByText('Taşınacak kart')).toBeVisible()

  // dnd-kit PointerSensor 5px hareketten sonra devreye girer; adım adım fare hareketiyle sürükle
  const handle = todo.getByRole('button', { name: 'Kartı taşı: Taşınacak kart' })
  const dropTarget = inProgress.getByText('Henüz kart yok')
  const handleBox = await handle.boundingBox()
  const targetBox = await dropTarget.boundingBox()

  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { steps: 15 },
  )
  await page.mouse.up()

  await expect(inProgress.getByText('Taşınacak kart')).toBeVisible()
  await expect(todo.getByText('Taşınacak kart')).toBeHidden()

  await page.reload()
  await expect(
    page.getByRole('region', { name: 'Yapılıyor' }).getByText('Taşınacak kart'),
  ).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Yapılacak' }).getByText('Taşınacak kart'),
  ).toBeHidden()

  await page.screenshot({ path: 'artifacts/move-card.png', fullPage: true })
})
