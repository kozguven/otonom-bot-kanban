// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import Board from '../src/components/Board.jsx'
import { createEmptyBoard } from '../src/lib/board.js'

vi.mock('../src/lib/api.js', () => ({
  fetchBoard: vi.fn(),
}))

import { fetchBoard } from '../src/lib/api.js'

function boardWithCards() {
  const board = createEmptyBoard()
  board.columns[0].cards.push({ id: 'c1', title: 'Alışveriş listesi yaz' })
  board.columns[1].cards.push({ id: 'c2', title: 'Raporu bitir' })
  board.columns[1].cards.push({ id: 'c3', title: 'Testleri koş' })
  return board
}

beforeEach(() => {
  fetchBoard.mockReset()
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
