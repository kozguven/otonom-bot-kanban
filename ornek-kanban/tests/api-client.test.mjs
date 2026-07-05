import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { fetchBoard, saveBoard } from '../src/lib/api.js'
import { createEmptyBoard } from '../src/lib/board.js'

function jsonResponse(payload, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: () => Promise.resolve(payload),
  }
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

test('fetchBoard API uçtan board verisini GET ile alır', async () => {
  const board = createEmptyBoard()
  fetch.mockResolvedValue(jsonResponse(board))

  const result = await fetchBoard()

  expect(fetch).toHaveBeenCalledWith('/api/board')
  expect(result).toEqual(board)
})

test('fetchBoard sunucu hatasında sunucunun mesajıyla fırlatır', async () => {
  fetch.mockResolvedValue(
    jsonResponse({ error: 'Board dosyası bozuk' }, { ok: false, status: 500 }),
  )

  await expect(fetchBoard()).rejects.toThrow('Board dosyası bozuk')
})

test('fetchBoard hata gövdesi JSON değilse genel mesajla fırlatır', async () => {
  fetch.mockResolvedValue({
    ok: false,
    status: 502,
    json: () => Promise.reject(new Error('gövde JSON değil')),
  })

  await expect(fetchBoard()).rejects.toThrow('İstek başarısız oldu (HTTP 502)')
})

test('saveBoard board verisini JSON gövdeyle PUT eder ve kaydedileni döner', async () => {
  const board = createEmptyBoard()
  board.columns[0].cards.push({ id: '1', title: 'deneme' })
  fetch.mockResolvedValue(jsonResponse(board))

  const result = await saveBoard(board)

  expect(fetch).toHaveBeenCalledWith('/api/board', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(board),
  })
  expect(result).toEqual(board)
})

test('saveBoard doğrulama hatasında sunucunun mesajıyla fırlatır', async () => {
  fetch.mockResolvedValue(
    jsonResponse(
      { error: 'Board verisi beklenen biçimde değil' },
      { ok: false, status: 400 },
    ),
  )

  await expect(saveBoard({ columns: 'bozuk' })).rejects.toThrow(
    'Board verisi beklenen biçimde değil',
  )
})

test('saveBoard ağ hatasını olduğu gibi iletir', async () => {
  fetch.mockRejectedValue(new TypeError('Failed to fetch'))

  await expect(saveBoard(createEmptyBoard())).rejects.toThrow('Failed to fetch')
})
