import { motion } from 'framer-motion';
import type { TileSlot as TileSlotType, ArcGeometry } from '../types/game';
import { TileSlot } from './TileSlot';

interface RingProps {
  slots: TileSlotType[];
  geometries: ArcGeometry[];
  rotationOffset: number;
  centerX: number;
  centerY: number;
  onSlotClick: (slotIndex: number) => void;
}

export function Ring({
  slots,
  geometries,
  rotationOffset,
  centerX,
  centerY,
  onSlotClick
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
          geometry={geometries[index]}
          onClick={() => onSlotClick(index)}
        />
      ))}
    </motion.g>
  );
}

