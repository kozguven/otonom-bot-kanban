import { test, expect } from 'vitest'
import { readFile } from 'node:fs/promises'

const root = new URL('..', import.meta.url)

test('index.html uygulama kök elemanını ve giriş modülünü içerir', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8')
  expect(html).toMatch(/<div id="root">/)
  expect(html).toMatch(/src\/main\.jsx/)
})

test('App bileşeni tanımlı', async () => {
  const app = await readFile(new URL('src/App.jsx', root), 'utf8')
  expect(app).toMatch(/export default function App/)
})
