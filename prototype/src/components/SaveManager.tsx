import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavedGameState } from './Board';

interface SaveSlot {
  id: string;
  name: string;
  state: SavedGameState;
  createdAt: number;
}

const SAVES_STORAGE_KEY = 'ring-board-game-saves';

interface SaveManagerProps {
  currentState: SavedGameState | null;
  onLoadSave: (state: SavedGameState) => void;
}

export function SaveManager({ currentState, onLoadSave }: SaveManagerProps) {
  const [saves, setSaves] = useState<SaveSlot[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Load saves from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SaveSlot[];
        setSaves(parsed);
      }
    } catch (e) {
      console.warn('Failed to load saves:', e);
    }
  }, []);

  // Save saves to localStorage
  const persistSaves = (newSaves: SaveSlot[]) => {
    try {
      localStorage.setItem(SAVES_STORAGE_KEY, JSON.stringify(newSaves));
      setSaves(newSaves);
    } catch (e) {
      console.warn('Failed to save saves:', e);
    }
  };

  const handleSave = () => {
    if (!currentState || !saveName.trim()) return;

    const newSave: SaveSlot = {
      id: Date.now().toString(),
      name: saveName.trim(),
      state: currentState,
      createdAt: Date.now()
    };

    const newSaves = [...saves, newSave];
    persistSaves(newSaves);
    setSaveName('');
    setShowSaveDialog(false);
  };

  const handleLoad = (save: SaveSlot) => {
    onLoadSave(save.state);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaves = saves.filter(s => s.id !== id);
    persistSaves(newSaves);
  };

  const startRename = (save: SaveSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(save.id);
    setEditName(save.name);
  };

  const handleRename = (id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }

    const newSaves = saves.map(s =>
      s.id === id ? { ...s, name: editName.trim() } : s
    );
    persistSaves(newSaves);
    setEditingId(null);
    setEditName('');
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="save-manager">
      <div className="save-manager-header">
        <h4>Saved Games</h4>
        <motion.button
          className="save-btn"
          onClick={() => setShowSaveDialog(true)}
          disabled={!currentState}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          💾 Save Current
        </motion.button>
      </div>

      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            className="save-dialog"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <input
              type="text"
              placeholder="Save name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setShowSaveDialog(false);
              }}
              autoFocus
            />
            <div className="save-dialog-actions">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="saves-list">
        {saves.length === 0 ? (
          <div className="no-saves">No saved games</div>
        ) : (
          saves.map((save) => (
            <motion.div
              key={save.id}
              className="save-item"
              onClick={() => handleLoad(save)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {editingId === save.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(save.id);
                    if (e.key === 'Escape') cancelRename();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <>
                  <div className="save-item-name">{save.name}</div>
                  <div className="save-item-date">
                    {new Date(save.createdAt).toLocaleDateString()}
                  </div>
                </>
              )}
              <div className="save-item-actions" onClick={(e) => e.stopPropagation()}>
                {editingId === save.id ? (
                  <>
                    <button onClick={() => handleRename(save.id)}>✓</button>
                    <button onClick={cancelRename}>✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => startRename(save, e)}>✏️</button>
                    <button onClick={(e) => handleDelete(save.id, e)}>🗑️</button>
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

