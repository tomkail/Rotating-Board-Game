import { useState } from 'react';
import { motion } from 'framer-motion';
import type { TileData, TileTypeConfig, Player, MovementDirection } from '../types/game';
import { TILE_TYPES } from '../types/game';

interface TilePaletteProps {
  players: Player[];
  selectedTile: TileData | null;
  onSelectTile: (tile: TileData | null) => void;
  onDeselectGroup?: () => void;
}

interface TileOptionProps {
  config: TileTypeConfig;
  players: Player[];
  isSelected: boolean;
  currentTile: TileData | null;
  onSelect: (tile: TileData) => void;
}

function TileOption({ config, players, isSelected, currentTile, onSelect }: TileOptionProps) {
  const [value, setValue] = useState(config.defaultValue ?? 1);
  const [ownerId, setOwnerId] = useState<number | undefined>(
    config.hasOwner && players.length > 0 ? players[0].id : undefined
  );
  const [direction, setDirection] = useState<MovementDirection>(() => 
    currentTile?.direction ?? 'right'
  );

  const handleSelect = () => {
    onSelect({
      id: `${config.id}-${Date.now()}-${Math.random()}`,
      typeId: config.id,
      value: config.hasValue ? value : undefined,
      ownerId: config.hasOwner ? ownerId : undefined,
      direction: config.hasDirection ? direction : undefined
    });
  };

  const adjustValue = (delta: number) => {
    const newValue = Math.max(config.minValue ?? 1, Math.min(config.maxValue ?? 5, value + delta));
    setValue(newValue);
    if (isSelected && currentTile) {
      onSelect({
        ...currentTile,
        value: newValue
      });
    }
  };

  const toggleDirection = () => {
    const newDirection: MovementDirection = direction === 'left' ? 'right' : 'left';
    setDirection(newDirection);
    if (isSelected && currentTile) {
      onSelect({
        ...currentTile,
        direction: config.hasDirection ? newDirection : undefined
      });
    }
  };

  const selectOwner = (playerId: number) => {
    setOwnerId(playerId);
    if (isSelected && currentTile) {
      onSelect({
        ...currentTile,
        ownerId: playerId
      });
    }
  };

  const ownerColor = config.hasOwner && ownerId !== undefined
    ? players.find(p => p.id === ownerId)?.color ?? config.color
    : config.color;

  return (
    <motion.div
      className={`tile-option ${isSelected ? 'selected' : ''}`}
      onClick={handleSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        '--tile-color': ownerColor
      } as React.CSSProperties}
    >
      <div className="tile-option-header">
        <span className="tile-icon" style={{ color: ownerColor }}>{config.icon}</span>
        <span className="tile-name">{config.name}</span>
      </div>

      {config.hasValue && (
        <div className="tile-value-control" onClick={e => e.stopPropagation()}>
          <motion.button
            className="value-btn"
            onClick={() => adjustValue(-1)}
            disabled={value <= (config.minValue ?? 1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ◀
          </motion.button>
          <span className="value-display">{value}</span>
          <motion.button
            className="value-btn"
            onClick={() => adjustValue(1)}
            disabled={value >= (config.maxValue ?? 5)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ▶
          </motion.button>
        </div>
      )}

      {config.hasDirection && (
        <div className="tile-direction-control" onClick={e => e.stopPropagation()}>
          <motion.button
            className={`direction-btn ${direction === 'left' ? 'selected' : ''}`}
            onClick={toggleDirection}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Left"
          >
            ◀
          </motion.button>
          <span className="direction-label">Direction</span>
          <motion.button
            className={`direction-btn ${direction === 'right' ? 'selected' : ''}`}
            onClick={toggleDirection}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Right"
          >
            ▶
          </motion.button>
        </div>
      )}

      {config.hasOwner && players.length > 0 && (
        <div className="tile-owner-control" onClick={e => e.stopPropagation()}>
          {players.map(player => (
            <motion.button
              key={player.id}
              className={`owner-dot ${ownerId === player.id ? 'selected' : ''}`}
              onClick={() => selectOwner(player.id)}
              style={{ backgroundColor: player.color }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              title={`Player ${player.id + 1}`}
            />
          ))}
        </div>
      )}

      <div className="tile-description">{config.description}</div>
    </motion.div>
  );
}

export function TilePalette({ players, selectedTile, onSelectTile, onDeselectGroup }: TilePaletteProps) {
  const handleSelectTile = (tile: TileData) => {
    onDeselectGroup?.();
    onSelectTile(tile);
  };

  return (
    <div className="tile-palette">
      <div className="palette-header">
        <h3>Tile Palette</h3>
        {selectedTile && (
          <motion.button
            className="deselect-btn"
            onClick={() => onSelectTile(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear Selection
          </motion.button>
        )}
      </div>
      
      <div className="tile-options">
        {TILE_TYPES.map(config => (
          <TileOption
            key={config.id}
            config={config}
            players={players}
            isSelected={selectedTile?.typeId === config.id}
            currentTile={selectedTile}
            onSelect={handleSelectTile}
          />
        ))}
      </div>
    </div>
  );
}

