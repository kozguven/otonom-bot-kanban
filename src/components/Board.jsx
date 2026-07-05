import { useEffect, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { fetchBoard, saveBoard } from '../lib/api.js'
import { findColumnOfCard, reorderCardInColumn } from '../lib/board.js'

function createCardId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `card-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function SortableCard({ card, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <li ref={setNodeRef} style={style} className="card">
      <button
        type="button"
        className="drag-handle"
        aria-label={`Kartı taşı: ${card.title}`}
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      {children}
    </li>
  )
}

export default function Board() {
  const [board, setBoard] = useState(null)
  const [error, setError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [editing, setEditing] = useState(null)

  const sensors = useSensors(
    // activationConstraint olmadan kart içindeki butonlara tıklamak sürükleme başlatır
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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

  function persist(next) {
    setBoard(next)
    setSaveError(null)
    saveBoard(next).catch((err) => setSaveError(err.message))
  }

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
    setDrafts((prev) => ({ ...prev, [columnId]: '' }))
    persist(next)
  }

  function deleteCard(cardId) {
    const next = {
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      })),
    }
    if (editing?.cardId === cardId) setEditing(null)
    persist(next)
  }

  function saveCardEdit() {
    const title = (editing?.value ?? '').trim()
    if (!title) return

    const next = {
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.id === editing.cardId ? { ...card, title } : card,
        ),
      })),
    }
    setEditing(null)
    persist(next)
  }

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return

    const activeColumn = findColumnOfCard(board, active.id)
    const overColumn = findColumnOfCard(board, over.id)
    // Bu aşamada yalnızca kolon içi sıralama destekleniyor
    if (!activeColumn || activeColumn !== overColumn) return

    const next = reorderCardInColumn(board, activeColumn.id, active.id, over.id)
    if (next === board) return
    persist(next)
  }

  if (error) return <p role="alert">{error}</p>
  if (!board) return <p>Yükleniyor…</p>

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="board">
        {saveError && <p role="alert">{saveError}</p>}
        {board.columns.map((column) => (
          <section key={column.id} className="column" aria-label={column.title}>
            <h2>{column.title}</h2>
            {column.cards.length === 0 ? (
              <p className="empty">Henüz kart yok</p>
            ) : (
              <SortableContext
                items={column.cards.map((card) => card.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="cards">
                  {column.cards.map((card) => (
                    <SortableCard key={card.id} card={card}>
                      {editing?.cardId === card.id ? (
                        <form
                          onSubmit={(event) => {
                            event.preventDefault()
                            saveCardEdit()
                          }}
                        >
                          <input
                            aria-label="Kart başlığını düzenle"
                            value={editing.value}
                            onChange={(event) =>
                              setEditing((prev) => ({ ...prev, value: event.target.value }))
                            }
                          />
                          <button type="submit">Kaydet</button>
                          <button type="button" onClick={() => setEditing(null)}>
                            İptal
                          </button>
                        </form>
                      ) : (
                        <>
                          {card.title}
                          <button
                            type="button"
                            onClick={() => setEditing({ cardId: card.id, value: card.title })}
                          >
                            Düzenle
                          </button>
                          <button type="button" onClick={() => deleteCard(card.id)}>
                            Sil
                          </button>
                        </>
                      )}
                    </SortableCard>
                  ))}
                </ul>
              </SortableContext>
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
    </DndContext>
  )
}
