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

export function findColumnOfCard(board, cardId) {
  return board.columns.find((column) => column.cards.some((card) => card.id === cardId))
}

export function moveCardToColumn(board, cardId, targetColumnId, overCardId = null) {
  const sourceColumn = findColumnOfCard(board, cardId)
  const targetColumn = board.columns.find((c) => c.id === targetColumnId)
  if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id) return board

  const card = sourceColumn.cards.find((c) => c.id === cardId)
  const targetCards = [...targetColumn.cards]
  const overIndex = overCardId ? targetCards.findIndex((c) => c.id === overCardId) : -1
  targetCards.splice(overIndex === -1 ? targetCards.length : overIndex, 0, card)

  return {
    ...board,
    columns: board.columns.map((c) => {
      if (c.id === sourceColumn.id) {
        return { ...c, cards: c.cards.filter((x) => x.id !== cardId) }
      }
      if (c.id === targetColumn.id) {
        return { ...c, cards: targetCards }
      }
      return c
    }),
  }
}

export function reorderCardInColumn(board, columnId, activeCardId, overCardId) {
  if (activeCardId === overCardId) return board

  const column = board.columns.find((c) => c.id === columnId)
  if (!column) return board

  const from = column.cards.findIndex((card) => card.id === activeCardId)
  const to = column.cards.findIndex((card) => card.id === overCardId)
  if (from === -1 || to === -1) return board

  const cards = [...column.cards]
  const [moved] = cards.splice(from, 1)
  cards.splice(to, 0, moved)

  return {
    ...board,
    columns: board.columns.map((c) => (c.id === columnId ? { ...c, cards } : c)),
  }
}
