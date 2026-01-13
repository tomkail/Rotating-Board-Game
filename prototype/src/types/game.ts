// Types for the Ring Board Game

export interface Player {
  id: number;
  slotIndex: number; // Which tile slot the player is aligned with
  color: string;
}

export interface TileSlot {
  id: number;
  filled: boolean;
  tile?: TileData; // Changed from tileType to tile
}

export type TileTypeId =
  | 'resource'
  | 'victory'
  | 'movement'
  | 'swap'
  | 'skip'
  | 'block'
  | 'transfer'
  | 'blank';

export type MovementDirection = 'left' | 'right';

export interface TileData {
  id: string; // Unique identifier for the tile instance
  typeId: TileTypeId;
  value?: number; // For resource, victory, movement
  ownerId?: number; // For skip, block, transfer
  direction?: MovementDirection; // For movement tiles
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

export type GamePhase = 'setup' | 'playing';

export type ActionType = 'place_tile' | 'rotate_board' | 'end_turn';

export interface GameAction {
  type: ActionType;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

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
  hasDirection?: boolean;  // Can have a direction (left/right) for movement tiles
}

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
    defaultValue: 1,
    hasDirection: true
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
  },
  {
    id: 'blank',
    name: 'Blank',
    description: 'Empty tile with no effect',
    icon: '□',
    color: '#64748b'
  }
];

export function getTileTypeConfig(typeId: TileTypeId): TileTypeConfig {
  return TILE_TYPES.find(t => t.id === typeId)!;
}
