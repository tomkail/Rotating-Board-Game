import { useState, useCallback, useEffect, useMemo } from 'react';
import type { TileSlot as TileSlotType, RotationDirection, Player, TileData, GameAction } from '../types/game';
import { useRingGeometry } from '../hooks/useRingGeometry';
import { Ring } from './Ring';
import { RotationControls } from './RotationControls';
import { PlayerToken } from './PlayerToken';
import { PlayerResources } from './PlayerResources';
import { GameSetup, PLAYER_COLORS } from './GameSetup';
import { TilePalette } from './TilePalette';
import { ActionPanel } from './ActionPanel';
import { CenterInfo } from './CenterInfo';

const SLOT_COUNT = 16;
const SVG_SIZE = 900;
const CENTER = SVG_SIZE / 2;
const OUTER_RADIUS = 250;
const INNER_RADIUS = 160;
const PLAYER_RING_RADIUS = OUTER_RADIUS + 35;

const STORAGE_KEY = 'ring-board-game-save';

interface SavedGameState {
  version: number;
  gamePhase: GamePhase;
  playerCount: number;
  slots: TileSlotType[];
  rotationOffset: number;
  currentPlayerIndex: number;
}

function createInitialSlots(count: number): TileSlotType[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    filled: false
  }));
}

function createPlayers(playerCount: number, slotCount: number): Player[] {
  if (playerCount === 0) return [];
  
  const players: Player[] = [];
  const spacing = slotCount / playerCount;
  
  for (let i = 0; i < playerCount; i++) {
    const idealPosition = i * spacing;
    const slotIndex = Math.round(idealPosition) % slotCount;
    
    players.push({
      id: i,
      slotIndex,
      color: PLAYER_COLORS[i]
    });
  }
  
  return players;
}

function saveGameState(state: SavedGameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save game state:', e);
  }
}

function loadGameState(): SavedGameState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const state = JSON.parse(saved) as SavedGameState;
    
    if (
      typeof state.version !== 'number' ||
      typeof state.gamePhase !== 'string' ||
      typeof state.playerCount !== 'number' ||
      !Array.isArray(state.slots) ||
      typeof state.rotationOffset !== 'number' ||
      state.slots.length !== SLOT_COUNT
    ) {
      throw new Error('Invalid saved state structure');
    }
    
    for (const slot of state.slots) {
      if (typeof slot.id !== 'number' || typeof slot.filled !== 'boolean') {
        throw new Error('Invalid slot structure');
      }
    }
    
    return state;
  } catch (e) {
    console.warn('Failed to load game state, clearing save:', e);
    clearGameState();
    return null;
  }
}

function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear game state:', e);
  }
}

type GamePhase = 'setup' | 'playing';

// Initialize state from localStorage
function getInitialState() {
  const savedState = loadGameState();
  if (savedState && savedState.gamePhase === 'playing') {
    return {
      gamePhase: savedState.gamePhase as GamePhase,
      players: createPlayers(savedState.playerCount, SLOT_COUNT),
      slots: savedState.slots,
      rotationOffset: savedState.rotationOffset,
      currentPlayerIndex: savedState.currentPlayerIndex ?? 0
    };
  }
  return {
    gamePhase: 'setup' as GamePhase,
    players: [] as Player[],
    slots: createInitialSlots(SLOT_COUNT),
    rotationOffset: 0,
    currentPlayerIndex: 0
  };
}

