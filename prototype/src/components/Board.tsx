import { useState, useCallback } from 'react';
import type { TileSlot as TileSlotType, RotationDirection } from '../types/game';
import { useRingGeometry } from '../hooks/useRingGeometry';
import { Ring } from './Ring';
import { RotationControls } from './RotationControls';

const SLOT_COUNT = 16;
const SVG_SIZE = 600;
const CENTER = SVG_SIZE / 2;
const OUTER_RADIUS = 250;
const INNER_RADIUS = 160;

function createInitialSlots(count: number): TileSlotType[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    filled: false
  }));
}

export function Board() {
  const [slots, setSlots] = useState<TileSlotType[]>(() => createInitialSlots(SLOT_COUNT));
  const [rotationOffset, setRotationOffset] = useState(0);

  const geometries = useRingGeometry({
    slotCount: SLOT_COUNT,
    innerRadius: INNER_RADIUS,
    outerRadius: OUTER_RADIUS,
    centerX: CENTER,
    centerY: CENTER,
    gapAngle: 3
  });

  const handleSlotClick = useCallback((slotIndex: number) => {
    setSlots(currentSlots => {
      const slot = currentSlots[slotIndex];
      // Only allow clicking on empty slots
      if (slot.filled) return currentSlots;

      const newSlots = [...currentSlots];
      newSlots[slotIndex] = {
        ...slot,
        filled: true,
        tileType: 'generic'
      };
      return newSlots;
    });
  }, []);

  const handleRotate = useCallback((direction: RotationDirection) => {
    const slotAngle = 360 / SLOT_COUNT;
    const delta = direction === 'clockwise' ? slotAngle : -slotAngle;
    setRotationOffset(current => current + delta);
  }, []);

  return (
    <div className="board-container">
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="board-svg"
      >
        {/* Background circle for visual reference */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={OUTER_RADIUS + 10}
          fill="none"
          stroke="#1e293b"
          strokeWidth={1}
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={INNER_RADIUS - 10}
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth={1}
        />

        {/* The rotating ring with all slots */}
        <Ring
          slots={slots}
          geometries={geometries}
          rotationOffset={rotationOffset}
          centerX={CENTER}
          centerY={CENTER}
          onSlotClick={handleSlotClick}
        />

        {/* Center decoration */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={30}
          fill="#1e293b"
          stroke="#334155"
          strokeWidth={2}
        />
      </svg>

      <RotationControls onRotate={handleRotate} />

      <div className="info-panel">
        <p>Tiles placed: {slots.filter(s => s.filled).length} / {SLOT_COUNT}</p>
        <p>Rotation: {rotationOffset}°</p>
      </div>
    </div>
  );
}

