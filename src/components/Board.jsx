import { useEffect, useState } from 'react'
import { fetchBoard } from '../lib/api.js'

export default function Board() {
  const [board, setBoard] = useState(null)
  const [error, setError] = useState(null)

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

  if (error) return <p role="alert">{error}</p>
  if (!board) return <p>Yükleniyor…</p>

  return (
    <div className="board">
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
        </section>
      ))}
    </div>
  )
}
