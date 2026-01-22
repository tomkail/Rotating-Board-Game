import { motion } from 'framer-motion';

interface DevControlsProps {
  // Action-level undo (rotate, place tile)
  onActionUndo: () => void;
  onActionRedo: () => void;
  canActionUndo: boolean;
  canActionRedo: boolean;
  // Turn-level undo (rewind to start of turn)
  onTurnUndo: () => void;
  onTurnRedo: () => void;
  turnUndoMode: 'restart' | 'prev' | 'disabled';
  canTurnRedo: boolean;
}

export function DevControls({ 
  onActionUndo, 
  onActionRedo, 
  canActionUndo, 
  canActionRedo,
  onTurnUndo,
  onTurnRedo,
  turnUndoMode,
  canTurnRedo
}: DevControlsProps) {
  const canTurnUndo = turnUndoMode !== 'disabled';
  const turnUndoLabel = turnUndoMode === 'restart' ? '↩ Restart Turn' : '⏮ Prev Turn';
  const turnUndoHint = turnUndoMode === 'restart' 
    ? 'Reset to start of current turn' 
    : turnUndoMode === 'prev' 
    ? 'Go back to previous turn' 
    : 'No actions to undo';

  return (
    <div className="dev-controls">
      <div className="dev-controls-header">
        <h4>🛠️ Dev Controls</h4>
      </div>

      <div className="dev-section">
        <h5>Action History</h5>
        <p className="dev-hint">Undo individual moves</p>
        <div className="history-controls">
          <motion.button
            onClick={onActionUndo}
            whileHover={canActionUndo ? { scale: 1.05 } : {}}
            whileTap={canActionUndo ? { scale: 0.95 } : {}}
            className={`dev-btn ${canActionUndo ? '' : 'disabled'}`}
            disabled={!canActionUndo}
          >
            ↶ Undo
          </motion.button>
          
          <motion.button
            onClick={onActionRedo}
            whileHover={canActionRedo ? { scale: 1.05 } : {}}
            whileTap={canActionRedo ? { scale: 0.95 } : {}}
            className={`dev-btn ${canActionRedo ? '' : 'disabled'}`}
            disabled={!canActionRedo}
          >
            ↷ Redo
          </motion.button>
        </div>
      </div>

      <div className="dev-section">
        <h5>Turn History</h5>
        <p className="dev-hint">{turnUndoHint}</p>
        <div className="history-controls">
          <motion.button
            onClick={onTurnUndo}
            whileHover={canTurnUndo ? { scale: 1.05 } : {}}
            whileTap={canTurnUndo ? { scale: 0.95 } : {}}
            className={`dev-btn turn-btn ${canTurnUndo ? '' : 'disabled'}`}
            disabled={!canTurnUndo}
          >
            {turnUndoLabel}
          </motion.button>
          
          <motion.button
            onClick={onTurnRedo}
            whileHover={canTurnRedo ? { scale: 1.05 } : {}}
            whileTap={canTurnRedo ? { scale: 0.95 } : {}}
            className={`dev-btn turn-btn ${canTurnRedo ? '' : 'disabled'}`}
            disabled={!canTurnRedo}
          >
            Next Turn ⏭
          </motion.button>
        </div>
      </div>
    </div>
  );
}

