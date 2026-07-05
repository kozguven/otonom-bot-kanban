import { test, expect } from 'vitest'
import {
  COLUMNS,
  createEmptyBoard,
  findColumnOfCard,
  reorderCardInColumn,
} from '../src/lib/board.js'

function boardWithCards() {
  const board = createEmptyBoard()
  board.columns[0].cards.push(
    { id: 'a', title: 'Kart A' },
    { id: 'b', title: 'Kart B' },
    { id: 'c', title: 'Kart C' },
  )
  board.columns[1].cards.push({ id: 'x', title: 'Kart X' })
  return board
}

test('üç sabit kolon tanımlı', () => {
  expect(COLUMNS.map((c) => c.title)).toEqual(['Yapılacak', 'Yapılıyor', 'Bitti'])
})

test('createEmptyBoard her kolonu boş kart listesiyle döner', () => {
  const board = createEmptyBoard()
  expect(board.columns).toHaveLength(3)
  for (const column of board.columns) {
    expect(column.cards).toEqual([])
  }
})

test('createEmptyBoard her çağrıda bağımsız kopya üretir', () => {
  const a = createEmptyBoard()
  a.columns[0].cards.push({ id: '1', title: 'deneme' })
  const b = createEmptyBoard()
  expect(b.columns[0].cards).toEqual([])
})

test('findColumnOfCard kartın bulunduğu kolonu döner', () => {
  const board = boardWithCards()
  expect(findColumnOfCard(board, 'b').id).toBe('todo')
  expect(findColumnOfCard(board, 'x').id).toBe('in-progress')
})

test('findColumnOfCard bilinmeyen kart için undefined döner', () => {
  expect(findColumnOfCard(boardWithCards(), 'yok')).toBeUndefined()
})

test('reorderCardInColumn kartı aşağı taşır', () => {
  const next = reorderCardInColumn(boardWithCards(), 'todo', 'a', 'c')
  expect(next.columns[0].cards.map((card) => card.id)).toEqual(['b', 'c', 'a'])
})

test('reorderCardInColumn kartı yukarı taşır', () => {
  const next = reorderCardInColumn(boardWithCards(), 'todo', 'c', 'a')
  expect(next.columns[0].cards.map((card) => card.id)).toEqual(['c', 'a', 'b'])
})

test('reorderCardInColumn diğer kolonları değiştirmez', () => {
  const next = reorderCardInColumn(boardWithCards(), 'todo', 'a', 'b')
  expect(next.columns[1].cards.map((card) => card.id)).toEqual(['x'])
  expect(next.columns[2].cards).toEqual([])
})

test('reorderCardInColumn girdiyi mutasyona uğratmaz, yeni board döner', () => {
  const board = boardWithCards()
  const next = reorderCardInColumn(board, 'todo', 'a', 'b')
  expect(next).not.toBe(board)
  expect(board.columns[0].cards.map((card) => card.id)).toEqual(['a', 'b', 'c'])
  expect(next.columns[0].cards.map((card) => card.id)).toEqual(['b', 'a', 'c'])
})

test('reorderCardInColumn aynı kart için aynı board referansını döner', () => {
  const board = boardWithCards()
  expect(reorderCardInColumn(board, 'todo', 'a', 'a')).toBe(board)
})

test('reorderCardInColumn bilinmeyen kolon ya da kartta board değişmez', () => {
  const board = boardWithCards()
  expect(reorderCardInColumn(board, 'yok', 'a', 'b')).toBe(board)
  expect(reorderCardInColumn(board, 'todo', 'yok', 'b')).toBe(board)
  expect(reorderCardInColumn(board, 'todo', 'a', 'yok')).toBe(board)
  expect(reorderCardInColumn(board, 'todo', 'a', 'x')).toBe(board)
})
