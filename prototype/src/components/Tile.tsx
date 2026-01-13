import { motion, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { TileData, Player } from '../types/game';
import { getTileTypeConfig } from '../types/game';

interface TileProps {
  tile: TileData;
  canonicalPath: string; // The canonical tile shape (same for all tiles)
  players: Player[];
  rotationAngle: number; // Angle to rotate this tile to its slot position
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  onHover?: (tile: TileData | null) => void;
  onGroupSelect?: () => void;
}

/**
 * Normalize an angle delta to be between -180 and 180 degrees
 * This ensures we always take the shortest path around the circle
 */
function shortestAngleDelta(from: number, to: number): number {
  let delta = to - from;
  // Normalize to -180 to 180
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

export function Tile({ 
  tile, 
  canonicalPath, 
  players, 
  rotationAngle,
  centerX,
  centerY,
  innerRadius, 
  outerRadius, 
  onHover, 
  onGroupSelect 
}: TileProps) {
  const config = getTileTypeConfig(tile.typeId);
  const gRef = useRef<SVGGElement>(null);
  
  // The rotation angle for this slot
  // Add 90 to compensate for canonical path pointing up (-90 degrees)
  const targetAngle = rotationAngle + 90;
  
  // Track the current animated angle (not normalized to 0-360)
  // Use state for initial value, ref for tracking during animation
  const [initialAngle] = useState(() => targetAngle);
  const currentAngleRef = useRef<number>(initialAngle);
  
  // Determine tile color - use owner color if applicable
  let fillColor = config.color;
  if (config.hasOwner && tile.ownerId !== undefined) {
    const owner = players.find(p => p.id === tile.ownerId);
    if (owner) {
      fillColor = owner.color;
    }
  }

  // Label position: centered on the arc, at mid-radius
  const labelRadius = (innerRadius + outerRadius) / 2;

  // Build the label text
  let labelText: string;
  if (tile.typeId === 'movement' && tile.value !== undefined) {
    const directionIcon = tile.direction === 'left' ? '←' : '→';
    labelText = `${directionIcon}${tile.value}`;
  } else if (config.hasValue && tile.value !== undefined) {
    labelText = `${config.icon}${tile.value}`;
  } else {
    labelText = config.icon;
  }

  // Animate the angle with a spring
  const animatedAngle = useSpring(initialAngle, {
    stiffness: 120,
    damping: 20,
    mass: 0.8
  });

  // Update spring target when angle changes, using shortest path
  useEffect(() => {
    const delta = shortestAngleDelta(currentAngleRef.current, targetAngle);
    const newAngle = currentAngleRef.current + delta;
    currentAngleRef.current = newAngle;
    animatedAngle.set(newAngle);
  }, [targetAngle, animatedAngle]);

  // Update the SVG transform attribute when spring value changes
  useEffect(() => {
    const unsubscribe = animatedAngle.on('change', (angle) => {
      if (gRef.current) {
        gRef.current.setAttribute(
          'transform',
          `translate(${centerX}, ${centerY}) rotate(${angle})`
        );
      }
    });
    return unsubscribe;
  }, [animatedAngle, centerX, centerY]);

  // Set initial transform
  const initialTransform = `translate(${centerX}, ${centerY}) rotate(${initialAngle})`;

  return (
    <motion.g
      ref={gRef}
      transform={initialTransform}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => onHover?.(tile)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Tile background - canonical shape at origin */}
      <motion.path
        d={canonicalPath}
        fill={fillColor}
        stroke={fillColor}
        strokeWidth={2}
        fillOpacity={0.85}
        whileHover={{ fillOpacity: 1 }}
        onClick={(e) => {
          e.stopPropagation();
          onGroupSelect?.();
        }}
        style={{ cursor: onGroupSelect ? 'pointer' : 'default' }}
      />

      {/* Label text - positioned at mid-radius, pointing outward */}
      <text
        x={0}
        y={-labelRadius}
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
    </motion.g>
  );
}
