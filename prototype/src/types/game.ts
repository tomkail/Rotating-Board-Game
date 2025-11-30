// Types for the Ring Board Game

export interface Player {
  id: number;
  slotIndex: number;
  color: string;
}

// Tile type definitions
export type TileTypeId = 
  | 'resource'
  | 'victory'
  | 'movement'
  | 'swap'
  | 'skip'
  | 'block'
  | 'transfer';

export interface TileTypeConfig {
  id: TileTypeId;
  name: string;
  description: string;
  icon: string;
  color: string;
  hasValue?: boolean;      // Can have a numeric value (points, movement amount)
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
  hasOwner?: boolean;      // Can be owned by a player (colored variants)
}

// The actual tile data placed on the board
export interface TileData {
  typeId: TileTypeId;
  value?: number;          // For tiles with numeric values
  ownerId?: number;        // For tiles with player ownership
}

export interface TileSlot {
  id: number;
  filled: boolean;
  tile?: TileData;
}

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

// Tile type definitions
export const TILE_TYPES: TileTypeConfig[] = [
  {
    id: 'resource',
    name: 'Resource',
    description: 'Gain resources when landed on',
    icon: '◆',
    color: '#4ade80',
    hasValue: true,
    minValue: 1,
    maxValue: 5,
    defaultValue: 1
  },
  {
    id: 'victory',
    name: 'Victory',
    description: 'Convert resources to victory points',
    icon: '★',
    color: '#fbbf24',
    hasValue: true,
    minValue: 1,
    maxValue: 3,
    defaultValue: 1
  },
  {
    id: 'movement',
    name: 'Movement',
    description: 'Move a player by X tiles',
    icon: '→',
    color: '#60a5fa',
    hasValue: true,
    minValue: 1,
    maxValue: 4,
    defaultValue: 1
  },
  {
    id: 'swap',
    name: 'Swap',
    description: 'Swap any two tiles on the board',
    icon: '⇄',
    color: '#c084fc'
  },
  {
    id: 'skip',
    name: 'Skip To',
    description: 'Skip to this player\'s turn',
    icon: '⏭',
    color: '#f472b6',
    hasOwner: true
  },
  {
    id: 'block',
    name: 'Block',
    description: 'Block a player from taking a turn',
    icon: '⛔',
    color: '#ef4444',
    hasOwner: true
  },
  {
    id: 'transfer',
    name: 'Transfer',
    description: 'Give resources to tile owner',
    icon: '⬇',
    color: '#f97316',
    hasOwner: true
  }
];

export function getTileTypeConfig(typeId: TileTypeId): TileTypeConfig {
  return TILE_TYPES.find(t => t.id === typeId)!;
}
