import Board from './components/Board.jsx'

export default function App() {
  return (
    <>
      <header className="topbar">
        <h1>Kanban Board</h1>
        <p className="tagline">Görevlerini üç kolonda düzenle</p>
      </header>
      <main>
        <Board />
      </main>
    </>
  )
}
