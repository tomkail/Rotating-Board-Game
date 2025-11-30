import { useMemo } from 'react';
import type { ArcGeometry } from '../types/game';

interface RingGeometryConfig {
  slotCount: number;
  innerRadius: number;
  outerRadius: number;
  centerX: number;
  centerY: number;
  gapAngle?: number; // Gap between slots in degrees
}

/**
 * Converts degrees to radians
 */
function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the SVG path for an arc segment (annular sector)
 */
function createArcPath(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const startRad = degToRad(startAngle);
  const endRad = degToRad(endAngle);

  // Calculate the four corner points of the arc segment
  const outerStartX = centerX + outerRadius * Math.cos(startRad);
  const outerStartY = centerY + outerRadius * Math.sin(startRad);
  const outerEndX = centerX + outerRadius * Math.cos(endRad);
  const outerEndY = centerY + outerRadius * Math.sin(endRad);
  const innerStartX = centerX + innerRadius * Math.cos(startRad);
  const innerStartY = centerY + innerRadius * Math.sin(startRad);
  const innerEndX = centerX + innerRadius * Math.cos(endRad);
  const innerEndY = centerY + innerRadius * Math.sin(endRad);

  // Determine if we need the large arc flag
  const angleDiff = endAngle - startAngle;
  const largeArcFlag = angleDiff > 180 ? 1 : 0;

  // Build the path:
  // 1. Move to outer start
  // 2. Arc to outer end
  // 3. Line to inner end
  // 4. Arc back to inner start (reverse direction)
  // 5. Close path
  const path = [
    `M ${outerStartX} ${outerStartY}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerEndX} ${innerEndY}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
    'Z'
  ].join(' ');

  return path;
}

/**
 * Hook that generates SVG arc geometry for each slot in the ring
 */
export function useRingGeometry(config: RingGeometryConfig): ArcGeometry[] {
  const {
    slotCount,
    innerRadius,
    outerRadius,
    centerX,
    centerY,
    gapAngle = 2 // Default 2 degree gap between slots
  } = config;

  return useMemo(() => {
    const slotAngle = 360 / slotCount;
    const effectiveSlotAngle = slotAngle - gapAngle;

    const geometries: ArcGeometry[] = [];

    for (let i = 0; i < slotCount; i++) {
      // Offset by half a slot so tile centers align with compass points (N, E, S, W)
      const baseAngle = -90 - slotAngle / 2 + i * slotAngle;
      const startAngle = baseAngle + gapAngle / 2;
      const endAngle = baseAngle + slotAngle - gapAngle / 2;
      const midAngle = (startAngle + endAngle) / 2;

      const path = createArcPath(
        centerX,
        centerY,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle
      );

      geometries.push({
        path,
        startAngle,
        endAngle,
        midAngle,
        centerX,
        centerY
      });
    }

    return geometries;
  }, [slotCount, innerRadius, outerRadius, centerX, centerY, gapAngle]);
}

/**
 * Calculates the position on the ring at a given angle and radius
 */
export function getPositionOnRing(
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number
): { x: number; y: number } {
  const angleRad = degToRad(angleDegrees);
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad)
  };
}

