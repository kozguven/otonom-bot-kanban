import { afterEach, beforeEach, expect, test } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { isValidBoard, loadBoard, saveBoard } from '../server/store.js'
import { createEmptyBoard } from '../src/lib/board.js'

let dir

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'kanban-store-'))
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

test('dosya yoksa loadBoard boş board döner', async () => {
  const board = await loadBoard(join(dir, 'yok.json'))
  expect(board).toEqual(createEmptyBoard())
})

test('saveBoard sonrası loadBoard aynı veriyi döner', async () => {
  const filePath = join(dir, 'board.json')
  const board = createEmptyBoard()
  board.columns[0].cards.push({ id: 'k1', title: 'İlk kart' })

  await saveBoard(filePath, board)
  const loaded = await loadBoard(filePath)

  expect(loaded).toEqual(board)
})

test('saveBoard eksik klasörleri oluşturur', async () => {
  const filePath = join(dir, 'a', 'b', 'board.json')
  await saveBoard(filePath, createEmptyBoard())

  const raw = await readFile(filePath, 'utf8')
  expect(JSON.parse(raw)).toEqual(createEmptyBoard())
})

test('bozuk JSON dosyası için loadBoard hata fırlatır', async () => {
  const filePath = join(dir, 'board.json')
  await writeFile(filePath, '{bozuk', 'utf8')

  await expect(loadBoard(filePath)).rejects.toThrow('geçerli JSON değil')
})

test('biçimi bozuk board için loadBoard hata fırlatır', async () => {
  const filePath = join(dir, 'board.json')
  await writeFile(filePath, JSON.stringify({ columns: 'yanlış' }), 'utf8')

  await expect(loadBoard(filePath)).rejects.toThrow('beklenen biçimde değil')
})

test('saveBoard geçersiz veriyi reddeder ve dosya yazmaz', async () => {
  const filePath = join(dir, 'board.json')

  await expect(saveBoard(filePath, { columns: null })).rejects.toThrow('Geçersiz board')
  await expect(loadBoard(filePath)).resolves.toEqual(createEmptyBoard())
})

test('isValidBoard geçerli ve geçersiz biçimleri ayırt eder', () => {
  expect(isValidBoard(createEmptyBoard())).toBe(true)
  expect(isValidBoard(null)).toBe(false)
  expect(isValidBoard({})).toBe(false)
  expect(isValidBoard({ columns: [{ id: 'x', title: 'X', cards: null }] })).toBe(false)
})
