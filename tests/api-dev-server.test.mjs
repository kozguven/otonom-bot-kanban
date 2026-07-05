import { afterEach, beforeEach, expect, test } from 'vitest'
import { createServer } from 'vite'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createEmptyBoard } from '../src/lib/board.js'

let dir
let server
let baseUrl

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'kanban-dev-api-'))
  process.env.BOARD_FILE = join(dir, 'board.json')
  server = await createServer({
    configFile: new URL('../vite.config.js', import.meta.url).pathname,
    logLevel: 'silent',
    server: { port: 0, host: '127.0.0.1' },
  })
  await server.listen()
  baseUrl = `http://127.0.0.1:${server.config.server.port || server.httpServer.address().port}`
})

afterEach(async () => {
  delete process.env.BOARD_FILE
  await server.close()
  await rm(dir, { recursive: true, force: true })
})

test('vite dev sunucusu /api/board GET ve PUT uçlarını sunar', async () => {
  const getRes = await fetch(`${baseUrl}/api/board`)
  expect(getRes.status).toBe(200)
  expect(await getRes.json()).toEqual(createEmptyBoard())

  const board = createEmptyBoard()
  board.columns[1].cards.push({ id: 'k1', title: 'Dev sunucu kartı' })

  const putRes = await fetch(`${baseUrl}/api/board`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(board),
  })
  expect(putRes.status).toBe(200)

  const afterRes = await fetch(`${baseUrl}/api/board`)
  expect(await afterRes.json()).toEqual(board)
})

test('vite dev sunucusu ana sayfayı sunmaya devam eder', async () => {
  const res = await fetch(`${baseUrl}/`)
  expect(res.status).toBe(200)
  expect(await res.text()).toContain('<div id="root">')
})
