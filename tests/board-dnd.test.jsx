// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import Board from '../src/components/Board.jsx'
import { createEmptyBoard } from '../src/lib/board.js'

vi.mock('../src/lib/api.js', () => ({
  fetchBoard: vi.fn(),
  saveBoard: vi.fn(),
}))

// jsdom'da gerçek pointer sürüklemesi mümkün olmadığından DndContext'i sarıp
// Board'un onDragEnd işleyicisini yakalıyor, sürükleme bitişini elle tetikliyoruz.
let dragEnd
vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    DndContext: (props) => {
      dragEnd = props.onDragEnd
      return <actual.DndContext {...props} />
    },
  }
})

import { fetchBoard, saveBoard } from '../src/lib/api.js'

function boardWithCards() {
  const board = createEmptyBoard()
  board.columns[0].cards.push(
    { id: 'c1', title: 'Birinci kart' },
    { id: 'c2', title: 'İkinci kart' },
    { id: 'c3', title: 'Üçüncü kart' },
  )
  board.columns[1].cards.push({ id: 'c4', title: 'Başka kolon kartı' })
  return board
}

function cardTitles(region) {
  return within(region)
    .getAllByRole('listitem')
    .map((item) => item.textContent)
}

beforeEach(() => {
  dragEnd = undefined
  fetchBoard.mockReset()
  saveBoard.mockReset()
  saveBoard.mockImplementation(async (board) => board)
})

afterEach(() => {
  cleanup()
})

test('her kart için sürükleme tutamacı render edilir', async () => {
  fetchBoard.mockResolvedValue(boardWithCards())

  render(<Board />)

  const todo = await screen.findByRole('region', { name: 'Yapılacak' })
  expect(within(todo).getByRole('button', { name: 'Kartı taşı: Birinci kart' })).toBeTruthy()
  expect(within(todo).getByRole('button', { name: 'Kartı taşı: İkinci kart' })).toBeTruthy()
  expect(within(todo).getByRole('button', { name: 'Kartı taşı: Üçüncü kart' })).toBeTruthy()
})

test('kolon içinde sürükleme kartları yeniden sıralar ve API\'ye kaydeder', async () => {
  fetchBoard.mockResolvedValue(boardWithCards())

  render(<Board />)

  const todo = await screen.findByRole('region', { name: 'Yapılacak' })
  await act(async () => {
    dragEnd({ active: { id: 'c1' }, over: { id: 'c3' } })
  })

  expect(cardTitles(todo)).toEqual([
    expect.stringContaining('İkinci kart'),
    expect.stringContaining('Üçüncü kart'),
    expect.stringContaining('Birinci kart'),
  ])

  expect(saveBoard).toHaveBeenCalledTimes(1)
  const saved = saveBoard.mock.calls[0][0]
  expect(saved.columns.find((c) => c.id === 'todo').cards.map((card) => card.id)).toEqual([
    'c2',
    'c3',
    'c1',
  ])
})

test('kart kendi üzerine bırakılırsa sıra değişmez ve API çağrılmaz', async () => {
  fetchBoard.mockResolvedValue(boardWithCards())

  render(<Board />)

  const todo = await screen.findByRole('region', { name: 'Yapılacak' })
  await act(async () => {
    dragEnd({ active: { id: 'c2' }, over: { id: 'c2' } })
  })

  expect(cardTitles(todo)).toEqual([
    expect.stringContaining('Birinci kart'),
    expect.stringContaining('İkinci kart'),
    expect.stringContaining('Üçüncü kart'),
  ])
  expect(saveBoard).not.toHaveBeenCalled()
})

test('hedef olmadan bırakılırsa sıra değişmez ve API çağrılmaz', async () => {
  fetchBoard.mockResolvedValue(boardWithCards())

  render(<Board />)

  await screen.findByRole('region', { name: 'Yapılacak' })
  await act(async () => {
    dragEnd({ active: { id: 'c1' }, over: null })
  })

  expect(saveBoard).not.toHaveBeenCalled()
})

test('farklı kolondaki kartın üzerine bırakma kartı o kartın önüne taşır ve API\'ye kaydeder', async () => {
  fetchBoard.mockResolvedValue(boardWithCards())

  render(<Board />)

  const todo = await screen.findByRole('region', { name: 'Yapılacak' })
  const inProgress = screen.getByRole('region', { name: 'Yapılıyor' })
  await act(async () => {
    dragEnd({ active: { id: 'c1' }, over: { id: 'c4' } })
  })

  expect(cardTitles(todo)).toEqual([
    expect.stringContaining('İkinci kart'),
    expect.stringContaining('Üçüncü kart'),
  ])
  expect(cardTitles(inProgress)).toEqual([
    expect.stringContaining('Birinci kart'),
    expect.stringContaining('Başka kolon kartı'),
  ])

  expect(saveBoard).toHaveBeenCalledTimes(1)
  const saved = saveBoard.mock.calls[0][0]
  expect(saved.columns.find((c) => c.id === 'todo').cards.map((card) => card.id)).toEqual([
    'c2',
    'c3',
  ])
  expect(
    saved.columns.find((c) => c.id === 'in-progress').cards.map((card) => card.id),
  ).toEqual(['c1', 'c4'])
})

test('boş kolonun üzerine bırakma kartı o kolona taşır ve API\'ye kaydeder', async () => {
  fetchBoard.mockResolvedValue(boardWithCards())

  render(<Board />)

  const todo = await screen.findByRole('region', { name: 'Yapılacak' })
  const done = screen.getByRole('region', { name: 'Bitti' })
  expect(within(done).getByText('Henüz kart yok')).toBeTruthy()

  await act(async () => {
    dragEnd({ active: { id: 'c2' }, over: { id: 'done' } })
  })

  expect(cardTitles(todo)).toEqual([
    expect.stringContaining('Birinci kart'),
    expect.stringContaining('Üçüncü kart'),
  ])
  expect(cardTitles(done)).toEqual([expect.stringContaining('İkinci kart')])

  expect(saveBoard).toHaveBeenCalledTimes(1)
  const saved = saveBoard.mock.calls[0][0]
  expect(saved.columns.find((c) => c.id === 'done').cards.map((card) => card.id)).toEqual([
    'c2',
  ])
})

test('bilinmeyen bir hedefe bırakılırsa board değişmez ve API çağrılmaz', async () => {
  fetchBoard.mockResolvedValue(boardWithCards())

  render(<Board />)

  const todo = await screen.findByRole('region', { name: 'Yapılacak' })
  await act(async () => {
    dragEnd({ active: { id: 'c1' }, over: { id: 'bilinmeyen-hedef' } })
  })

  expect(cardTitles(todo)).toHaveLength(3)
  expect(saveBoard).not.toHaveBeenCalled()
})

test('sıralama kaydı başarısız olursa uyarı gösterilir', async () => {
  fetchBoard.mockResolvedValue(boardWithCards())
  saveBoard.mockRejectedValue(new Error('Sıralama kaydedilemedi'))

  render(<Board />)

  await screen.findByRole('region', { name: 'Yapılacak' })
  await act(async () => {
    dragEnd({ active: { id: 'c1' }, over: { id: 'c2' } })
  })

  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toContain('Sıralama kaydedilemedi')
})
