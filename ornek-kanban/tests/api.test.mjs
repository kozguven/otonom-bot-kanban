import { afterEach, beforeEach, expect, test } from 'vitest'
import { createServer } from 'node:http'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createBoardApiMiddleware } from '../server/api.js'
import { loadBoard } from '../server/store.js'
import { createEmptyBoard } from '../src/lib/board.js'

let dir
let server
let baseUrl

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'kanban-api-'))
  const middleware = createBoardApiMiddleware(join(dir, 'board.json'))
  server = createServer((req, res) =>
    middleware(req, res, () => {
      res.statusCode = 404
      res.end('fallback')
    }),
  )
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve))
  await rm(dir, { recursive: true, force: true })
})

test('GET /api/board dosya yokken boş board döner', async () => {
  const res = await fetch(`${baseUrl}/api/board`)

  expect(res.status).toBe(200)
  expect(res.headers.get('content-type')).toContain('application/json')
  expect(await res.json()).toEqual(createEmptyBoard())
})

test('PUT /api/board veriyi kaydeder ve GET aynı veriyi döner', async () => {
  const board = createEmptyBoard()
  board.columns[0].cards.push({ id: 'k1', title: 'İlk kart' })

  const putRes = await fetch(`${baseUrl}/api/board`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(board),
  })
  expect(putRes.status).toBe(200)
  expect(await putRes.json()).toEqual(board)

  const getRes = await fetch(`${baseUrl}/api/board`)
  expect(await getRes.json()).toEqual(board)

  await expect(loadBoard(join(dir, 'board.json'))).resolves.toEqual(board)
})

test('PUT /api/board bozuk JSON gövdesini 400 ile reddeder', async () => {
  const res = await fetch(`${baseUrl}/api/board`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: '{bozuk',
  })

  expect(res.status).toBe(400)
  const body = await res.json()
  expect(body.error).toBeTruthy()
})

test('PUT /api/board biçimi geçersiz board verisini 400 ile reddeder ve kaydetmez', async () => {
  const res = await fetch(`${baseUrl}/api/board`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ columns: 'yanlış' }),
  })

  expect(res.status).toBe(400)
  await expect(loadBoard(join(dir, 'board.json'))).resolves.toEqual(createEmptyBoard())
})

test('desteklenmeyen metod /api/board üzerinde 405 döner', async () => {
  const res = await fetch(`${baseUrl}/api/board`, { method: 'DELETE' })

  expect(res.status).toBe(405)
})

test('/api/board dışındaki istekler sonraki katmana geçer', async () => {
  const res = await fetch(`${baseUrl}/baska-yol`)

  expect(res.status).toBe(404)
  expect(await res.text()).toBe('fallback')
})
