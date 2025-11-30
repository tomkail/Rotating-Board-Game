import { useState } from 'react';
import { motion } from 'framer-motion';
import type { TileData, TileTypeConfig, Player } from '../types/game';
import { TILE_TYPES } from '../types/game';

interface TilePaletteProps {
  players: Player[];
  selectedTile: TileData | null;
  onSelectTile: (tile: TileData | null) => void;
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

  const handleSelect = () => {
    onSelect({
      typeId: config.id,
      value: config.hasValue ? value : undefined,
      ownerId: config.hasOwner ? ownerId : undefined
    });
  };

  const adjustValue = (delta: number) => {
    const newValue = Math.max(config.minValue ?? 1, Math.min(config.maxValue ?? 5, value + delta));
    setValue(newValue);
    if (isSelected) {
      onSelect({
        typeId: config.id,
        value: newValue,
        ownerId: config.hasOwner ? ownerId : undefined
      });
    }
  };

  const selectOwner = (playerId: number) => {
    setOwnerId(playerId);
    if (isSelected) {
      onSelect({
        typeId: config.id,
        value: config.hasValue ? value : undefined,
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

export function TilePalette({ players, selectedTile, onSelectTile }: TilePaletteProps) {
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
            onSelect={onSelectTile}
          />
        ))}
      </div>
    </div>
  );
}

