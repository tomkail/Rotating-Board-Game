import { motion } from 'framer-motion';
import type { TileSlot as TileSlotType, ArcGeometry } from '../types/game';
import { Tile } from './Tile';

interface TileSlotProps {
  slot: TileSlotType;
  geometry: ArcGeometry;
  onClick: () => void;
}

export function TileSlot({ slot, geometry, onClick }: TileSlotProps) {
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
      {slot.filled && slot.tileType && (
        <Tile type={slot.tileType} path={geometry.path} />
      )}
    </g>
  );
}

