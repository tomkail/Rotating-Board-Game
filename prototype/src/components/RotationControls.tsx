import { motion } from 'framer-motion';
import type { RotationDirection } from '../types/game';

interface RotationControlsProps {
  onRotate: (direction: RotationDirection) => void;
}

export function RotationControls({ onRotate }: RotationControlsProps) {
  return (
    <div className="rotation-controls">
      <motion.button
        onClick={() => onRotate('counterclockwise')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="rotate-btn"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9" />
          <polyline points="3 7 3 3 7 3" />
          <path d="M3 3 9 9" />
        </svg>
        <span>Rotate Left</span>
      </motion.button>
      
      <motion.button
        onClick={() => onRotate('clockwise')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="rotate-btn"
      >
        <span>Rotate Right</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-9-9" />
          <polyline points="21 7 21 3 17 3" />
          <path d="M21 3 15 9" />
        </svg>
      </motion.button>
    </div>
  );
}