export function Board() {
  const initialState = useMemo(() => getInitialState(), []);
  
  const [gamePhase, setGamePhase] = useState<GamePhase>(initialState.gamePhase);
  const [players, setPlayers] = useState<Player[]>(initialState.players);
  const [slots, setSlots] = useState<TileSlotType[]>(initialState.slots);
  const [rotationOffset, setRotationOffset] = useState(initialState.rotationOffset);
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(initialState.currentPlayerIndex);
  const [hasRotatedThisTurn, setHasRotatedThisTurn] = useState(false);
  const [hasPlacedTileThisTurn, setHasPlacedTileThisTurn] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<TileData | null>(null);
  const [playerResources, setPlayerResources] = useState<Record<number, number>>(() => {
    const resources: Record<number, number> = {};
    initialState.players.forEach(player => {
      resources[player.id] = 0;
    });
    return resources;
  });
  const [playerVictoryPoints, setPlayerVictoryPoints] = useState<Record<number, number>>(() => {
    const points: Record<number, number> = {};
    initialState.players.forEach(player => {
      points[player.id] = 0;
    });
    return points;
  });
  const [playerRotationPoints, setPlayerRotationPoints] = useState<Record<number, number>>(() => {
    const points: Record<number, number> = {};
    initialState.players.forEach(player => {
      points[player.id] = 3;
    });
    return points;
  });

  const currentPlayer = players[currentPlayerIndex] || players[0];

  const geometries = useRingGeometry({
    slotCount: SLOT_COUNT,
    innerRadius: INNER_RADIUS,
    outerRadius: OUTER_RADIUS,
    centerX: CENTER,
    centerY: CENTER,
    gapAngle: 3
  });

  // Build available actions based on current game state
  const availableActions = useMemo((): GameAction[] => {
    const hasEmptySlots = slots.some(s => !s.filled);
    
    return [
      {
        type: 'place_tile',
        name: 'Place Tile',
        description: selectedTile 
          ? 'Click an empty slot on the board' 
          : 'Select a tile from the palette first',
        icon: '🔲',
        enabled: hasEmptySlots && !!selectedTile && !hasPlacedTileThisTurn
      },
      {
        type: 'rotate_board',
        name: 'Rotate Board',
        description: hasRotatedThisTurn 
          ? 'Already rotated this turn' 
          : 'Use the rotation buttons',
        icon: '🔄',
        enabled: !hasRotatedThisTurn
      },
      {
        type: 'end_turn',
        name: 'End Turn',
        description: `Pass to Player ${((currentPlayerIndex + 1) % players.length) + 1}`,
        icon: '⏭️',
        enabled: true
      }
    ];
  }, [slots, selectedTile, hasRotatedThisTurn, hasPlacedTileThisTurn, currentPlayerIndex, players.length]);

  // Save state whenever it changes
  useEffect(() => {
    const state: SavedGameState = {
      version: 1,
      gamePhase,
      playerCount: players.length,
      slots,
      rotationOffset,
      currentPlayerIndex
    };
    
    if (gamePhase === 'playing') {
      saveGameState(state);
    } else {
      clearGameState();
    }
  }, [gamePhase, players.length, slots, rotationOffset, currentPlayerIndex]);

  const handleStartGame = useCallback((playerCount: number) => {
    const newPlayers = createPlayers(playerCount, SLOT_COUNT);
    setPlayers(newPlayers);
    setSlots(createInitialSlots(SLOT_COUNT));
    setRotationOffset(0);
    setSelectedTile(null);
    setCurrentPlayerIndex(0);
    setHasRotatedThisTurn(false);
    setHasPlacedTileThisTurn(false);
    
    // Initialize resources, victory points, and rotation points for each player
    const initialResources: Record<number, number> = {};
    const initialVictoryPoints: Record<number, number> = {};
    const initialRotationPoints: Record<number, number> = {};
    newPlayers.forEach(player => {
      initialResources[player.id] = 0;
      initialVictoryPoints[player.id] = 0;
      initialRotationPoints[player.id] = 3; // Start with 3 rotation points
    });
    setPlayerResources(initialResources);
    setPlayerVictoryPoints(initialVictoryPoints);
    setPlayerRotationPoints(initialRotationPoints);
    
    setGamePhase('playing');
  }, []);

  const handleNewGame = useCallback(() => {
    setGamePhase('setup');
    setPlayers([]);
    setSelectedTile(null);
    setCurrentPlayerIndex(0);
    setHasRotatedThisTurn(false);
    setHasPlacedTileThisTurn(false);
    setPlayerResources({});
    setPlayerVictoryPoints({});
    setPlayerRotationPoints({});
    clearGameState();
  }, []);

  const handleSlotClick = useCallback((slotIndex: number) => {
    if (!selectedTile || hasPlacedTileThisTurn) return;
    
    setSlots(currentSlots => {
      const slot = currentSlots[slotIndex];
      if (slot.filled) return currentSlots;

      const newSlots = [...currentSlots];
      newSlots[slotIndex] = {
        ...slot,
        filled: true,
        tile: { ...selectedTile }
      };
      return newSlots;
    });
    setHasPlacedTileThisTurn(true);
    setSelectedTile(null);
  }, [selectedTile, hasPlacedTileThisTurn]);

  // Calculate which slot a player is aligned with after rotation
  const getPlayerEffectiveSlot = useCallback((player: Player, rotation: number): number => {
    const slotAngle = 360 / SLOT_COUNT;
    // When board rotates clockwise, tiles move clockwise, so players effectively move counter-clockwise
    const rotationSlots = rotation / slotAngle;
    const effectiveSlot = (player.slotIndex - Math.round(rotationSlots) + SLOT_COUNT) % SLOT_COUNT;
    return effectiveSlot;
  }, []);

  // Trigger tile effects for players on tiles after rotation
  const triggerTileEffects = useCallback((newRotationOffset: number) => {
    players.forEach(player => {
      const effectiveSlot = getPlayerEffectiveSlot(player, newRotationOffset);
      const slot = slots[effectiveSlot];
      
      if (slot?.filled && slot.tile) {
        const tile = slot.tile;
        
        switch (tile.typeId) {
          case 'resource': {
            // Gain resources equal to tile value
            const resourceGain = tile.value ?? 1;
            setPlayerResources(current => ({
              ...current,
              [player.id]: (current[player.id] ?? 0) + resourceGain
            }));
            break;
          }
          
          case 'victory': {
            // Convert resources to victory points
            const conversionRate = tile.value ?? 1;
            const currentResources = playerResources[player.id] ?? 0;
            if (currentResources >= conversionRate) {
              setPlayerResources(current => ({
                ...current,
                [player.id]: current[player.id] - conversionRate
              }));
              setPlayerVictoryPoints(current => ({
                ...current,
                [player.id]: (current[player.id] ?? 0) + conversionRate
              }));
            }
            break;
          }
          
          case 'movement': {
            // Move player by X slots
            const moveAmount = tile.value ?? 1;
            setPlayers(current => current.map(p => 
              p.id === player.id 
                ? { ...p, slotIndex: (p.slotIndex + moveAmount) % SLOT_COUNT }
                : p
            ));
            break;
          }
          
          case 'transfer': {
            // Give all resources to tile owner
            if (tile.ownerId !== undefined && tile.ownerId !== player.id) {
              const resourcesToTransfer = playerResources[player.id] ?? 0;
              if (resourcesToTransfer > 0) {
                setPlayerResources(current => ({
                  ...current,
                  [player.id]: 0,
                  [tile.ownerId!]: (current[tile.ownerId!] ?? 0) + resourcesToTransfer
                }));
              }
            }
            break;
          }
          
          case 'skip': {
            // Skip to tile owner's turn
            if (tile.ownerId !== undefined) {
              setCurrentPlayerIndex(tile.ownerId);
            }
            break;
          }
          
          case 'block': {
            // Block the tile owner from taking a turn
            // This would need additional state tracking blocked players
            // For now, we'll just note it happened
            break;
          }
          
          case 'swap': {
            // Swap any two tiles - this requires player interaction
            // For now, we'll skip automatic execution
            break;
          }
        }
      }
    });
  }, [players, slots, playerResources, getPlayerEffectiveSlot]);

  const handleRotate = useCallback((direction: RotationDirection) => {
    if (hasRotatedThisTurn) return;
    
    const slotAngle = 360 / SLOT_COUNT;
    const delta = direction === 'clockwise' ? slotAngle : -slotAngle;
    const newRotationOffset = rotationOffset + delta;
    
    setRotationOffset(newRotationOffset);
    setHasRotatedThisTurn(true);
    
    // Trigger tile effects after rotation completes
    // Use setTimeout to allow animation to start, then trigger effects
    setTimeout(() => {
      triggerTileEffects(newRotationOffset);
    }, 100);
  }, [hasRotatedThisTurn, rotationOffset, triggerTileEffects]);

  const handleEndTurn = useCallback(() => {
    setCurrentPlayerIndex(current => (current + 1) % players.length);
    setHasRotatedThisTurn(false);
    setHasPlacedTileThisTurn(false);
    setSelectedTile(null);
  }, [players.length]);

  const handleAction = useCallback((actionType: string) => {
    switch (actionType) {
      case 'end_turn':
        handleEndTurn();
        break;
      // Other actions are handled by their respective UI elements
    }
  }, [handleEndTurn]);

  const handleTileHover = useCallback((tile: TileData | null) => {
    setHoveredTile(tile);
  }, []);

  if (gamePhase === 'setup') {
    return (
      <div className="game-column">
        <header className="game-header">
          <h1>Ring Board Game</h1>
          <p className="subtitle">Click empty slots to place tiles • Use buttons to rotate the ring</p>
        </header>
        <div className="board-container">
          <GameSetup onStartGame={handleStartGame} />
        </div>
      </div>
    );
  }

  return (
    <div className="board-layout">
      <TilePalette
        players={players}
        selectedTile={selectedTile}
        onSelectTile={hasPlacedTileThisTurn ? () => {} : setSelectedTile}
      />

      <div className="game-column">
        <header className="game-header">
          <h1>Ring Board Game</h1>
          <p className="subtitle">Click empty slots to place tiles • Use buttons to rotate the ring</p>
        </header>

        <div className="board-container">
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="board-svg"
          >
            {/* Outer ring track for players */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={PLAYER_RING_RADIUS}
              fill="none"
              stroke="#1e293b"
              strokeWidth={1}
              strokeDasharray="4 4"
            />

            {/* Background circle for tile ring */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={OUTER_RADIUS + 10}
              fill="none"
              stroke="#1e293b"
              strokeWidth={1}
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r={INNER_RADIUS - 10}
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth={1}
            />

            {/* The rotating ring with all slots */}
            <Ring
              slots={slots}
              geometries={geometries}
              rotationOffset={rotationOffset}
              centerX={CENTER}
              centerY={CENTER}
              players={players}
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              onSlotClick={handleSlotClick}
              onTileHover={handleTileHover}
            />

            {/* Player tokens on outer ring */}
            {players.map(player => (
              <PlayerToken
                key={player.id}
                player={player}
                slotCount={SLOT_COUNT}
                centerX={CENTER}
                centerY={CENTER}
                radius={PLAYER_RING_RADIUS}
                isCurrentPlayer={player.id === currentPlayerIndex}
              />
            ))}

            {/* Player resources positioned at same angle as player tokens */}
            {players.map(player => (
              <PlayerResources
                key={`resources-${player.id}`}
                player={player}
                resources={playerResources[player.id] ?? 0}
                victoryPoints={playerVictoryPoints[player.id] ?? 0}
                rotationPoints={playerRotationPoints[player.id] ?? 0}
                slotCount={SLOT_COUNT}
                centerX={CENTER}
                centerY={CENTER}
                radius={PLAYER_RING_RADIUS + 50}
              />
            ))}

            {/* Center info display */}
            <CenterInfo
              hoveredTile={hoveredTile}
              players={players}
              centerX={CENTER}
              centerY={CENTER}
              radius={INNER_RADIUS - 20}
            />
          </svg>

          <RotationControls onRotate={handleRotate} disabled={hasRotatedThisTurn} />

          <div className="info-panel">
            <p>Players: {players.length}</p>
            <p>Tiles: {slots.filter(s => s.filled).length} / {SLOT_COUNT}</p>
            <p>Rotation: {rotationOffset}°</p>
            <button className="new-game-btn" onClick={handleNewGame}>
              New Game
            </button>
          </div>
        </div>
      </div>

      <ActionPanel
        currentPlayer={currentPlayer}
        actions={availableActions}
        selectedTile={selectedTile}
        onAction={handleAction}
      />
    </div>
  );
}
