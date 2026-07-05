import { test, expect } from 'vitest'
import { COLUMNS, createEmptyBoard } from '../src/lib/board.js'

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
