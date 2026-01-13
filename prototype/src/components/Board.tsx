import { useState, useCallback, useEffect, useMemo } from 'react';
import type { TileSlot as TileSlotType, RotationDirection, Player, TileData, GameAction } from '../types/game';
import { useRingGeometry } from '../hooks/useRingGeometry';
import { Ring } from './Ring';
import { PlayerToken } from './PlayerToken';
import { PlayerResources } from './PlayerResources';
import { GameSetup, PLAYER_COLORS } from './GameSetup';
import { TilePalette } from './TilePalette';
import { ActionPanel } from './ActionPanel';
import { CenterInfo } from './CenterInfo';
import { SaveManager } from './SaveManager';
import { DevControls } from './DevControls';

const SVG_SIZE = 900;
const CENTER = SVG_SIZE / 2;
const OUTER_RADIUS = 250;
const INNER_RADIUS = 160;
const PLAYER_RING_RADIUS = OUTER_RADIUS + 35;

const STORAGE_KEY = 'ring-board-game-save';

export interface SavedGameState {
  version: number;
  gamePhase: GamePhase;
  playerCount: number;
  slotCount: number;
  slots: TileSlotType[];
  currentPlayerIndex: number;
  playerResources?: Record<number, number>;
  playerVictoryPoints?: Record<number, number>;
  playerRotationPoints?: Record<number, number>;
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
      typeof state.slotCount !== 'number' ||
      !Array.isArray(state.slots) ||
      state.slots.length !== state.slotCount
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
      players: createPlayers(savedState.playerCount, savedState.slotCount),
      slots: savedState.slots,
      slotCount: savedState.slotCount,
      currentPlayerIndex: savedState.currentPlayerIndex ?? 0
    };
  }
  return {
    gamePhase: 'setup' as GamePhase,
    players: [] as Player[],
    slots: createInitialSlots(16),
    slotCount: 16,
    currentPlayerIndex: 0
  };
}

