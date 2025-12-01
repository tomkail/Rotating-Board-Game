import { motion } from 'framer-motion';
import type { TileSlot as TileSlotType, ArcGeometry, Player, TileData } from '../types/game';
import { Tile } from './Tile';

interface TileSlotProps {
  slot: TileSlotType;
  geometry: ArcGeometry;
  players: Player[];
  innerRadius: number;
  outerRadius: number;
  rotationOffset: number;
  onClick: () => void;
  onHover?: (tile: TileData | null) => void;
}

export function TileSlot({ slot, geometry, players, innerRadius, outerRadius, rotationOffset, onClick, onHover }: TileSlotProps) {
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
        />
      )}
    </g>
  );
}
