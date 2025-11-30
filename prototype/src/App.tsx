import { Board } from './components/Board'
import './App.css'

function App() {
  return (
    <div className="app">
      <header>
        <h1>Ring Board Game</h1>
        <p className="subtitle">Click empty slots to place tiles • Use buttons to rotate the ring</p>
      </header>
      <main>
        <Board />
      </main>
    </div>
  )
}

export default App
