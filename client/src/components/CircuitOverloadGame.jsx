import React, { useState, useEffect, useRef } from 'react';
import useUiSound from '../hooks/useUiSound';
import ToastNotification from './ToastNotification';

/**
 * CircuitOverloadGame - "Pipe Dream" Logic Puzzle
 * 
 * Rotate circuit tiles to connect power source to terminal.
 * Professional cyberpunk-themed logic challenge.
 * 
 * Difficulty: HARD | Win: +60 KP | Loss: -30 KP
 */

const GRID_SIZE = 4;
const TIME_LIMIT = 30; // seconds
const KP_REWARD = 60;
const KP_PENALTY = -30;

// Tile types
const TILES = {
  STRAIGHT_H: 'straight-h',
  STRAIGHT_V: 'straight-v',
  CURVE_TL: 'curve-tl',
  CURVE_TR: 'curve-tr',
  CURVE_BL: 'curve-bl',
  CURVE_BR: 'curve-br',
  T_TOP: 't-top',
  T_RIGHT: 't-right',
  T_BOTTOM: 't-bottom',
  T_LEFT: 't-left',
};

const CircuitOverloadGame = ({ onComplete, onClose }) => {
  const [grid, setGrid] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameStatus, setGameStatus] = useState('playing');
  const [toasts, setToasts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const { playClick, playWin, playPowerUp, stopCountdown, stopCountdown2 } = useUiSound();
  
  // ✅ useRef for intervalId and audio object
  const timerRef = useRef(null);

  // ✅ KILL SWITCH: Centralized cleanup function
  const stopGame = () => {
    // Clear timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop and reset audio immediately
    stopCountdown();
    stopCountdown2();
  };

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => stopGame();
  }, []);

  // Initialize grid
  useEffect(() => {
    initializeGrid();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameStatus !== 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameStatus]);

  // Check connection after each move
  useEffect(() => {
    if (grid.length > 0) {
      const connected = checkConnection();
      setIsConnected(connected);
      
      if (connected && gameStatus === 'playing') {
        handleWin();
      }
    }
  }, [grid]);

  const initializeGrid = () => {
    const newGrid = [];
    const tileTypes = [
      TILES.STRAIGHT_H, TILES.STRAIGHT_V,
      TILES.CURVE_TL, TILES.CURVE_TR, TILES.CURVE_BL, TILES.CURVE_BR
    ];

    for (let row = 0; row < GRID_SIZE; row++) {
      const gridRow = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        // Random tile with random rotation
        const tileType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
        const rotation = (Math.floor(Math.random() * 4) * 90);
        
        gridRow.push({
          type: tileType,
          rotation: rotation,
          isSource: row === 0 && col === 0,
          isTerminal: row === GRID_SIZE - 1 && col === GRID_SIZE - 1
        });
      }
      newGrid.push(gridRow);
    }

    setGrid(newGrid);
  };

  const rotateTile = (row, col) => {
    if (gameStatus !== 'playing') return;
    if ((row === 0 && col === 0) || (row === GRID_SIZE - 1 && col === GRID_SIZE - 1)) return;

    playClick();

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => r.map(tile => ({ ...tile })));
      newGrid[row][col].rotation = (newGrid[row][col].rotation + 90) % 360;
      return newGrid;
    });
  };

  const checkConnection = () => {
    // Simple path-finding: Check if source connects to terminal
    const visited = new Set();
    const queue = [[0, 0]];

    while (queue.length > 0) {
      const [row, col] = queue.shift();
      const key = `${row},${col}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (row === GRID_SIZE - 1 && col === GRID_SIZE - 1) {
        return true; // Reached terminal
      }

      // Get connected neighbors
      const neighbors = getConnectedNeighbors(row, col);
      neighbors.forEach(([nRow, nCol]) => {
        if (!visited.has(`${nRow},${nCol}`)) {
          queue.push([nRow, nCol]);
        }
      });
    }

    return false;
  };

  const getConnectedNeighbors = (row, col) => {
    const tile = grid[row][col];
    const connections = getTileConnections(tile);
    const neighbors = [];

    connections.forEach(dir => {
      let newRow = row;
      let newCol = col;

      if (dir === 'top') newRow--;
      if (dir === 'bottom') newRow++;
      if (dir === 'left') newCol--;
      if (dir === 'right') newCol++;

      if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
        const neighborTile = grid[newRow][newCol];
        const neighborConnections = getTileConnections(neighborTile);
        
        const oppositeDir = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[dir];
        
        if (neighborConnections.includes(oppositeDir)) {
          neighbors.push([newRow, newCol]);
        }
      }
    });

    return neighbors;
  };

  const getTileConnections = (tile) => {
    const baseConnections = {
      [TILES.STRAIGHT_H]: ['left', 'right'],
      [TILES.STRAIGHT_V]: ['top', 'bottom'],
      [TILES.CURVE_TL]: ['top', 'left'],
      [TILES.CURVE_TR]: ['top', 'right'],
      [TILES.CURVE_BL]: ['bottom', 'left'],
      [TILES.CURVE_BR]: ['bottom', 'right'],
    };

    const connections = baseConnections[tile.type] || [];
    const rotatedConnections = connections.map(dir => {
      const rotations = tile.rotation / 90;
      const dirs = ['top', 'right', 'bottom', 'left'];
      const currentIndex = dirs.indexOf(dir);
      return dirs[(currentIndex + rotations) % 4];
    });

    return rotatedConnections;
  };

  const handleWin = async () => {
    // ✅ KILL SWITCH: Stop everything immediately at the start
    stopGame();
    
    setGameStatus('won');
    playWin();

    try {
      await onComplete(KP_REWARD);
      addToast('success', 'CIRCUIT CONNECTED!', 'Power flow established', KP_REWARD);
    } catch (error) {
      console.error('Failed to award KP:', error);
    }
  };

  const handleTimeout = () => {
    // ✅ KILL SWITCH: Stop everything immediately at the start
    stopGame();
    
    setGameStatus('lost');
    
    onComplete(KP_PENALTY);
    addToast('error', 'SYSTEM OVERLOAD!', 'Circuit failed to connect', KP_PENALTY);
  };

  const addToast = (type, title, message, kpAmount = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message, kpAmount }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const renderTile = (tile, row, col) => {
    const isClickable = !tile.isSource && !tile.isTerminal && gameStatus === 'playing';

    return (
      <div
        key={`${row}-${col}`}
        onClick={() => isClickable && rotateTile(row, col)}
        style={{
          ...styles.tile,
          cursor: isClickable ? 'pointer' : 'default',
          background: tile.isSource 
            ? 'linear-gradient(135deg, #00ff88, #00aa66)'
            : tile.isTerminal
            ? 'linear-gradient(135deg, #00d4ff, #0088cc)'
            : 'rgba(0, 0, 0, 0.5)',
          borderColor: tile.isSource || tile.isTerminal ? '#fff' : '#ff00ff',
          transform: `rotate(${tile.rotation}deg)`,
        }}
      >
        {tile.isSource && <div style={styles.label}>SOURCE</div>}
        {tile.isTerminal && <div style={styles.label}>TERMINAL</div>}
        {!tile.isSource && !tile.isTerminal && (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {renderTilePath(tile.type)}
          </svg>
        )}
      </div>
    );
  };

  const renderTilePath = (type) => {
    const color = '#ff00ff';
    const strokeWidth = 8;

    switch (type) {
      case TILES.STRAIGHT_H:
        return <line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth={strokeWidth} />;
      case TILES.STRAIGHT_V:
        return <line x1="50" y1="0" x2="50" y2="100" stroke={color} strokeWidth={strokeWidth} />;
      case TILES.CURVE_TL:
        return <path d="M 50 0 Q 50 50, 0 50" stroke={color} fill="none" strokeWidth={strokeWidth} />;
      case TILES.CURVE_TR:
        return <path d="M 50 0 Q 50 50, 100 50" stroke={color} fill="none" strokeWidth={strokeWidth} />;
      case TILES.CURVE_BL:
        return <path d="M 50 100 Q 50 50, 0 50" stroke={color} fill="none" strokeWidth={strokeWidth} />;
      case TILES.CURVE_BR:
        return <path d="M 50 100 Q 50 50, 100 50" stroke={color} fill="none" strokeWidth={strokeWidth} />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.overlay}>
      <div className="toast-container">
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            kpAmount={toast.kpAmount}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>
            <span style={{ fontSize: '2rem' }}>⚡</span>
            CIRCUIT OVERLOAD TERMINAL
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <i className="fas fa-times"></i> EXIT
          </button>
        </div>

        {/* Status Bar */}
        <div style={styles.statusBar}>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>DIFFICULTY</span>
            <span style={{ color: '#ff00ff', fontSize: '1.2rem', fontWeight: 'bold' }}>HARD</span>
          </div>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>TIME LEFT</span>
            <span style={{ 
              color: timeLeft <= 5 ? '#ff4444' : '#00ff88', 
              fontSize: '1.2rem', 
              fontWeight: 'bold' 
            }}>
              {timeLeft}s
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>STATUS</span>
            <span style={{ 
              color: isConnected ? '#00ff88' : '#ffaa00', 
              fontSize: '1.2rem', 
              fontWeight: 'bold' 
            }}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        {/* Grid */}
        <div style={styles.gridContainer}>
          <div style={styles.grid}>
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} style={styles.gridRow}>
                {row.map((tile, colIndex) => renderTile(tile, rowIndex, colIndex))}
              </div>
            ))}
          </div>
        </div>

        {/* Game Over Overlay */}
        {gameStatus !== 'playing' && (
          <div style={styles.gameOverOverlay}>
            <div style={styles.gameOverContent}>
              {gameStatus === 'won' ? (
                <>
                  <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✓</div>
                  <div style={styles.gameOverTitle}>POWER FLOW ESTABLISHED</div>
                  <div style={styles.gameOverMessage}>Circuit successfully connected</div>
                  <div style={styles.kpReward}>+{KP_REWARD} KP</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✕</div>
                  <div style={{...styles.gameOverTitle, color: '#ff4444'}}>SYSTEM OVERLOAD</div>
                  <div style={styles.gameOverMessage}>Circuit connection failed</div>
                  <div style={styles.kpPenalty}>{KP_PENALTY} KP</div>
                </>
              )}
              <button onClick={onClose} style={styles.exitButton}>
                RETURN TO PLATFORM
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={styles.instructions}>
          <div style={{ color: '#ff00ff', fontWeight: 'bold', marginBottom: '0.5rem' }}>PROTOCOL:</div>
          <div>→ Click tiles to rotate them 90 degrees</div>
          <div>→ Connect GREEN source (top-left) to BLUE terminal (bottom-right)</div>
          <div>→ Complete the circuit before the {TIME_LIMIT}s timer runs out</div>
          <div>→ Source and Terminal cannot be rotated</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '2rem',
    fontFamily: "'Courier New', monospace",
  },
  container: {
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(20, 20, 40, 0.95))',
    border: '2px solid rgba(255, 0, 255, 0.3)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 0 40px rgba(255, 0, 255, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#ff00ff',
    textShadow: '0 0 20px rgba(255, 0, 255, 0.6)',
    letterSpacing: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  closeBtn: {
    background: 'rgba(255, 68, 68, 0.2)',
    border: '2px solid #ff4444',
    color: '#ff4444',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.9rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statusItem: {
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  gridContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
    position: 'relative',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '2px solid rgba(255, 0, 255, 0.2)',
  },
  gridRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  tile: {
    width: '100px',
    height: '100px',
    border: '2px solid',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  label: {
    position: 'absolute',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    padding: '0.2rem',
  },
  gameOverOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  gameOverContent: {
    textAlign: 'center',
    color: '#fff',
  },
  gameOverTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#00ff88',
    textShadow: '0 0 30px rgba(0, 255, 136, 0.8)',
    marginBottom: '1rem',
    letterSpacing: '4px',
  },
  gameOverMessage: {
    fontSize: '1.2rem',
    color: '#aaa',
    marginBottom: '2rem',
  },
  kpReward: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#ffd700',
    textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
    marginBottom: '2rem',
  },
  kpPenalty: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#ff4444',
    textShadow: '0 0 30px rgba(255, 68, 68, 0.8)',
    marginBottom: '2rem',
  },
  exitButton: {
    marginTop: '1rem',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #ff00ff, #aa00aa)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '2px',
  },
  instructions: {
    background: 'rgba(255, 0, 255, 0.05)',
    border: '1px solid rgba(255, 0, 255, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '0.9rem',
    color: '#aaa',
    lineHeight: '1.8',
  },
};

export default CircuitOverloadGame;
