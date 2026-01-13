import { motion } from 'framer-motion';

interface DevControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function DevControls({ 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo
}: DevControlsProps) {
  return (
    <div className="dev-controls">
      <div className="dev-controls-header">
        <h4>🛠️ Dev Controls</h4>
      </div>

      <div className="dev-section">
        <h5>History</h5>
        <div className="history-controls">
          <motion.button
            onClick={onUndo}
            whileHover={canUndo ? { scale: 1.05 } : {}}
            whileTap={canUndo ? { scale: 0.95 } : {}}
            className={`dev-btn ${canUndo ? '' : 'disabled'}`}
            disabled={!canUndo}
          >
            ↶ Undo
          </motion.button>
          
          <motion.button
            onClick={onRedo}
            whileHover={canRedo ? { scale: 1.05 } : {}}
            whileTap={canRedo ? { scale: 0.95 } : {}}
            className={`dev-btn ${canRedo ? '' : 'disabled'}`}
            disabled={!canRedo}
          >
            ↷ Redo
          </motion.button>
        </div>
      </div>
    </div>
  );
}

