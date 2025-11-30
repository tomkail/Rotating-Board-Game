// Types for the Ring Board Game

export interface TileSlot {
  id: number;
  filled: boolean;
  tileType?: TileType;
}

export type TileType = 
  | 'resource'
  | 'victory'
  | 'movement'
  | 'swap'
  | 'generic';

export interface BoardState {
  slots: TileSlot[];
  rotationOffset: number;
  slotCount: number;
}

export interface ArcGeometry {
  path: string;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  centerX: number;
  centerY: number;
}

export type RotationDirection = 'clockwise' | 'counterclockwise';
