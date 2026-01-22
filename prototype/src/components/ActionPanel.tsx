import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Player, GameAction, RotationDirection } from '../types/game';

interface ActionPanelProps {
  currentPlayer: Player;
  actions: GameAction[];
  onAction: (actionType: string) => void;
  onRotate?: (direction: RotationDirection, amount: number) => void;
  canRotate?: boolean;
}

export function ActionPanel({ 
  currentPlayer, 
  actions, 
  onAction,
  onRotate,
  canRotate = false
}: ActionPanelProps) {
  const [rotationDirection, setRotationDirection] = useState<RotationDirection>('clockwise');
  const [rotationAmount, setRotationAmount] = useState(1);

  const handleDirectionToggle = () => {
    setRotationDirection(prev => prev === 'clockwise' ? 'counterclockwise' : 'clockwise');
  };

  const handleAmountChange = (delta: number) => {
    setRotationAmount(prev => Math.max(1, Math.min(12, prev + delta)));
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 12) {
      setRotationAmount(value);
    }
  };

  const handleMove = () => {
    if (onRotate && canRotate) {
      onRotate(rotationDirection, rotationAmount);
    }
  };

  return (
    <div className="action-panel-horizontal">
      <div className="current-turn-compact">
        <div 
          className="turn-indicator-compact"
          style={{ backgroundColor: currentPlayer.color }}
        />
        <span className="player-name-compact">Player {currentPlayer.id + 1}</span>
      </div>

      <div className="actions-grid">
        {actions.map((action) => {
          // Special rendering for rotate_board action
          if (action.type === 'rotate_board') {
            return (
              <div
                key={action.type}
                className={`action-card rotation-card ${canRotate ? '' : 'disabled'}`}
              >
                <span className="action-name-large">{action.name}</span>
                {!canRotate && (
                  <span className="action-desc-small">{action.description}</span>
                )}
                
                {canRotate && (
                  <div className="rotation-controls">
                    {/* Unified rotation selector */}
                    <div className="rotation-selector-unified">
                      <motion.button
                        className="direction-toggle"
                        onClick={handleDirectionToggle}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={`Click to switch direction (currently ${rotationDirection})`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" style={{ transform: rotationDirection === 'clockwise' ? 'scaleX(-1)' : 'none' }}>
                          <path 
                            d="M5.51,3.32C5.12,3.32,4.8,3.61,4.75,3.98L4.74,4.09V6.98C4.74,7.37,5.03,7.69,5.41,7.74L5.51,7.75H8.4C8.83,7.75,9.17,7.4,9.17,6.98C9.17,6.59,8.88,6.27,8.51,6.22L8.4,6.21H7.43C10.34,3.87,14.61,4.05,17.31,6.75C20.21,9.65,20.21,14.35,17.31,17.25C14.41,20.14,9.72,20.14,6.82,17.25C5.06,15.48,4.32,12.99,4.78,10.59C4.86,10.17,4.59,9.77,4.17,9.69C3.76,9.61,3.36,9.88,3.27,10.3C2.72,13.2,3.61,16.2,5.73,18.33C9.23,21.83,14.9,21.83,18.4,18.33C21.89,14.83,21.89,9.17,18.4,5.67C15.07,2.35,9.79,2.18,6.28,5.17V4.09C6.28,3.66,5.93,3.32,5.51,3.32Z"
                            fill="currentColor"
                          />
                        </svg>
                        <span className="direction-text">
                          {rotationDirection === 'clockwise' ? 'CW' : 'CCW'}
                        </span>
                      </motion.button>
                      
                      <div className="amount-controls">
                        <motion.button
                          className="amount-arrow"
                          onClick={() => handleAmountChange(-1)}
                          disabled={rotationAmount <= 1}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ◀
                        </motion.button>
                        <input
                          type="number"
                          className="amount-input"
                          value={rotationAmount}
                          onChange={handleAmountInput}
                          min={1}
                          max={12}
                        />
                        <motion.button
                          className="amount-arrow"
                          onClick={() => handleAmountChange(1)}
                          disabled={rotationAmount >= 12}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ▶
                        </motion.button>
                      </div>
                    </div>

                    {/* Move button */}
                    <motion.button
                      className="move-button"
                      onClick={handleMove}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Move
                    </motion.button>
                  </div>
                )}
              </div>
            );
          }

          // Default rendering for other actions
          return (
            <motion.button
              key={action.type}
              className={`action-card ${action.enabled ? '' : 'disabled'}`}
              onClick={() => action.enabled && onAction(action.type)}
              disabled={!action.enabled}
              whileHover={action.enabled ? { scale: 1.03, y: -2 } : {}}
              whileTap={action.enabled ? { scale: 0.97 } : {}}
            >
              <span className="action-icon-large">{action.icon}</span>
              <span className="action-name-large">{action.name}</span>
              <span className="action-desc-small">{action.description}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
