import { motion } from 'framer-motion';
import type { Player, GameAction, TileData } from '../types/game';

interface ActionPanelProps {
  currentPlayer: Player;
  actions: GameAction[];
  selectedTile: TileData | null;
  onAction: (actionType: string) => void;
}

export function ActionPanel({ currentPlayer, actions, selectedTile, onAction }: ActionPanelProps) {
  return (
    <div className="action-panel">
      <div className="current-turn">
        <div 
          className="turn-indicator"
          style={{ backgroundColor: currentPlayer.color }}
        />
        <div className="turn-info">
          <span className="turn-label">Current Turn</span>
          <span className="player-name">Player {currentPlayer.id + 1}</span>
        </div>
      </div>

      <div className="actions-header">
        <h4>Available Actions</h4>
      </div>

      <div className="actions-list">
        {actions.map((action) => (
          <motion.button
            key={action.type}
            className={`action-btn ${action.enabled ? '' : 'disabled'}`}
            onClick={() => action.enabled && onAction(action.type)}
            disabled={!action.enabled}
            whileHover={action.enabled ? { scale: 1.02 } : {}}
            whileTap={action.enabled ? { scale: 0.98 } : {}}
          >
            <span className="action-icon">{action.icon}</span>
            <div className="action-details">
              <span className="action-name">{action.name}</span>
              <span className="action-desc">{action.description}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {selectedTile && (
        <div className="selected-tile-hint">
          <span className="hint-icon">💡</span>
          <span>Click an empty slot to place tile</span>
        </div>
      )}
    </div>
  );
}

