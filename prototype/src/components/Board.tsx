import { useState, useCallback } from 'react';
import type { TileSlot as TileSlotType, RotationDirection, Player, TileData } from '../types/game';
import { useRingGeometry } from '../hooks/useRingGeometry';
import { Ring } from './Ring';
import { RotationControls } from './RotationControls';
import { PlayerToken } from './PlayerToken';
import { GameSetup, PLAYER_COLORS } from './GameSetup';
import { TilePalette } from './TilePalette';

const SLOT_COUNT = 16;
const SVG_SIZE = 600;
const CENTER = SVG_SIZE / 2;
const OUTER_RADIUS = 250;
const INNER_RADIUS = 160;
const PLAYER_RING_RADIUS = OUTER_RADIUS + 35;

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

type GamePhase = 'setup' | 'playing';

export function Board() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [slots, setSlots] = useState<TileSlotType[]>(() => createInitialSlots(SLOT_COUNT));
  const [rotationOffset, setRotationOffset] = useState(0);
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);

  const geometries = useRingGeometry({
    slotCount: SLOT_COUNT,
    innerRadius: INNER_RADIUS,
    outerRadius: OUTER_RADIUS,
    centerX: CENTER,
    centerY: CENTER,
    gapAngle: 3
  });

  const handleStartGame = useCallback((playerCount: number) => {
    const newPlayers = createPlayers(playerCount, SLOT_COUNT);
    setPlayers(newPlayers);
    setSlots(createInitialSlots(SLOT_COUNT));
    setRotationOffset(0);
    setSelectedTile(null);
    setGamePhase('playing');
  }, []);

  const handleNewGame = useCallback(() => {
    setGamePhase('setup');
    setPlayers([]);
    setSelectedTile(null);
  }, []);

  const handleSlotClick = useCallback((slotIndex: number) => {
    if (!selectedTile) return; // Need to select a tile first
    
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
  }, [selectedTile]);

  const handleRotate = useCallback((direction: RotationDirection) => {
    const slotAngle = 360 / SLOT_COUNT;
    const delta = direction === 'clockwise' ? slotAngle : -slotAngle;
    setRotationOffset(current => current + delta);
  }, []);

  if (gamePhase === 'setup') {
    return (
      <div className="board-container">
        <GameSetup onStartGame={handleStartGame} />
      </div>
    );
  }

  return (
    <div className="board-layout">
      <TilePalette
        players={players}
        selectedTile={selectedTile}
        onSelectTile={setSelectedTile}
      />

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
            onSlotClick={handleSlotClick}
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
            />
          ))}

          {/* Center decoration */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={30}
            fill="#1e293b"
            stroke="#334155"
            strokeWidth={2}
          />
        </svg>

        <RotationControls onRotate={handleRotate} />

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
  );
}
