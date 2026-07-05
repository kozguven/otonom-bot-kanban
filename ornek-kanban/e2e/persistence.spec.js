import { test, expect } from '@playwright/test'

// dnd-kit PointerSensor 5px hareketten sonra devreye girer; adım adım fare hareketiyle sürükle.
// Hedef kolon boşsa "Henüz kart yok" alanına, doluysa son kartın üzerine bırakır.
async function dragCardToColumn(page, sourceColumn, targetColumn, cardTitle) {
  const handle = sourceColumn.getByRole('button', { name: `Kartı taşı: ${cardTitle}` })

  const emptyArea = targetColumn.getByText('Henüz kart yok')
  const dropTarget = (await emptyArea.count()) > 0 ? emptyArea : targetColumn.locator('li').last()

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
}

test('uçtan uca: kart ekle, kolonlar arası taşı, yenile, kart yeni yerinde kalır', async ({ page }) => {
  await page.goto('/')

  const todo = page.getByRole('region', { name: 'Yapılacak' })
  const inProgress = page.getByRole('region', { name: 'Yapılıyor' })
  const done = page.getByRole('region', { name: 'Bitti' })
  const cardTitle = 'Uçtan uca kalıcılık kartı'

  // 1. Kart ekle
  await todo.getByLabel('Yapılacak kolonuna yeni kart').fill(cardTitle)
  await todo.getByRole('button', { name: 'Ekle', exact: true }).click()
  await expect(todo.getByText(cardTitle)).toBeVisible()

  // 2. Yapılacak → Yapılıyor
  await dragCardToColumn(page, todo, inProgress, cardTitle)
  await expect(inProgress.getByText(cardTitle)).toBeVisible()
  await expect(todo.getByText(cardTitle)).toBeHidden()

  // 3. Yapılıyor → Bitti
  await dragCardToColumn(page, inProgress, done, cardTitle)
  await expect(done.getByText(cardTitle)).toBeVisible()
  await expect(inProgress.getByText(cardTitle)).toBeHidden()

  // 4. Sayfayı yenile — kart API'ye kaydedildiği için Bitti kolonunda kalmalı
  await page.reload()
  await expect(page.getByRole('region', { name: 'Bitti' }).getByText(cardTitle)).toBeVisible()
  await expect(page.getByRole('region', { name: 'Yapılacak' }).getByText(cardTitle)).toBeHidden()
  await expect(page.getByRole('region', { name: 'Yapılıyor' }).getByText(cardTitle)).toBeHidden()

  await page.screenshot({ path: 'artifacts/e2e-persistence.png', fullPage: true })
})
