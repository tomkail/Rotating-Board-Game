import { motion } from 'framer-motion';
import type { TileSlot as TileSlotType, ArcGeometry, Player, TileData } from '../types/game';
import { TileSlot } from './TileSlot';

interface RingProps {
  slots: TileSlotType[];
  geometries: ArcGeometry[];
  rotationOffset: number;
  centerX: number;
  centerY: number;
  players: Player[];
  innerRadius: number;
  outerRadius: number;
  onSlotClick: (slotIndex: number) => void;
  onGroupSelect?: (slotIndex: number) => void;
  onTileHover?: (tile: TileData | null) => void;
  selectedGroup?: Set<number> | null;
}

export function Ring({
  slots,
  geometries,
  rotationOffset,
  centerX,
  centerY,
  players,
  innerRadius,
  outerRadius,
  onSlotClick,
  onGroupSelect,
  onTileHover,
  selectedGroup
}: RingProps) {
  return (
    <motion.g
      animate={{ rotate: rotationOffset }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        mass: 1
      }}
      style={{
        transformOrigin: `${centerX}px ${centerY}px`
      }}
    >
      {slots.map((slot, index) => (
        <TileSlot
          key={slot.id}
          slot={slot}
          slotIndex={index}
          geometry={geometries[index]}
          players={players}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          rotationOffset={rotationOffset}
          onClick={() => onSlotClick(index)}
          onGroupSelect={onGroupSelect}
          onHover={onTileHover}
          isInSelectedGroup={selectedGroup?.has(index) ?? false}
        />
      ))}
    </motion.g>
  );
}
