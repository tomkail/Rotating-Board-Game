import { motion } from 'framer-motion';
import type { TileData, Player, ArcGeometry } from '../types/game';
import { getTileTypeConfig } from '../types/game';
import { getPositionOnRing } from '../hooks/useRingGeometry';

interface TileProps {
  tile: TileData;
  path: string;
  players: Player[];
  geometry: ArcGeometry;
  innerRadius: number;
  outerRadius: number;
  rotationOffset: number;
  onHover?: (tile: TileData | null) => void;
  onGroupSelect?: () => void;
}

export function Tile({ tile, path, players, geometry, innerRadius, outerRadius, rotationOffset, onHover, onGroupSelect }: TileProps) {
  const config = getTileTypeConfig(tile.typeId);
  
  // Determine tile color - use owner color if applicable
  let fillColor = config.color;
  if (config.hasOwner && tile.ownerId !== undefined) {
    const owner = players.find(p => p.id === tile.ownerId);
    if (owner) {
      fillColor = owner.color;
    }
  }

  // Calculate label position at center of arc
  const labelRadius = (innerRadius + outerRadius) / 2;
  const labelPos = getPositionOnRing(
    geometry.centerX,
    geometry.centerY,
    labelRadius,
    geometry.midAngle
  );

  // Build the label text - icon + value or just icon
  // For movement tiles, show direction arrow instead of generic arrow
  let labelText: string;
  if (tile.typeId === 'movement' && tile.value !== undefined) {
    const directionIcon = tile.direction === 'left' ? '←' : '→';
    labelText = `${directionIcon}${tile.value}`;
  } else if (config.hasValue && tile.value !== undefined) {
    labelText = `${config.icon}${tile.value}`;
  } else {
    labelText = config.icon;
  }

  return (
    <motion.g
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
      onMouseEnter={() => onHover?.(tile)}
      onMouseLeave={() => onHover?.(null)}
      style={{ cursor: onGroupSelect ? 'pointer' : 'default' }}
    >
      {/* Tile background */}
      <motion.path
        d={path}
        fill={fillColor}
        stroke={fillColor}
        strokeWidth={2}
        fillOpacity={0.85}
        whileHover={{ fillOpacity: 1 }}
        onClick={onGroupSelect}
      />

      {/* Label text - counter-rotate so it stays upright */}
      <g transform={`translate(${labelPos.x}, ${labelPos.y}) rotate(${-rotationOffset})`}>
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#0f172a"
          fontSize={20}
          fontWeight={700}
          fontFamily="JetBrains Mono, monospace"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {labelText}
        </text>
      </g>
    </motion.g>
  );
}
