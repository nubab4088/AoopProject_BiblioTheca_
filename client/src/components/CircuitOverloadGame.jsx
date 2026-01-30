import React, { useState, useEffect, useRef } from 'react';
import useUiSound from '../hooks/useUiSound';
import ToastNotification from './ToastNotification';

/**
 * CircuitOverloadGame - Demo-Optimized "Pipe Dream" Puzzle
 * 
 * Simplified for demo purposes:
 * - Pre-defined solved grid with a clear path
 * - Only 5 tiles randomly rotated at start
 * - Visual feedback shows which tiles are correctly aligned
 * - Progress bar tracks completion
 * - Winnable in under 10 seconds
 * 
 * Difficulty: HARD | Win: +60 KP | Loss: -30 KP
 */

const GRID_SIZE = 4;
const TIME_LIMIT = 60; // Increased time for demo
const KP_REWARD = 60;
const KP_PENALTY = -30;
const TILES_TO_SCRAMBLE = 5;

// Tile types
const TILES = {
  STRAIGHT_H: 'straight-h',
  STRAIGHT_V: 'straight-v',
  CURVE_TL: 'curve-tl',
  CURVE_TR: 'curve-tr',
  CURVE_BL: 'curve-bl',
  CURVE_BR: 'curve-br',
};

// 🎯 SOLVED GRID: Pre-defined perfect path from top-left to bottom-right
// This creates a clean S-shaped path that's easy to visualize
const SOLVED_GRID = [
  // Row 0: Start (0,0) → right → right → down
  [
    { type: TILES.STRAIGHT_H, rotation: 0, isSource: true, isTerminal: false },
    { type: TILES.STRAIGHT_H, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.STRAIGHT_H, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.CURVE_BL, rotation: 0, isSource: false, isTerminal: false }
  ],
  // Row 1: down ← left ← left ← up
  [
    { type: TILES.CURVE_TR, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.STRAIGHT_H, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.STRAIGHT_H, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.STRAIGHT_V, rotation: 0, isSource: false, isTerminal: false }
  ],
  // Row 2: down → right → right → up
  [
    { type: TILES.STRAIGHT_V, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.CURVE_TL, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.STRAIGHT_H, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.CURVE_BR, rotation: 0, isSource: false, isTerminal: false }
  ],
  // Row 3: End (3,3) ← left ← left ← left
  [
    { type: TILES.CURVE_TR, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.STRAIGHT_H, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.STRAIGHT_H, rotation: 0, isSource: false, isTerminal: false },
    { type: TILES.STRAIGHT_H, rotation: 0, isSource: true, isTerminal: true }
  ]
];

