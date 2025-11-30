import { motion } from 'framer-motion';
import type { TileData, Player } from '../types/game';
import { getTileTypeConfig } from '../types/game';

interface TileProps {
  tile: TileData;
  path: string;
  players: Player[];
}

export function Tile({ tile, path, players }: TileProps) {
  const config = getTileTypeConfig(tile.typeId);
  
  // Determine tile color - use owner color if applicable
  let fillColor = config.color;
  if (config.hasOwner && tile.ownerId !== undefined) {
    const owner = players.find(p => p.id === tile.ownerId);
    if (owner) {
      fillColor = owner.color;
    }
  }

  // Darken the color for stroke
  const strokeColor = fillColor;

  return (
    <motion.g
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
    >
      <motion.path
        d={path}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
        style={{ pointerEvents: 'none' }}
        fillOpacity={0.85}
      />
      {/* Icon and value overlay would need positioning - simplified for now */}
    </motion.g>
  );
}
