import { useState } from 'react';
import { motion } from 'framer-motion';

interface GameSetupProps {
  onStartGame: (playerCount: number, fillWithBlanks: boolean, tileCount: number) => void;
}

const PLAYER_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#eab308', // yellow
  '#a855f7', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#ec4899', // pink
];

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [fillWithBlanks, setFillWithBlanks] = useState(false);
  const [tileCount, setTileCount] = useState(16);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number | null>(null);

  const handleStartGame = () => {
    if (selectedPlayerCount !== null) {
      onStartGame(selectedPlayerCount, fillWithBlanks, tileCount);
    }
  };

  return (
    <motion.div
      className="game-setup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2>New Game</h2>
      <p>Select number of players</p>
      
      <div className="player-count-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
          <motion.button
            key={count}
            className={`player-count-btn ${selectedPlayerCount === count ? 'selected' : ''}`}
            onClick={() => setSelectedPlayerCount(count)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              '--player-color': PLAYER_COLORS[count - 1]
            } as React.CSSProperties}
          >
            <span className="count">{count}</span>
            <span className="label">player{count !== 1 ? 's' : ''}</span>
          </motion.button>
        ))}
      </div>

      <div className="game-setup-options">
        <label className="slider-label">
          <span>Number of tiles: <strong>{tileCount}</strong></span>
          <input
            type="range"
            min="12"
            max="24"
            value={tileCount}
            onChange={(e) => setTileCount(Number(e.target.value))}
            className="tile-count-slider"
          />
          <div className="slider-range">
            <span>12</span>
            <span>24</span>
          </div>
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fillWithBlanks}
            onChange={(e) => setFillWithBlanks(e.target.checked)}
          />
          <span>Fill board with blank tiles</span>
        </label>
      </div>

      <motion.button
        className="start-game-btn"
        onClick={handleStartGame}
        disabled={selectedPlayerCount === null}
        whileHover={selectedPlayerCount !== null ? { scale: 1.02 } : {}}
        whileTap={selectedPlayerCount !== null ? { scale: 0.98 } : {}}
      >
        {selectedPlayerCount === null 
          ? 'Select players to start' 
          : `Start Game with ${selectedPlayerCount} player${selectedPlayerCount !== 1 ? 's' : ''}`}
      </motion.button>
    </motion.div>
  );
}

export { PLAYER_COLORS };
