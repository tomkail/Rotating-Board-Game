import { motion } from 'framer-motion';
import type { Player } from '../types/game';
import { getPositionOnRing } from '../hooks/useRingGeometry';

interface PlayerResourcesProps {
  player: Player;
  resources: number;
  victoryPoints: number;
  rotationPoints: number;
  slotCount: number;
  centerX: number;
  centerY: number;
  radius: number;
}

export function PlayerResources({
  player,
  resources,
  victoryPoints,
  rotationPoints,
  slotCount,
  centerX,
  centerY,
  radius
}: PlayerResourcesProps) {
  // Calculate the angle for this player's slot position (same as player token)
  const slotAngle = 360 / slotCount;
  const angle = -90 + player.slotIndex * slotAngle;
  
  const position = getPositionOnRing(centerX, centerY, radius, angle);

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: player.id * 0.1 + 0.2
      }}
    >
      {/* Background panel */}
      <rect
        x={position.x - 70}
        y={position.y - 45}
        width={140}
        height={90}
        rx={10}
        fill="#1e293b"
        stroke={player.color}
        strokeWidth={3}
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
      />

      {/* Player label */}
      <text
        x={position.x}
        y={position.y - 25}
        textAnchor="middle"
        dominantBaseline="central"
        fill={player.color}
        fontSize={14}
        fontWeight={700}
        fontFamily="JetBrains Mono, monospace"
      >
        Player {player.id + 1}
      </text>

      {/* Resources */}
      <g transform={`translate(${position.x}, ${position.y - 5})`}>
        <text
          x={-35}
          y={0}
          textAnchor="end"
          dominantBaseline="central"
          fill="#94a3b8"
          fontSize={16}
          fontFamily="JetBrains Mono, monospace"
        >
          ◆
        </text>
        <text
          x={-15}
          y={0}
          textAnchor="start"
          dominantBaseline="central"
          fill="#e2e8f0"
          fontSize={16}
          fontWeight={600}
          fontFamily="JetBrains Mono, monospace"
        >
          {resources}
        </text>
      </g>

      {/* Victory Points */}
      <g transform={`translate(${position.x}, ${position.y + 15})`}>
        <text
          x={-35}
          y={0}
          textAnchor="end"
          dominantBaseline="central"
          fill="#94a3b8"
          fontSize={16}
          fontFamily="JetBrains Mono, monospace"
        >
          ★
        </text>
        <text
          x={-15}
          y={0}
          textAnchor="start"
          dominantBaseline="central"
          fill="#e2e8f0"
          fontSize={16}
          fontWeight={600}
          fontFamily="JetBrains Mono, monospace"
        >
          {victoryPoints}
        </text>
      </g>

      {/* Rotation Points */}
      <g transform={`translate(${position.x}, ${position.y + 35})`}>
        <text
          x={-35}
          y={0}
          textAnchor="end"
          dominantBaseline="central"
          fill="#94a3b8"
          fontSize={16}
          fontFamily="JetBrains Mono, monospace"
        >
          🔄
        </text>
        <text
          x={-15}
          y={0}
          textAnchor="start"
          dominantBaseline="central"
          fill="#e2e8f0"
          fontSize={16}
          fontWeight={600}
          fontFamily="JetBrains Mono, monospace"
        >
          {rotationPoints}
        </text>
      </g>
    </motion.g>
  );
}
