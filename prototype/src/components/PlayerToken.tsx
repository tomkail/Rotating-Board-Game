import { motion } from 'framer-motion';
import type { Player } from '../types/game';
import { getPositionOnRing } from '../hooks/useRingGeometry';

interface PlayerTokenProps {
  player: Player;
  slotCount: number;
  centerX: number;
  centerY: number;
  radius: number;
}

export function PlayerToken({
  player,
  slotCount,
  centerX,
  centerY,
  radius
}: PlayerTokenProps) {
  // Calculate the angle for this player's slot position
  // Using the same formula as the tile ring: centered on compass points
  const slotAngle = 360 / slotCount;
  const angle = -90 + player.slotIndex * slotAngle;
  
  const position = getPositionOnRing(centerX, centerY, radius, angle);

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: player.id * 0.1
      }}
    >
      {/* Outer glow */}
      <circle
        cx={position.x}
        cy={position.y}
        r={18}
        fill={player.color}
        opacity={0.3}
      />
      {/* Main token */}
      <circle
        cx={position.x}
        cy={position.y}
        r={14}
        fill={player.color}
        stroke="#0f172a"
        strokeWidth={3}
      />
      {/* Player number */}
      <text
        x={position.x}
        y={position.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#0f172a"
        fontSize={12}
        fontWeight={700}
        fontFamily="JetBrains Mono, monospace"
      >
        {player.id + 1}
      </text>
    </motion.g>
  );
}

