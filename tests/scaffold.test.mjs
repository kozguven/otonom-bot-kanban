import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

test('index.html uygulama kök elemanını ve giriş modülünü içerir', async () => {
  const html = await readFile(new URL('index.html', `file://${root}`), 'utf8')
  assert.match(html, /<div id="root">/)
  assert.match(html, /src\/main\.jsx/)
})

test('App bileşeni tanımlı', async () => {
  const app = await readFile(new URL('src/App.jsx', `file://${root}`), 'utf8')
  assert.match(app, /export default function App/)
})
