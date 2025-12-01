import { motion } from 'framer-motion';
import type { Player } from '../types/game';
import { getPositionOnRing } from '../hooks/useRingGeometry';

interface PlayerTokenProps {
  player: Player;
  slotCount: number;
  centerX: number;
  centerY: number;
  radius: number;
  isCurrentPlayer?: boolean;
}

export function PlayerToken({
  player,
  slotCount,
  centerX,
  centerY,
  radius,
  isCurrentPlayer = false
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
        scale: isCurrentPlayer ? 1.15 : 1, 
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: player.id * 0.1
      }}
    >
      {/* Pulsing outer glow for current player */}
      {isCurrentPlayer && (
        <motion.circle
          cx={position.x}
          cy={position.y}
          r={24}
          fill={player.color}
          opacity={0}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      
      {/* Outer glow */}
      <circle
        cx={position.x}
        cy={position.y}
        r={isCurrentPlayer ? 22 : 18}
        fill={player.color}
        opacity={isCurrentPlayer ? 0.5 : 0.3}
      />
      
      {/* Main token */}
      <circle
        cx={position.x}
        cy={position.y}
        r={isCurrentPlayer ? 16 : 14}
        fill={player.color}
        stroke={isCurrentPlayer ? '#fff' : '#0f172a'}
        strokeWidth={isCurrentPlayer ? 4 : 3}
      />
      
      {/* Player number */}
      <text
        x={position.x}
        y={position.y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isCurrentPlayer ? '#fff' : '#0f172a'}
        fontSize={isCurrentPlayer ? 14 : 12}
        fontWeight={700}
        fontFamily="JetBrains Mono, monospace"
      >
        {player.id + 1}
      </text>
    </motion.g>
  );
}
