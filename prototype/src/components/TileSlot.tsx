import { motion } from 'framer-motion';
import type { TileSlot as TileSlotType, ArcGeometry, Player, TileData } from '../types/game';
import { Tile } from './Tile';

interface TileSlotProps {
  slot: TileSlotType;
  slotIndex: number;
  geometry: ArcGeometry;
  players: Player[];
  innerRadius: number;
  outerRadius: number;
  rotationOffset: number;
  onClick: () => void;
  onGroupSelect?: (slotIndex: number) => void;
  onHover?: (tile: TileData | null) => void;
  isInSelectedGroup?: boolean;
}

export function TileSlot({ 
  slot, 
  slotIndex,
  geometry, 
  players, 
  innerRadius, 
  outerRadius, 
  rotationOffset, 
  onClick, 
  onGroupSelect,
  onHover,
  isInSelectedGroup = false
}: TileSlotProps) {
  return (
    <g>
      {/* Background/empty slot area - always rendered for click target */}
      {!slot.filled && (
        <motion.path
          d={geometry.path}
          fill="#1e293b"
          stroke="#334155"
          strokeWidth={2}
          strokeDasharray="8 4"
          onClick={onClick}
          whileHover={{
            fill: '#334155',
            scale: 1.02
          }}
          style={{
            cursor: 'pointer',
            transformOrigin: `${geometry.centerX}px ${geometry.centerY}px`
          }}
          transition={{ duration: 0.15 }}
        />
      )}
      
      {/* Highlight for selected group */}
      {isInSelectedGroup && (
        <motion.path
          d={geometry.path}
          fill="none"
          stroke="#60a5fa"
          strokeWidth={4}
          opacity={0.5}
          style={{
            pointerEvents: 'none',
            transformOrigin: `${geometry.centerX}px ${geometry.centerY}px`
          }}
        />
      )}
      
      {/* Tile if slot is filled */}
      {slot.filled && slot.tile && (
        <Tile
          tile={slot.tile}
          path={geometry.path}
          players={players}
          geometry={geometry}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          rotationOffset={rotationOffset}
          onHover={onHover}
          onGroupSelect={onGroupSelect ? () => onGroupSelect(slotIndex) : undefined}
        />
      )}
    </g>
  );
}