const CircuitOverloadGame = ({ onComplete, onClose }) => {
  const [grid, setGrid] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameStatus, setGameStatus] = useState('playing');
  const [toasts, setToasts] = useState([]);
  const [systemIntegrity, setSystemIntegrity] = useState(0);

  const { playClick, playWin, playPowerUp, stopCountdown, stopCountdown2 } = useUiSound();
  
  const timerRef = useRef(null);

  // ✅ KILL SWITCH: Centralized cleanup function
  const stopGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopCountdown();
    stopCountdown2();
  };

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => stopGame();
  }, []);

  // 🎯 INITIALIZE GRID: Load solved grid and scramble 5 tiles
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

  // 🎯 CHECK WIN CONDITION: When integrity reaches 100%
  useEffect(() => {
    if (grid.length > 0) {
      const integrity = calculateSystemIntegrity();
      setSystemIntegrity(integrity);
      
      if (integrity === 100 && gameStatus === 'playing') {
        handleWin();
      }
    }
  }, [grid]);

  const initializeGrid = () => {
    // Deep copy the solved grid
    const newGrid = SOLVED_GRID.map(row => 
      row.map(tile => ({ ...tile }))
    );

    // Get all scrambleable positions (exclude source and terminal)
    const scrambleablePositions = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        // Skip source (0,0) and terminal (3,3)
        if (!(row === 0 && col === 0) && !(row === 3 && col === 3)) {
          scrambleablePositions.push({ row, col });
        }
      }
    }

    // Randomly select and rotate TILES_TO_SCRAMBLE tiles
    const shuffled = scrambleablePositions.sort(() => Math.random() - 0.5);
    const tilesToScramble = shuffled.slice(0, TILES_TO_SCRAMBLE);

    tilesToScramble.forEach(({ row, col }) => {
      // Rotate by 90, 180, or 270 degrees (never 0 or 360 to ensure it's actually scrambled)
      const rotations = [90, 180, 270];
      const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
      newGrid[row][col].rotation = randomRotation;
    });

    console.log('🎮 Grid initialized with', TILES_TO_SCRAMBLE, 'scrambled tiles:', tilesToScramble);
    setGrid(newGrid);
  };

  const rotateTile = (row, col) => {
    if (gameStatus !== 'playing') return;
    // Block rotation of source and terminal
    if ((row === 0 && col === 0) || (row === 3 && col === 3)) return;

    playClick();

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => r.map(tile => ({ ...tile })));
      newGrid[row][col].rotation = (newGrid[row][col].rotation + 90) % 360;
      return newGrid;
    });
  };

  // 🎯 CALCULATE SYSTEM INTEGRITY: Percentage of correctly rotated tiles
  const calculateSystemIntegrity = () => {
    let correctTiles = 0;
    const totalTiles = GRID_SIZE * GRID_SIZE;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const currentRotation = grid[row][col].rotation;
        const solvedRotation = SOLVED_GRID[row][col].rotation;

        if (currentRotation === solvedRotation) {
          correctTiles++;
        }
      }
    }

    return Math.round((correctTiles / totalTiles) * 100);
  };

  // 🎯 CHECK IF TILE IS CORRECTLY ALIGNED
  const isTileCorrect = (row, col) => {
    if (!grid[row] || !grid[row][col]) return false;
    const currentRotation = grid[row][col].rotation;
    const solvedRotation = SOLVED_GRID[row][col].rotation;
    return currentRotation === solvedRotation;
  };

  const handleWin = async () => {
    stopGame();
    setGameStatus('won');
    playWin();

    try {
      await onComplete(KP_REWARD);
      addToast('success', 'CIRCUIT CONNECTED!', 'System integrity restored', KP_REWARD);
    } catch (error) {
      console.error('Failed to award KP:', error);
    }
  };

  const handleTimeout = () => {
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
    const isCorrect = isTileCorrect(row, col);

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
          // 🎯 CYAN GLOW for correctly aligned tiles
          borderColor: tile.isSource || tile.isTerminal 
            ? '#fff' 
            : isCorrect 
            ? '#00d4ff'
            : '#ff00ff',
          boxShadow: isCorrect && !tile.isSource && !tile.isTerminal
            ? '0 0 15px #00d4ff, inset 0 0 10px rgba(0, 212, 255, 0.3)'
            : 'none',
          transform: `rotate(${tile.rotation}deg)`,
          transition: 'all 0.3s ease',
          // Pulse animation for correct tiles
          animation: isCorrect && !tile.isSource && !tile.isTerminal ? 'correctPulse 2s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={(e) => {
          if (isClickable) {
            e.currentTarget.style.filter = 'brightness(1.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (isClickable) {
            e.currentTarget.style.filter = 'brightness(1)';
          }
        }}
      >
        {tile.isSource && <div style={styles.label}>SOURCE</div>}
        {tile.isTerminal && <div style={styles.label}>TERMINAL</div>}
        {!tile.isSource && !tile.isTerminal && (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {renderTilePath(tile.type, isCorrect)}
          </svg>
        )}
      </div>
    );
  };

  const renderTilePath = (type, isCorrect) => {
    const color = isCorrect ? '#00d4ff' : '#ff00ff';
    const strokeWidth = 8;
    const glowFilter = isCorrect ? 'url(#glow)' : 'none';

    const pathElement = (() => {
      switch (type) {
        case TILES.STRAIGHT_H:
          return <line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth={strokeWidth} filter={glowFilter} />;
        case TILES.STRAIGHT_V:
          return <line x1="50" y1="0" x2="50" y2="100" stroke={color} strokeWidth={strokeWidth} filter={glowFilter} />;
        case TILES.CURVE_TL:
          return <path d="M 50 0 Q 50 50, 0 50" stroke={color} fill="none" strokeWidth={strokeWidth} filter={glowFilter} />;
        case TILES.CURVE_TR:
          return <path d="M 50 0 Q 50 50, 100 50" stroke={color} fill="none" strokeWidth={strokeWidth} filter={glowFilter} />;
        case TILES.CURVE_BL:
          return <path d="M 50 100 Q 50 50, 0 50" stroke={color} fill="none" strokeWidth={strokeWidth} filter={glowFilter} />;
        case TILES.CURVE_BR:
          return <path d="M 50 100 Q 50 50, 100 50" stroke={color} fill="none" strokeWidth={strokeWidth} filter={glowFilter} />;
        default:
          return null;
      }
    })();

    return (
      <>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {pathElement}
      </>
    );
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

        {/* 🎯 SYSTEM INTEGRITY PROGRESS BAR */}
        <div style={styles.integrityContainer}>
          <div style={styles.integrityLabel}>
            <span>SYSTEM INTEGRITY</span>
            <span style={{ 
              color: systemIntegrity === 100 ? '#00ff88' : systemIntegrity > 60 ? '#00d4ff' : '#ffaa00',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              {systemIntegrity}%
            </span>
          </div>
          <div style={styles.progressBarContainer}>
            <div 
              style={{
                ...styles.progressBar,
                width: `${systemIntegrity}%`,
                background: systemIntegrity === 100 
                  ? 'linear-gradient(90deg, #00ff88, #00aa66)'
                  : systemIntegrity > 60
                  ? 'linear-gradient(90deg, #00d4ff, #0088cc)'
                  : 'linear-gradient(90deg, #ffaa00, #ff6600)',
                boxShadow: systemIntegrity === 100
                  ? '0 0 20px rgba(0, 255, 136, 0.8)'
                  : '0 0 15px rgba(0, 212, 255, 0.6)'
              }}
            />
          </div>
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
              color: timeLeft <= 10 ? '#ff4444' : '#00ff88', 
              fontSize: '1.2rem', 
              fontWeight: 'bold' 
            }}>
              {timeLeft}s
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>REWARD</span>
            <span style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 'bold' }}>
              +{KP_REWARD} KP
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
                  <div style={styles.gameOverTitle}>SYSTEM INTEGRITY RESTORED</div>
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
          <div style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '0.5rem' }}>🎯 DEMO MODE - EASY WIN:</div>
          <div>→ Click any tile to rotate it 90 degrees</div>
          <div>→ Tiles with CYAN GLOW are correctly aligned</div>
          <div>→ Align all tiles to reach 100% System Integrity</div>
          <div>→ Only {TILES_TO_SCRAMBLE} tiles are scrambled - Find and fix them!</div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes correctPulse {
          0%, 100% {
            box-shadow: 0 0 15px #00d4ff, inset 0 0 10px rgba(0, 212, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 25px #00d4ff, inset 0 0 15px rgba(0, 212, 255, 0.5);
          }
        }

        @keyframes progressFill {
          from {
            width: 0%;
          }
        }
      `}</style>
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
    transition: 'all 0.3s ease',
  },
  integrityContainer: {
    marginBottom: '2rem',
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '2px solid rgba(0, 212, 255, 0.3)',
  },
  integrityLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    color: '#00d4ff',
    fontSize: '0.9rem',
    letterSpacing: '2px',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    height: '30px',
    background: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '15px',
    overflow: 'hidden',
    border: '2px solid rgba(0, 212, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    transition: 'all 0.5s ease',
    borderRadius: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#000',
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
    transition: 'all 0.3s ease',
  },
  instructions: {
    background: 'rgba(0, 212, 255, 0.1)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '0.9rem',
    color: '#aaa',
    lineHeight: '1.8',
  },
};

export default CircuitOverloadGame;
