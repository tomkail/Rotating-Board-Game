import { motion, AnimatePresence } from 'framer-motion';
import type { TileData, Player } from '../types/game';
import { getTileTypeConfig } from '../types/game';

interface CenterInfoProps {
  hoveredTile: TileData | null;
  players: Player[];
  centerX: number;
  centerY: number;
  radius: number;
}

export function CenterInfo({ hoveredTile, players, centerX, centerY, radius }: CenterInfoProps) {
  if (!hoveredTile) {
    return (
      <g>
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="#1e293b"
          stroke="#334155"
          strokeWidth={2}
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#64748b"
          fontSize={16}
          fontFamily="JetBrains Mono, monospace"
          style={{ pointerEvents: 'none' }}
        >
          Hover a tile
        </text>
      </g>
    );
  }

  const config = getTileTypeConfig(hoveredTile.typeId);
  
  // Determine tile color - use owner color if applicable
  let fillColor = config.color;
  let ownerName: string | undefined;
  if (config.hasOwner && hoveredTile.ownerId !== undefined) {
    const owner = players.find(p => p.id === hoveredTile.ownerId);
    if (owner) {
      fillColor = owner.color;
      ownerName = `Player ${owner.id + 1}`;
    }
  }

  const infoLines = [
    config.name,
    config.description,
    config.hasValue && hoveredTile.value !== undefined ? `Value: ${hoveredTile.value}` : null,
    hoveredTile.typeId === 'movement' && hoveredTile.direction ? `Direction: ${hoveredTile.direction === 'left' ? 'Left (◀)' : 'Right (▶)'}` : null,
    ownerName ? `Owner: ${ownerName}` : null
  ].filter(Boolean);

  return (
    <AnimatePresence>
      <motion.g
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="#1e293b"
          stroke={fillColor}
          strokeWidth={4}
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}
        />

        {/* Content */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          {/* Icon */}
          <text
            x={0}
            y={-radius * 0.3}
            textAnchor="middle"
            dominantBaseline="central"
            fill={fillColor}
            fontSize={radius * 0.4}
            fontFamily="JetBrains Mono, monospace"
            style={{ pointerEvents: 'none' }}
          >
            {config.icon}
          </text>

          {/* Title */}
          <text
            x={0}
            y={radius * 0.05}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#e2e8f0"
            fontSize={radius * 0.12}
            fontWeight={600}
            fontFamily="JetBrains Mono, monospace"
            style={{ pointerEvents: 'none' }}
          >
            {config.name}
          </text>

          {/* Description - wrap if needed */}
          <text
            x={0}
            y={radius * 0.25}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#94a3b8"
            fontSize={radius * 0.08}
            fontFamily="JetBrains Mono, monospace"
            style={{ pointerEvents: 'none' }}
          >
            {config.description}
          </text>

          {/* Additional info */}
          {infoLines.length > 2 && (
            <>
              {config.hasValue && hoveredTile.value !== undefined && (
                <text
                  x={0}
                  y={radius * 0.4}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#64748b"
                  fontSize={radius * 0.07}
                  fontFamily="JetBrains Mono, monospace"
                  style={{ pointerEvents: 'none' }}
                >
                  Value: {hoveredTile.value}
                </text>
              )}
              {ownerName && (
                <text
                  x={0}
                  y={radius * 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#64748b"
                  fontSize={radius * 0.07}
                  fontFamily="JetBrains Mono, monospace"
                  style={{ pointerEvents: 'none' }}
                >
                  {ownerName}
                </text>
              )}
            </>
          )}
        </g>
      </motion.g>
    </AnimatePresence>
  );
}
