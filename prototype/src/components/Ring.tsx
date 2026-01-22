import { useMemo } from 'react';
import type { TileSlot as TileSlotType, ArcGeometry, Player, TileData } from '../types/game';
import { Tile } from './Tile';

/**
 * Converts degrees to radians
 */
function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Creates a combined outline path for a contiguous group of slots
 */
function createGroupOutlinePath(
  selectedIndices: number[],
  geometries: ArcGeometry[],
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  slotCount: number
): string | { isFullRing: true; centerX: number; centerY: number; innerRadius: number; outerRadius: number } {
  if (selectedIndices.length === 0) return '';
  
  // If all slots are selected, return a special marker for full ring
  if (selectedIndices.length === slotCount) {
    return { isFullRing: true, centerX, centerY, innerRadius, outerRadius };
  }
  
  // Sort indices to find contiguous ranges
  const sorted = [...selectedIndices].sort((a, b) => a - b);
  
  // Check if the group wraps around (e.g., slots 14, 15, 0, 1)
  // Find the actual start by looking for the largest gap
  let maxGap = 0;
  let gapAfterIndex = -1;
  
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[(i + 1) % sorted.length];
    const gap = (next - current + slotCount) % slotCount;
    if (gap > maxGap) {
      maxGap = gap;
      gapAfterIndex = i;
    }
  }
  
  // Reorder so we start after the largest gap
  const reordered = [
    ...sorted.slice(gapAfterIndex + 1),
    ...sorted.slice(0, gapAfterIndex + 1)
  ];
  
  const firstSlot = reordered[0];
  const lastSlot = reordered[reordered.length - 1];
  
  const firstGeom = geometries[firstSlot];
  const lastGeom = geometries[lastSlot];
  
  // Calculate the total angular span
  let totalAngle = lastGeom.endAngle - firstGeom.startAngle;
  if (totalAngle < 0) totalAngle += 360;
  const largeArcFlag = totalAngle > 180 ? 1 : 0;
  
  // Calculate corner points
  const startRad = degToRad(firstGeom.startAngle);
  const endRad = degToRad(lastGeom.endAngle);
  
  const outerStartX = centerX + outerRadius * Math.cos(startRad);
  const outerStartY = centerY + outerRadius * Math.sin(startRad);
  const outerEndX = centerX + outerRadius * Math.cos(endRad);
  const outerEndY = centerY + outerRadius * Math.sin(endRad);
  const innerStartX = centerX + innerRadius * Math.cos(startRad);
  const innerStartY = centerY + innerRadius * Math.sin(startRad);
  const innerEndX = centerX + innerRadius * Math.cos(endRad);
  const innerEndY = centerY + innerRadius * Math.sin(endRad);
  
  // Build the combined path
  const path = [
    `M ${outerStartX} ${outerStartY}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
    'Z'
  ].join(' ');
  
  return path;
}

interface RingProps {
  slots: TileSlotType[];
  geometries: ArcGeometry[];
  canonicalTilePath: string;
  centerX: number;
  centerY: number;
  players: Player[];
  innerRadius: number;
  outerRadius: number;
  onSlotClick: (slotIndex: number) => void;
  onGroupSelect?: (slotIndex: number) => void;
  onTileHover?: (tile: TileData | null) => void;
  selectedGroup?: Set<number> | null;
  hasTileSelected?: boolean;
  replaceableSlots?: Set<number> | null;
  slotCount?: number;
}

export function Ring({
  slots,
  geometries,
  canonicalTilePath,
  centerX,
  centerY,
  players,
  innerRadius,
  outerRadius,
  onSlotClick,
  onGroupSelect,
  onTileHover,
  selectedGroup,
  hasTileSelected,
  replaceableSlots,
  slotCount = 16
}: RingProps) {
  // Default: all slots are replaceable when a tile is selected
  const canReplace = (index: number) => {
    if (!hasTileSelected) return false;
    if (replaceableSlots) return replaceableSlots.has(index);
    return true; // Currently all slots can be replaced
  };

  // Calculate the combined group outline path (or full ring marker)
  const groupOutlineData = useMemo(() => {
    if (!selectedGroup || selectedGroup.size === 0) return null;
    return createGroupOutlinePath(
      Array.from(selectedGroup),
      geometries,
      centerX,
      centerY,
      innerRadius,
      outerRadius,
      slotCount
    );
  }, [selectedGroup, geometries, centerX, centerY, innerRadius, outerRadius, slotCount]);

  const isFullRing = groupOutlineData && typeof groupOutlineData === 'object' && 'isFullRing' in groupOutlineData;
  const groupOutlinePath = typeof groupOutlineData === 'string' ? groupOutlineData : null;

  return (
    <g>
      {/* Static slot backgrounds - always drawn, never move */}
      {geometries.map((geometry, index) => (
        <g key={`slot-bg-${index}`}>
          {/* Slot outline */}
          <path
            d={geometry.path}
            fill="none"
            stroke="#334155"
            strokeWidth={2}
            strokeDasharray="8 4"
          />
          
          {/* Clickable area for empty slots */}
          {!slots[index].filled && (
            <path
              d={geometry.path}
              fill={canReplace(index) ? "#22c55e" : "#1e293b"}
              fillOpacity={canReplace(index) ? 0.25 : 0.3}
              style={{ cursor: hasTileSelected ? 'pointer' : 'default' }}
              onClick={(e) => {
                e.stopPropagation();
                onSlotClick(index);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.setAttribute('fill-opacity', canReplace(index) ? '0.4' : '0.5');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.setAttribute('fill-opacity', canReplace(index) ? '0.25' : '0.3');
              }}
            />
          )}
        </g>
      ))}
      
      {/* Tiles layer - animate via rotation transforms */}
      {slots.map((slot, index) => 
        slot.filled && slot.tile && geometries[index] ? (
          <Tile
            key={slot.tile.id}
            tile={slot.tile}
            canonicalPath={canonicalTilePath}
            players={players}
            rotationAngle={geometries[index].midAngle}
            centerX={centerX}
            centerY={centerY}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            onHover={onTileHover}
            onGroupSelect={onGroupSelect ? () => onGroupSelect(index) : undefined}
          />
        ) : null
      )}

      {/* Replaceable tile highlight layer - shown when a palette tile is selected */}
      {hasTileSelected && geometries.map((geometry, index) => (
        canReplace(index) && (
          <g key={`replaceable-${index}`} style={{ pointerEvents: 'none' }}>
            {/* Green glow for replaceable slots */}
            <path
              d={geometry.path}
              fill="none"
              stroke="#22c55e"
              strokeWidth={6}
              opacity={0.5}
            />
            <path
              d={geometry.path}
              fill="none"
              stroke="#4ade80"
              strokeWidth={3}
              opacity={0.8}
            />
          </g>
        )
      ))}

      {/* Clickable overlay for replacing filled tiles */}
      {hasTileSelected && geometries.map((geometry, index) => (
        slots[index].filled && canReplace(index) && (
          <path
            key={`replace-click-${index}`}
            d={geometry.path}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onSlotClick(index);
            }}
          />
        )
      ))}

      {/* Selection highlight layer - drawn ON TOP of tiles as a single group outline */}
      {groupOutlinePath && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Outer glow */}
          <path
            d={groupOutlinePath}
            fill="none"
            stroke="#60a5fa"
            strokeWidth={12}
            opacity={0.4}
          />
          {/* Main selection outline */}
          <path
            d={groupOutlinePath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={6}
            opacity={1}
          />
          {/* Inner bright highlight */}
          <path
            d={groupOutlinePath}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            opacity={0.7}
          />
        </g>
      )}

      {/* Full ring selection highlight - when all tiles are selected */}
      {isFullRing && (
        <g style={{ pointerEvents: 'none' }}>
          {/* Outer glow - outer circle */}
          <circle cx={centerX} cy={centerY} r={outerRadius} fill="none" stroke="#60a5fa" strokeWidth={12} opacity={0.4} />
          {/* Outer glow - inner circle */}
          <circle cx={centerX} cy={centerY} r={innerRadius} fill="none" stroke="#60a5fa" strokeWidth={12} opacity={0.4} />
          {/* Main outline - outer circle */}
          <circle cx={centerX} cy={centerY} r={outerRadius} fill="none" stroke="#38bdf8" strokeWidth={6} opacity={1} />
          {/* Main outline - inner circle */}
          <circle cx={centerX} cy={centerY} r={innerRadius} fill="none" stroke="#38bdf8" strokeWidth={6} opacity={1} />
          {/* Inner highlight - outer circle */}
          <circle cx={centerX} cy={centerY} r={outerRadius} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.7} />
          {/* Inner highlight - inner circle */}
          <circle cx={centerX} cy={centerY} r={innerRadius} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.7} />
        </g>
      )}
    </g>
  );
}
