export const COLUMNS = [
  { id: 'todo', title: 'Yapılacak' },
  { id: 'in-progress', title: 'Yapılıyor' },
  { id: 'done', title: 'Bitti' },
]

export function createEmptyBoard() {
  return {
    columns: COLUMNS.map((column) => ({ ...column, cards: [] })),
  }
}
