import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PLAYER_COLORS } from '../constants/colors';

export type EmptyTileAmount = 'none' | 'few' | 'some' | 'many' | 'all';

const EMPTY_TILE_OPTIONS: { value: EmptyTileAmount; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'few', label: 'Few' },
  { value: 'some', label: 'Some' },
  { value: 'many', label: 'Many' },
  { value: 'all', label: 'All' },
];

interface GameSetupProps {
  onStartGame: (playerCount: number, fillWithBlanks: boolean, tileCount: number, randomFill?: { enabled: boolean; seed: string; emptyTileAmount: EmptyTileAmount }) => void;
}

const STORAGE_KEY = 'ring-game-setup-settings';

interface SavedSettings {
  fillWithBlanks: boolean;
  fillWithRandom: boolean;
  randomSeed: string;
  emptyTileAmount: EmptyTileAmount;
  tileCount: number;
  selectedPlayerCount: number | null;
}

function loadSavedSettings(): Partial<SavedSettings> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

function saveSettings(settings: SavedSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

function generateRandomSeed(): string {
  const adjectives = ['swift', 'bright', 'cosmic', 'golden', 'silent', 'ancient', 'wild', 'mystic', 'jade', 'crimson'];
  const nouns = ['tiger', 'phoenix', 'dragon', 'storm', 'moon', 'river', 'forest', 'crystal', 'flame', 'shadow'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}-${noun}-${num}`;
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  // Load saved settings on initial render
  const [savedSettings] = useState(() => loadSavedSettings());
  
  const [fillWithBlanks, setFillWithBlanks] = useState(savedSettings.fillWithBlanks ?? false);
  const [fillWithRandom, setFillWithRandom] = useState(savedSettings.fillWithRandom ?? false);
  const [randomSeed, setRandomSeed] = useState(() => savedSettings.randomSeed ?? generateRandomSeed());
  const [emptyTileAmount, setEmptyTileAmount] = useState<EmptyTileAmount>(savedSettings.emptyTileAmount ?? 'some');
  const [tileCount, setTileCount] = useState(savedSettings.tileCount ?? 16);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number | null>(savedSettings.selectedPlayerCount ?? null);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings({
      fillWithBlanks,
      fillWithRandom,
      randomSeed,
      emptyTileAmount,
      tileCount,
      selectedPlayerCount,
    });
  }, [fillWithBlanks, fillWithRandom, randomSeed, emptyTileAmount, tileCount, selectedPlayerCount]);

  const handleStartGame = () => {
    if (selectedPlayerCount !== null) {
      onStartGame(selectedPlayerCount, fillWithBlanks, tileCount, 
        fillWithRandom ? { enabled: true, seed: randomSeed, emptyTileAmount } : undefined
      );
    }
  };

  const handleRandomSeedChange = (value: string) => {
    setRandomSeed(value);
    if (value) {
      setFillWithRandom(true);
      setFillWithBlanks(false);
    }
  };

  const handleFillWithRandomChange = (checked: boolean) => {
    setFillWithRandom(checked);
    if (checked) {
      setFillWithBlanks(false);
    }
  };

  const handleFillWithBlanksChange = (checked: boolean) => {
    setFillWithBlanks(checked);
    if (checked) {
      setFillWithRandom(false);
    }
  };

  const regenerateSeed = () => {
    setRandomSeed(generateRandomSeed());
  };

  return (
    <motion.div
      className="game-setup"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2>New Game</h2>
      <p>Select number of players</p>
      
      <div className="player-count-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
          <motion.button
            key={count}
            className={`player-count-btn ${selectedPlayerCount === count ? 'selected' : ''}`}
            onClick={() => setSelectedPlayerCount(count)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              '--player-color': PLAYER_COLORS[count - 1]
            } as React.CSSProperties}
          >
            <span className="count">{count}</span>
            <span className="label">player{count !== 1 ? 's' : ''}</span>
          </motion.button>
        ))}
      </div>

      <div className="game-setup-options">
        <label className="slider-label">
          <span>Number of tiles: <strong>{tileCount}</strong></span>
          <input
            type="range"
            min="12"
            max="24"
            value={tileCount}
            onChange={(e) => setTileCount(Number(e.target.value))}
            className="tile-count-slider"
          />
          <div className="slider-range">
            <span>12</span>
            <span>24</span>
          </div>
        </label>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fillWithBlanks}
            onChange={(e) => handleFillWithBlanksChange(e.target.checked)}
          />
          <span>Fill board with blank tiles</span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={fillWithRandom}
            onChange={(e) => handleFillWithRandomChange(e.target.checked)}
          />
          <span>Fill board with random tiles</span>
        </label>

        {fillWithRandom && (
          <div className="seed-input-group">
            <label className="seed-label">
              <span>Seed:</span>
              <div className="seed-input-wrapper">
                <input
                  type="text"
                  value={randomSeed}
                  onChange={(e) => handleRandomSeedChange(e.target.value)}
                  className="seed-input"
                  placeholder="Enter seed..."
                />
                <button
                  type="button"
                  className="regenerate-seed-btn"
                  onClick={regenerateSeed}
                  title="Generate new random seed"
                >
                  🎲
                </button>
              </div>
            </label>
            
            <div className="empty-tiles-group">
              <span className="empty-tiles-label">Empty tiles:</span>
              <div className="empty-tiles-buttons">
                {EMPTY_TILE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`empty-tile-btn ${emptyTileAmount === option.value ? 'selected' : ''}`}
                    onClick={() => setEmptyTileAmount(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <motion.button
        className="start-game-btn"
        onClick={handleStartGame}
        disabled={selectedPlayerCount === null}
        whileHover={selectedPlayerCount !== null ? { scale: 1.02 } : {}}
        whileTap={selectedPlayerCount !== null ? { scale: 0.98 } : {}}
      >
        {selectedPlayerCount === null 
          ? 'Select players to start' 
          : `Start Game with ${selectedPlayerCount} player${selectedPlayerCount !== 1 ? 's' : ''}`}
      </motion.button>
    </motion.div>
  );
}