export function Board() {
  const initialState = useMemo(() => getInitialState(), []);
  
  const [gamePhase, setGamePhase] = useState<GamePhase>(initialState.gamePhase);
  const [players, setPlayers] = useState<Player[]>(initialState.players);
  const [slots, setSlots] = useState<TileSlotType[]>(initialState.slots);
  const [slotCount, setSlotCount] = useState<number>(initialState.slotCount);
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Set<number> | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(initialState.currentPlayerIndex);
  const [hasRotatedThisTurn, setHasRotatedThisTurn] = useState(false);
  const [hasPlacedTileThisTurn, setHasPlacedTileThisTurn] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);
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

  // Undo/Redo system
  const [undoStack, setUndoStack] = useState<SavedGameState[]>([]);
  const [redoStack, setRedoStack] = useState<SavedGameState[]>([]);

  const currentPlayer = players[currentPlayerIndex] || players[0];

  const ringGeometry = useRingGeometry({
    slotCount: slotCount,
    innerRadius: INNER_RADIUS,
    outerRadius: OUTER_RADIUS,
    centerX: CENTER,
    centerY: CENTER,
    gapAngle: 3
  });
  
  const { geometries, canonicalTilePath } = ringGeometry;

  // Check if all slots are filled
  const areAllSlotsFilled = useCallback((currentSlots: TileSlotType[]): boolean => {
    return currentSlots.every(slot => slot.filled);
  }, []);

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
        name: areAllSlotsFilled(slots)
          ? 'Rotate Board'
          : selectedGroup
          ? 'Move Selected Group'
          : 'Select Tile Group',
        description: hasRotatedThisTurn 
          ? 'Already moved this turn' 
          : areAllSlotsFilled(slots)
          ? 'All tiles connected - rotate entire board'
          : selectedGroup
          ? `Click rotation buttons to move ${selectedGroup.size} tile${selectedGroup.size > 1 ? 's' : ''}`
          : 'Click a tile to select its connected group',
        icon: '🔄',
        enabled: !hasRotatedThisTurn && (!!selectedGroup || areAllSlotsFilled(slots))
      },
      {
        type: 'end_turn',
        name: 'End Turn',
        description: `Pass to Player ${((currentPlayerIndex + 1) % players.length) + 1}`,
        icon: '⏭️',
        enabled: true
      }
    ];
  }, [slots, selectedTile, selectedGroup, hasRotatedThisTurn, hasPlacedTileThisTurn, currentPlayerIndex, players.length, areAllSlotsFilled]);

  // Get current game state for saving
  const getCurrentState = useCallback((): SavedGameState | null => {
    if (gamePhase !== 'playing') return null;
    
    return {
      version: 1,
      gamePhase,
      playerCount: players.length,
      slots,
      currentPlayerIndex,
      playerResources,
      playerVictoryPoints,
      playerRotationPoints
    };
  }, [gamePhase, players.length, slots, currentPlayerIndex, playerResources, playerVictoryPoints, playerRotationPoints]);

  // Save state whenever it changes
  useEffect(() => {
    const state: SavedGameState = {
      version: 1,
      gamePhase,
      playerCount: players.length,
      slots,
      currentPlayerIndex,
      playerResources,
      playerVictoryPoints,
      playerRotationPoints
    };
    
    if (gamePhase === 'playing') {
      saveGameState(state);
    } else {
      clearGameState();
    }
  }, [gamePhase, players.length, slots, currentPlayerIndex, playerResources, playerVictoryPoints, playerRotationPoints]);

  const handleStartGame = useCallback((playerCount: number, fillWithBlanks: boolean = false, tileCount: number = 16) => {
    setSlotCount(tileCount);
    const newPlayers = createPlayers(playerCount, tileCount);
    setPlayers(newPlayers);
    
    // Create initial slots, optionally filled with blank tiles
    let initialSlots = createInitialSlots(tileCount);
    if (fillWithBlanks) {
      initialSlots = initialSlots.map(slot => ({
        ...slot,
        filled: true,
        tile: { typeId: 'blank' }
      }));
    }
    setSlots(initialSlots);
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

  const handleLoadSave = useCallback((savedState: SavedGameState) => {
    setSlotCount(savedState.slotCount);
    const newPlayers = createPlayers(savedState.playerCount, savedState.slotCount);
    setPlayers(newPlayers);
    setSlots(savedState.slots);
    setCurrentPlayerIndex(savedState.currentPlayerIndex ?? 0);
    setHasRotatedThisTurn(false);
    setHasPlacedTileThisTurn(false);
    setSelectedTile(null);
    
    // Restore player resources and victory points
    setPlayerResources(savedState.playerResources ?? {});
    setPlayerVictoryPoints(savedState.playerVictoryPoints ?? {});
    setPlayerRotationPoints(savedState.playerRotationPoints ?? {});
    
    setGamePhase('playing');
  }, []);

  const handleSlotClick = useCallback((slotIndex: number) => {
    if (!selectedTile) return;
    
    setSlots(currentSlots => {
      const newSlots = [...currentSlots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        filled: true,
        tile: { ...selectedTile }
      };
      return newSlots;
    });
    setSelectedTile(null);
  }, [selectedTile]);

  // Calculate which slot a player is aligned with after rotation
  const getPlayerEffectiveSlot = useCallback((player: Player, rotation: number): number => {
    const slotAngle = 360 / slotCount;
    // When board rotates clockwise, tiles move clockwise, so players effectively move counter-clockwise
    const rotationSlots = rotation / slotAngle;
    const effectiveSlot = (player.slotIndex - Math.round(rotationSlots) + slotCount) % slotCount;
    return effectiveSlot;
  }, [slotCount]);

  // Trigger tile effects for players on tiles
  const triggerTileEffects = useCallback((currentSlots: TileSlotType[], useRotationOffset?: number) => {
    players.forEach(player => {
      // If rotation offset is provided, use it to calculate effective slot (for full board rotation)
      // Otherwise, check the player's actual slot position directly (for group movement)
      const slotIndex = useRotationOffset !== undefined 
        ? getPlayerEffectiveSlot(player, useRotationOffset)
        : player.slotIndex;
      const slot = currentSlots[slotIndex];
      
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
            // Move player by X slots in the specified direction
            const moveAmount = tile.value ?? 1;
            const direction = tile.direction ?? 'right';
            const delta = direction === 'left' ? -moveAmount : moveAmount;
            setPlayers(current => current.map(p => 
              p.id === player.id 
                ? { ...p, slotIndex: (p.slotIndex + delta + slotCount) % slotCount }
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
          
          case 'blank': {
            // Blank tiles have no effect
            break;
          }
        }
      }
    });
  }, [players, playerResources, getPlayerEffectiveSlot, slotCount]);

  // Find all slots connected to a given slot (adjacent filled slots)
  const findConnectedGroup = useCallback((startSlotIndex: number, currentSlots: TileSlotType[]): Set<number> => {
    const group = new Set<number>();
    const visited = new Set<number>();
    const queue = [startSlotIndex];

    while (queue.length > 0) {
      const slotIndex = queue.shift()!;
      if (visited.has(slotIndex)) continue;
      visited.add(slotIndex);

      const slot = currentSlots[slotIndex];
      if (!slot.filled) continue; // Empty slots don't connect

      group.add(slotIndex);

      // Check adjacent slots (neighbors in a ring)
      const leftNeighbor = (slotIndex - 1 + slotCount) % slotCount;
      const rightNeighbor = (slotIndex + 1) % slotCount;

      if (!visited.has(leftNeighbor) && currentSlots[leftNeighbor].filled) {
        queue.push(leftNeighbor);
      }
      if (!visited.has(rightNeighbor) && currentSlots[rightNeighbor].filled) {
        queue.push(rightNeighbor);
      }
    }

    return group;
  }, [slotCount]);

  // Find the leading edge of a group in a given direction
  const getLeadingEdge = useCallback((group: Set<number>, direction: RotationDirection): number[] => {
    const step = direction === 'clockwise' ? 1 : -1;
    const leadingEdge: number[] = [];
    
    group.forEach(index => {
      const nextIndex = ((index + step) % slotCount + slotCount) % slotCount;
      // If the next slot in the direction is not in our group, this is a leading edge
      if (!group.has(nextIndex)) {
        leadingEdge.push(index);
      }
    });
    
    return leadingEdge;
  }, [slotCount]);

  // Find distance to nearest collision for a group moving in a direction
  const findDistanceToCollision = useCallback((
    group: Set<number>, 
    direction: RotationDirection, 
    workingSlots: TileSlotType[]
  ): number => {
    const step = direction === 'clockwise' ? 1 : -1;
    const leadingEdge = getLeadingEdge(group, direction);
    
    // For each leading edge tile, find distance to nearest filled slot
    let minDistance = slotCount; // Max possible distance (full circle)
    
    leadingEdge.forEach(edgeIndex => {
      for (let dist = 1; dist < slotCount; dist++) {
        const checkIndex = ((edgeIndex + step * dist) % slotCount + slotCount) % slotCount;
        if (workingSlots[checkIndex].filled && !group.has(checkIndex)) {
          minDistance = Math.min(minDistance, dist);
          break;
        }
      }
    });
    
    return minDistance;
  }, [slotCount, getLeadingEdge]);

  // Move a group by exactly `steps` positions in the working slots array
  const applyGroupMove = useCallback((
    group: Set<number>,
    direction: RotationDirection,
    steps: number,
    workingSlots: TileSlotType[]
  ): { newSlots: TileSlotType[], newGroupIndices: Set<number> } => {
    const step = direction === 'clockwise' ? steps : -steps;
    const newSlots = [...workingSlots];
    const groupArray = Array.from(group);
    
    // Build index map
    const indexMap = new Map<number, number>();
    groupArray.forEach(oldIndex => {
      const newIndex = ((oldIndex + step) % slotCount + slotCount) % slotCount;
      indexMap.set(oldIndex, newIndex);
    });
    
    // Clear old positions
    groupArray.forEach(oldIndex => {
      newSlots[oldIndex] = { ...newSlots[oldIndex], tile: undefined, filled: false };
    });
    
    // Set new positions
    groupArray.forEach(oldIndex => {
      const newIndex = indexMap.get(oldIndex)!;
      const oldSlot = workingSlots[oldIndex];
      newSlots[newIndex] = {
        ...newSlots[newIndex],
        filled: true,
        tile: oldSlot.tile
      };
    });
    
    // Calculate new group indices
    const newGroupIndices = new Set<number>();
    groupArray.forEach(oldIndex => {
      newGroupIndices.add(indexMap.get(oldIndex)!);
    });
    
    return { newSlots, newGroupIndices };
  }, [slotCount]);

  // Move a group of tiles in a direction by a specified amount (with chain collisions)
  const moveGroup = useCallback((group: Set<number>, direction: RotationDirection, currentSlots: TileSlotType[], amount: number = 1) => {
    const slotAngle = 360 / slotCount;
    const totalDelta = direction === 'clockwise' ? slotAngle * amount : -slotAngle * amount;
    const newRotationOffset = rotationOffset + totalDelta;

    // Update rotation offset for display
    setRotationOffset(newRotationOffset);
    
    // If all slots are filled, just trigger effects (whole board rotates together)
    if (areAllSlotsFilled(currentSlots)) {
      triggerTileEffects(currentSlots, newRotationOffset);
      // Update selected group to new positions
      const step = direction === 'clockwise' ? amount : -amount;
      const newSelectedGroup = new Set<number>();
      group.forEach(oldIndex => {
        const newIndex = ((oldIndex + step) % slotCount + slotCount) % slotCount;
        newSelectedGroup.add(newIndex);
      });
      setSelectedGroup(newSelectedGroup);
      return;
    }

    // Chain collision movement
    let workingSlots = [...currentSlots];
    let currentGroup = new Set(group);
    let remainingMovement = amount;
    
    while (remainingMovement > 0) {
      const distanceToCollision = findDistanceToCollision(currentGroup, direction, workingSlots);
      
      if (distanceToCollision > remainingMovement) {
        // No collision in remaining movement - move the full distance
        const result = applyGroupMove(currentGroup, direction, remainingMovement, workingSlots);
        workingSlots = result.newSlots;
        currentGroup = result.newGroupIndices;
        remainingMovement = 0;
      } else {
        // Collision! Move to touch, then merge, then continue
        // Move (distanceToCollision - 1) to be adjacent, or 0 if already adjacent
        const moveDistance = Math.max(0, distanceToCollision - 1);
        
        if (moveDistance > 0) {
          const result = applyGroupMove(currentGroup, direction, moveDistance, workingSlots);
          workingSlots = result.newSlots;
          currentGroup = result.newGroupIndices;
          remainingMovement -= moveDistance;
        }
        
        // Now move 1 more to collide and merge
        if (remainingMovement > 0) {
          const step = direction === 'clockwise' ? 1 : -1;
          
          // Find what we're colliding with
          const leadingEdge = getLeadingEdge(currentGroup, direction);
          const collisionIndices = new Set<number>();
          leadingEdge.forEach(edgeIndex => {
            const collisionIndex = ((edgeIndex + step) % slotCount + slotCount) % slotCount;
            if (workingSlots[collisionIndex].filled && !currentGroup.has(collisionIndex)) {
              collisionIndices.add(collisionIndex);
            }
          });
          
          // Find and merge with all connected groups at collision points
          collisionIndices.forEach(collisionIndex => {
            const connectedGroup = findConnectedGroup(collisionIndex, workingSlots);
            // Add collision group to current group BEFORE moving
            connectedGroup.forEach(idx => currentGroup.add(idx));
          });
          
          // Now move the entire merged group by 1
          const result = applyGroupMove(currentGroup, direction, 1, workingSlots);
          workingSlots = result.newSlots;
          currentGroup = result.newGroupIndices;
          remainingMovement -= 1;
        }
      }
    }

    setSlots(workingSlots);
    setSelectedGroup(currentGroup);
    triggerTileEffects(workingSlots);
  }, [rotationOffset, findConnectedGroup, areAllSlotsFilled, triggerTileEffects, slotCount, getLeadingEdge, findDistanceToCollision, applyGroupMove]);

  const handleSelectGroup = useCallback((slotIndex: number) => {
    const slot = slots[slotIndex];
    if (!slot.filled) return; // Can't select empty slots

    const group = findConnectedGroup(slotIndex, slots);
    setSelectedGroup(group);
  }, [slots, findConnectedGroup]);

  const handleMoveGroup = useCallback((direction: RotationDirection, amount: number = 1) => {
    if (!selectedGroup) return;
    moveGroup(selectedGroup, direction, slots, amount);
  }, [selectedGroup, slots, moveGroup]);

  const handleRotate = useCallback((direction: RotationDirection, amount: number = 1) => {
    // If a group is selected, move that group
    if (selectedGroup) {
      handleMoveGroup(direction, amount);
      return;
    }

    // If all slots are filled, rotate entire board
    if (areAllSlotsFilled(slots)) {
      const slotAngle = 360 / slotCount;
      const delta = direction === 'clockwise' ? slotAngle * amount : -slotAngle * amount;
      const newRotationOffset = rotationOffset + delta;
      
      setRotationOffset(newRotationOffset);
      triggerTileEffects(slots, newRotationOffset);
      return;
    }

    // Otherwise, prompt to select a group first
    // (This will be handled by UI - rotation buttons disabled if no group selected)
  }, [selectedGroup, rotationOffset, slots, areAllSlotsFilled, triggerTileEffects, handleMoveGroup, slotCount]);

  // Save current state to undo stack before turn starts
  const saveToUndoStack = useCallback(() => {
    const state = getCurrentState();
    if (state) {
      setUndoStack(stack => [...stack, state]);
      setRedoStack([]); // Clear redo stack when new action is taken
    }
  }, [getCurrentState]);

  const handleEndTurn = useCallback(() => {
    // Save state before ending turn
    saveToUndoStack();
    
    setCurrentPlayerIndex(current => (current + 1) % players.length);
    setHasRotatedThisTurn(false);
    setHasPlacedTileThisTurn(false);
    setSelectedTile(null);
    setSelectedGroup(null);
  }, [players.length, saveToUndoStack]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const currentState = getCurrentState();
    if (currentState) {
      setRedoStack(stack => [...stack, currentState]);
    }
    
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(stack => stack.slice(0, -1));
    
    // Restore previous state
    handleLoadSave(previousState);
  }, [undoStack, getCurrentState, handleLoadSave]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const currentState = getCurrentState();
    if (currentState) {
      setUndoStack(stack => [...stack, currentState]);
    }
    
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(stack => stack.slice(0, -1));
    
    // Restore next state
    handleLoadSave(nextState);
  }, [redoStack, getCurrentState, handleLoadSave]);

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
        onSelectTile={setSelectedTile}
        onDeselectGroup={() => setSelectedGroup(null)}
      />

      <div className="game-column">
        <div className="board-container">
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            className="board-svg"
            onClick={() => {
              setSelectedGroup(null);
              setSelectedTile(null);
            }}
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
              canonicalTilePath={canonicalTilePath}
              centerX={CENTER}
              centerY={CENTER}
              players={players}
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              onSlotClick={handleSlotClick}
              onGroupSelect={handleSelectGroup}
              onTileHover={handleTileHover}
              selectedGroup={selectedGroup}
              hasTileSelected={!!selectedTile}
              slotCount={slotCount}
            />

            {/* Player tokens on outer ring */}
            {players.map(player => (
              <PlayerToken
                key={player.id}
                player={player}
                slotCount={slotCount}
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
                slotCount={slotCount}
                centerX={CENTER}
                centerY={CENTER}
                radius={PLAYER_RING_RADIUS + 100}
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

          <ActionPanel
            currentPlayer={currentPlayer}
            actions={availableActions}
            onAction={handleAction}
            onRotate={handleRotate}
            canRotate={!!selectedGroup || areAllSlotsFilled(slots)}
          />
        </div>
      </div>

      <div className="side-panels">
        <div className="info-panel">
          <h4>Game Info</h4>
          <div className="info-stats">
            <p>Players: {players.length}</p>
            <p>Tiles: {slots.filter(s => s.filled).length} / {slotCount}</p>
            <p>Rotation: {rotationOffset}°</p>
          </div>
          <button className="new-game-btn" onClick={handleNewGame}>
            New Game
          </button>
        </div>

        <SaveManager
          currentState={getCurrentState()}
          onLoadSave={handleLoadSave}
        />

        <DevControls
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
        />
      </div>
    </div>
  );
}
