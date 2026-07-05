// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import Board from '../src/components/Board.jsx'
import { createEmptyBoard } from '../src/lib/board.js'

vi.mock('../src/lib/api.js', () => ({
  fetchBoard: vi.fn(),
  saveBoard: vi.fn(),
}))

import { fetchBoard, saveBoard } from '../src/lib/api.js'

function boardWithCards() {
  const board = createEmptyBoard()
  board.columns[0].cards.push({ id: 'c1', title: 'Alışveriş listesi yaz' })
  board.columns[1].cards.push({ id: 'c2', title: 'Raporu bitir' })
  board.columns[1].cards.push({ id: 'c3', title: 'Testleri koş' })
  return board
}

beforeEach(() => {
  fetchBoard.mockReset()
  saveBoard.mockReset()
  saveBoard.mockImplementation(async (board) => board)
})

afterEach(() => {
  cleanup()
})

test('veri gelene kadar yükleniyor durumu gösterilir', () => {
  fetchBoard.mockReturnValue(new Promise(() => {}))

  render(<Board />)

  expect(screen.getByText('Yükleniyor…')).toBeTruthy()
})

test('üç sabit kolonu API verisiyle başlıklarıyla render eder', async () => {
  fetchBoard.mockResolvedValue(createEmptyBoard())

  render(<Board />)

  const headings = await screen.findAllByRole('heading', { level: 2 })
  expect(headings.map((h) => h.textContent)).toEqual([
    'Yapılacak',
    'Yapılıyor',
    'Bitti',
  ])
})

test('kartları ait oldukları kolonların içinde gösterir', async () => {
  fetchBoard.mockResolvedValue(boardWithCards())

  render(<Board />)

  const todo = await screen.findByRole('region', { name: 'Yapılacak' })
  const inProgress = screen.getByRole('region', { name: 'Yapılıyor' })
  const done = screen.getByRole('region', { name: 'Bitti' })

  expect(within(todo).getByText('Alışveriş listesi yaz')).toBeTruthy()
  expect(within(inProgress).getByText('Raporu bitir')).toBeTruthy()
  expect(within(inProgress).getByText('Testleri koş')).toBeTruthy()
  expect(within(done).queryByText('Alışveriş listesi yaz')).toBeNull()
})

test('boş kolonda kart olmadığını belirten mesaj görünür', async () => {
  fetchBoard.mockResolvedValue(createEmptyBoard())

  render(<Board />)

  const done = await screen.findByRole('region', { name: 'Bitti' })
  expect(within(done).getByText('Henüz kart yok')).toBeTruthy()
})

test('API hatasında hata mesajını gösterir', async () => {
  fetchBoard.mockRejectedValue(new Error('Board dosyası bozuk'))

  render(<Board />)

  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toContain('Board dosyası bozuk')
})

test('yeni kart eklenince kolonda görünür ve API\'ye kaydedilir', async () => {
  fetchBoard.mockResolvedValue(createEmptyBoard())

  render(<Board />)

  const todo = await screen.findByRole('region', { name: 'Yapılacak' })
  const input = within(todo).getByLabelText('Yapılacak kolonuna yeni kart')
  fireEvent.change(input, { target: { value: 'Yeni görev' } })
  fireEvent.click(within(todo).getByRole('button', { name: 'Ekle' }))

  expect(within(todo).getByText('Yeni görev')).toBeTruthy()
  expect(within(todo).queryByText('Henüz kart yok')).toBeNull()
  expect(input.value).toBe('')

  expect(saveBoard).toHaveBeenCalledTimes(1)
  const saved = saveBoard.mock.calls[0][0]
  const savedTodo = saved.columns.find((column) => column.id === 'todo')
  expect(savedTodo.cards).toHaveLength(1)
  expect(savedTodo.cards[0].title).toBe('Yeni görev')
  expect(typeof savedTodo.cards[0].id).toBe('string')
  expect(savedTodo.cards[0].id.length).toBeGreaterThan(0)
})

test('kart yalnızca kendi kolonuna eklenir', async () => {
  fetchBoard.mockResolvedValue(boardWithCards())

  render(<Board />)

  const inProgress = await screen.findByRole('region', { name: 'Yapılıyor' })
  fireEvent.change(within(inProgress).getByLabelText('Yapılıyor kolonuna yeni kart'), {
    target: { value: 'Ara görev' },
  })
  fireEvent.click(within(inProgress).getByRole('button', { name: 'Ekle' }))

  expect(within(inProgress).getByText('Ara görev')).toBeTruthy()
  const todo = screen.getByRole('region', { name: 'Yapılacak' })
  expect(within(todo).queryByText('Ara görev')).toBeNull()

  const saved = saveBoard.mock.calls[0][0]
  expect(saved.columns.find((c) => c.id === 'in-progress').cards).toHaveLength(3)
  expect(saved.columns.find((c) => c.id === 'todo').cards).toHaveLength(1)
})

test('boş ya da yalnızca boşluktan oluşan başlıkla kart eklenmez', async () => {
  fetchBoard.mockResolvedValue(createEmptyBoard())

  render(<Board />)

  const todo = await screen.findByRole('region', { name: 'Yapılacak' })
  fireEvent.change(within(todo).getByLabelText('Yapılacak kolonuna yeni kart'), {
    target: { value: '   ' },
  })
  fireEvent.click(within(todo).getByRole('button', { name: 'Ekle' }))

  expect(saveBoard).not.toHaveBeenCalled()
  expect(within(todo).getByText('Henüz kart yok')).toBeTruthy()
})

test('kaydetme hatasında uyarı mesajı gösterilir', async () => {
  fetchBoard.mockResolvedValue(createEmptyBoard())
  saveBoard.mockRejectedValue(new Error('Kayıt başarısız'))

  render(<Board />)

  const todo = await screen.findByRole('region', { name: 'Yapılacak' })
  fireEvent.change(within(todo).getByLabelText('Yapılacak kolonuna yeni kart'), {
    target: { value: 'Kaydedilemeyen kart' },
  })
  fireEvent.click(within(todo).getByRole('button', { name: 'Ekle' }))

  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toContain('Kayıt başarısız')
})
