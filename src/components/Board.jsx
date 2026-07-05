import { useEffect, useState } from 'react'
import { fetchBoard, saveBoard } from '../lib/api.js'

function createCardId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `card-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function Board() {
  const [board, setBoard] = useState(null)
  const [error, setError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [drafts, setDrafts] = useState({})

  useEffect(() => {
    let active = true
    fetchBoard()
      .then((data) => {
        if (active) setBoard(data)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
    return () => {
      active = false
    }
  }, [])

  function addCard(columnId) {
    const title = (drafts[columnId] ?? '').trim()
    if (!title) return

    const next = {
      ...board,
      columns: board.columns.map((column) =>
        column.id === columnId
          ? { ...column, cards: [...column.cards, { id: createCardId(), title }] }
          : column,
      ),
    }
    setBoard(next)
    setDrafts((prev) => ({ ...prev, [columnId]: '' }))
    setSaveError(null)
    saveBoard(next).catch((err) => setSaveError(err.message))
  }

  if (error) return <p role="alert">{error}</p>
  if (!board) return <p>Yükleniyor…</p>

  return (
    <div className="board">
      {saveError && <p role="alert">{saveError}</p>}
      {board.columns.map((column) => (
        <section key={column.id} className="column" aria-label={column.title}>
          <h2>{column.title}</h2>
          {column.cards.length === 0 ? (
            <p className="empty">Henüz kart yok</p>
          ) : (
            <ul className="cards">
              {column.cards.map((card) => (
                <li key={card.id} className="card">
                  {card.title}
                </li>
              ))}
            </ul>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              addCard(column.id)
            }}
          >
            <input
              aria-label={`${column.title} kolonuna yeni kart`}
              placeholder="Yeni kart"
              value={drafts[column.id] ?? ''}
              onChange={(event) =>
                setDrafts((prev) => ({ ...prev, [column.id]: event.target.value }))
              }
            />
            <button type="submit">Ekle</button>
          </form>
        </section>
      ))}
    </div>
  )
}
