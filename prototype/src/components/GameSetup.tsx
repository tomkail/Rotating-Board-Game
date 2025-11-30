import { motion } from 'framer-motion';

interface GameSetupProps {
  onStartGame: (playerCount: number) => void;
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
            className="player-count-btn"
            onClick={() => onStartGame(count)}
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
    </motion.div>
  );
}

export { PLAYER_COLORS };

