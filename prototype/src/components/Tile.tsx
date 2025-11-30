import { motion } from 'framer-motion';
import type { TileType } from '../types/game';

interface TileProps {
  type: TileType;
  path: string;
}

// Color mapping for different tile types
const tileColors: Record<TileType, { fill: string; stroke: string }> = {
  resource: { fill: '#4ade80', stroke: '#22c55e' },
  victory: { fill: '#fbbf24', stroke: '#f59e0b' },
  movement: { fill: '#60a5fa', stroke: '#3b82f6' },
  swap: { fill: '#c084fc', stroke: '#a855f7' },
  generic: { fill: '#94a3b8', stroke: '#64748b' }
};

export function Tile({ type, path }: TileProps) {
  const colors = tileColors[type];

  return (
    <motion.path
      d={path}
      fill={colors.fill}
      stroke={colors.stroke}
      strokeWidth={2}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
      style={{ pointerEvents: 'none' }}
    />
  );
}

