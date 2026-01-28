import React, { useState, useEffect, useRef } from 'react';
import useUiSound from '../hooks/useUiSound';
import ToastNotification from './ToastNotification';

/**
 * MemoryMatrixGame - Simon Says Pattern Memory Challenge
 * 
 * A professional cyberpunk-themed memory game.
 * Players must replicate increasingly complex patterns.
 * 
 * Difficulty: EASY | Reward: +30 KP | 3 Levels
 * 
 * FIXED BUGS:
 * ✅ Audio & Timer Cleanup - All sounds/timers properly cleared on unmount
 * ✅ Mission Report Overlay - WIN/LOSS screens with retry functionality
 * ✅ State Reset - Complete game state reset on retry
 */

const GRID_SIZE = 9; // 3x3 grid
const KP_REWARD = 30;
const KP_PENALTY = -15;
const LEVELS_TO_WIN = 3;

const MemoryMatrixGame = ({ onClose, onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isPlayback, setIsPlayback] = useState(false);
  const [activeCells, setActiveCells] = useState(new Set());
  const [gameStatus, setGameStatus] = useState('ready'); // 'ready', 'playing', 'won', 'lost'
  const [toasts, setToasts] = useState([]);

  const { playClick, playWin, playPowerUp, stopCountdown, stopCountdown2 } = useUiSound();
  
  // 🔧 FIX #1: Track all timeouts and audio for cleanup
  const timeoutsRef = useRef([]);
  const playbackIndexRef = useRef(0);
  const isCleaningUpRef = useRef(false);

  // 🔧 FIX #1: Cleanup function to stop all audio and timers
  const cleanup = () => {
    if (isCleaningUpRef.current) return; // Prevent double cleanup
    isCleaningUpRef.current = true;

    console.log('🧹 Cleaning up MemoryMatrixGame - clearing all timers and audio');
    
    // Clear all timeouts
    timeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    timeoutsRef.current = [];
    
    // 🔧 CRITICAL FIX: Stop all audio playback
    stopCountdown();
    stopCountdown2();
    
    // Reset playback state
    setIsPlayback(false);
  };

  // 🔧 FIX #1: Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Helper to add tracked timeout
  const addTimeout = (callback, delay) => {
    const timeoutId = setTimeout(() => {
      callback();
      // Remove from tracking array
      timeoutsRef.current = timeoutsRef.current.filter(id => id !== timeoutId);
    }, delay);
    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  };

  // Generate sequence based on level
  const generateSequence = (level) => {
    const sequenceLength = 2 + level; // Level 1: 3 cells, Level 2: 4 cells, Level 3: 5 cells
    const newSequence = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      let randomCell;
      do {
        randomCell = Math.floor(Math.random() * GRID_SIZE);
      } while (newSequence.includes(randomCell)); // Avoid duplicates
      newSequence.push(randomCell);
    }
    
    return newSequence;
  };

  // 🔧 FIX #3: Complete state reset function
  const resetGame = () => {
    console.log('🔄 Resetting game to initial state');
    
    // Clear all pending timeouts
    timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutsRef.current = [];
    
    // Reset all state
    setCurrentLevel(1);
    setSequence([]);
    setPlayerInput([]);
    setIsPlayback(false);
    setActiveCells(new Set());
    setGameStatus('ready');
    setToasts([]);
    playbackIndexRef.current = 0;
    isCleaningUpRef.current = false;
  };

  // Start new level
  const startLevel = () => {
    const newSequence = generateSequence(currentLevel);
    setSequence(newSequence);
    setPlayerInput([]);
    setGameStatus('playing');
    setIsPlayback(true);
    playbackSequence(newSequence);
  };

  // Playback sequence animation with tracked timeouts
  const playbackSequence = async (seq) => {
    playbackIndexRef.current = 0;
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => {
        addTimeout(resolve, 600);
      });
      
      // Light up cell
      setActiveCells(new Set([seq[i]]));
      playClick();
      
      await new Promise(resolve => {
        addTimeout(resolve, 400);
      });
      
      // Turn off cell
      setActiveCells(new Set());
    }
    
    // Playback complete - player's turn
    await new Promise(resolve => {
      addTimeout(resolve, 400);
    });
    setIsPlayback(false);
  };

  // Handle cell click
  const handleCellClick = (cellIndex) => {
    // 🔧 FIX #2: Prevent clicks during playback or end screens
    if (isPlayback || gameStatus !== 'playing') return;

    playClick();
    
    const newInput = [...playerInput, cellIndex];
    setPlayerInput(newInput);
    
    // Flash the cell
    setActiveCells(new Set([cellIndex]));
    addTimeout(() => setActiveCells(new Set()), 200);
    
    // Check if input is correct so far
    const isCorrect = newInput.every((cell, idx) => cell === sequence[idx]);
    
    if (!isCorrect) {
      // Wrong input - game over
      handleLoss();
      return;
    }
    
    // Check if sequence is complete
    if (newInput.length === sequence.length) {
      // Level complete!
      if (currentLevel === LEVELS_TO_WIN) {
        // Game won!
        handleWin();
      } else {
        // Next level
        handleLevelComplete();
      }
    }
  };

  const handleLevelComplete = () => {
    playPowerUp();
    addToast('success', `LEVEL ${currentLevel} COMPLETE`, 'Pattern verified', null);
    
    addTimeout(() => {
      setCurrentLevel(prev => prev + 1);
      setPlayerInput([]);
    }, 1500);
  };

  // 🔧 FIX #2: Show WIN overlay instead of immediate completion
  const handleWin = async () => {
    console.log('🎉 Player won! Showing WIN overlay');
    setGameStatus('won');
    playWin();

    // Award KP through parent callback
    try {
      if (onComplete) {
        await onComplete(KP_REWARD);
      }
    } catch (error) {
      console.error('Failed to award KP:', error);
    }
  };

  // 🔧 FIX #2: Show LOSS overlay instead of immediate completion
  const handleLoss = async () => {
    console.log('💀 Player lost! Showing LOSS overlay');
    
    // Show toast notification first
    addToast('error', 'PATTERN MISMATCH', 'Neural sync disrupted', KP_PENALTY);
    
    // Wait 1.5 seconds before showing the mission report overlay
    // This allows the toast to be visible
    await new Promise(resolve => {
      addTimeout(resolve, 1500);
    });
    
    // Now show the loss overlay
    setGameStatus('lost');
    
    // Apply penalty through parent callback
    try {
      if (onComplete) {
        await onComplete(KP_PENALTY);
      }
    } catch (error) {
      console.error('Failed to apply penalty:', error);
    }
  };

  // 🔧 FIX #2: Retry button handler
  const handleRetry = () => {
    console.log('🔁 Player clicked RETRY');
    resetGame();
  };

  // 🔧 FIX #2: Exit button handler
  const handleExit = () => {
    console.log('🚪 Player clicked EXIT');
    cleanup();
    if (onClose) {
      onClose();
    }
  };

  const addToast = (type, title, message, kpAmount = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message, kpAmount }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Auto-start next level
  useEffect(() => {
    if (currentLevel > 1 && currentLevel <= LEVELS_TO_WIN && gameStatus === 'playing') {
      addTimeout(() => startLevel(), 1500);
    }
  }, [currentLevel]);

  const renderGrid = () => {
    return Array.from({ length: GRID_SIZE }).map((_, index) => {
      const isActive = activeCells.has(index);
      const isInPlayerInput = playerInput.includes(index);
      
      return (
        <div
          key={index}
          onClick={() => handleCellClick(index)}
          style={{
            ...styles.gridCell,
            background: isActive
              ? 'linear-gradient(135deg, #00d4ff, #0088cc)'
              : isInPlayerInput && !isPlayback
              ? 'rgba(0, 255, 136, 0.2)'
              : 'rgba(0, 0, 0, 0.5)',
            borderColor: isActive ? '#00d4ff' : 'rgba(0, 212, 255, 0.3)',
            boxShadow: isActive
              ? '0 0 30px rgba(0, 212, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.5)'
              : 'none',
            // 🔧 FIX #2: Disable clicks during playback AND end screens
            cursor: (isPlayback || gameStatus !== 'playing') ? 'not-allowed' : 'pointer',
            opacity: (isPlayback || gameStatus !== 'playing') ? 0.6 : 1,
            pointerEvents: (isPlayback || gameStatus !== 'playing') ? 'none' : 'auto',
            transform: isActive ? 'scale(0.95)' : 'scale(1)',
          }}
        >
          <div style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.3)',
            fontWeight: 'bold',
          }}>
            {index + 1}
          </div>
        </div>
      );
    });
  };

  return (
    <div style={styles.overlay}>
      {/* Toast Container */}
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
            <span style={{ fontSize: '2rem' }}>🧩</span>
            MEMORY MATRIX TERMINAL
          </div>
          <button onClick={handleExit} style={styles.closeBtn}>
            <i className="fas fa-times"></i> EXIT
          </button>
        </div>

        {/* Status Bar */}
        <div style={styles.statusBar}>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>DIFFICULTY</span>
            <span style={{ color: '#88dd00', fontSize: '1.2rem', fontWeight: 'bold' }}>EASY</span>
          </div>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>LEVEL</span>
            <span style={{ color: '#00d4ff', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {currentLevel} / {LEVELS_TO_WIN}
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>REWARD</span>
            <span style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 'bold' }}>+{KP_REWARD} KP</span>
          </div>
        </div>

        {/* Game Area */}
        <div style={styles.gameArea}>
          {/* Status Message */}
          <div style={styles.statusMessage}>
            {gameStatus === 'ready' && (
              <div style={{ color: '#00d4ff' }}>READY TO INITIALIZE PATTERN SCAN</div>
            )}
            {isPlayback && (
              <div style={{ color: '#00ff88', animation: 'pulse 1s infinite' }}>
                📡 SCANNING PATTERN... OBSERVE SEQUENCE
              </div>
            )}
            {!isPlayback && gameStatus === 'playing' && (
              <div style={{ color: '#ffd700' }}>
                ⚡ REPLICATE PATTERN ({playerInput.length}/{sequence.length})
              </div>
            )}
          </div>

          {/* 3x3 Grid */}
          <div style={styles.gridContainer}>
            <div style={styles.grid}>
              {renderGrid()}
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={styles.progressContainer}>
            <div style={styles.progressLabel}>SEQUENCE PROGRESS</div>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: sequence.length > 0 ? `${(playerInput.length / sequence.length) * 100}%` : '0%',
                background: playerInput.length === sequence.length
                  ? 'linear-gradient(90deg, #00ff88, #00aa66)'
                  : 'linear-gradient(90deg, #00d4ff, #0088cc)',
              }} />
            </div>
            <div style={styles.progressText}>
              {playerInput.length} / {sequence.length} cells
            </div>
          </div>

          {/* Start Button */}
          {gameStatus === 'ready' && (
            <button onClick={startLevel} style={styles.startButton}>
              <span style={{ fontSize: '1.5rem' }}>▶</span>
              INITIALIZE LEVEL {currentLevel}
            </button>
          )}

          {/* 🔧 FIX #2: MISSION REPORT OVERLAY - WIN STATE */}
          {gameStatus === 'won' && (
            <div style={styles.missionReportOverlay}>
              <div style={styles.missionReportContent}>
                <div style={styles.successIcon}>✓</div>
                <div style={styles.missionReportTitle}>MEMORY RESTORED</div>
                <div style={styles.missionReportSubtitle}>ALL PATTERN SEQUENCES DECODED</div>
                
                <div style={styles.rewardBox}>
                  <div style={styles.rewardLabel}>KNOWLEDGE AWARDED</div>
                  <div style={styles.rewardValue}>+{KP_REWARD} KP</div>
                </div>

                <div style={styles.levelBadges}>
                  {Array.from({ length: LEVELS_TO_WIN }).map((_, i) => (
                    <div key={i} style={styles.levelBadge}>
                      ✓ LEVEL {i + 1}
                    </div>
                  ))}
                </div>

                <div style={styles.buttonGroup}>
                  <button onClick={handleExit} style={styles.exitButton}>
                    <i className="fas fa-sign-out-alt"></i> EXIT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 🔧 FIX #2: MISSION REPORT OVERLAY - LOSS STATE */}
          {gameStatus === 'lost' && (
            <div style={styles.missionReportOverlay}>
              <div style={styles.missionReportContent}>
                <div style={styles.failureIcon}>✕</div>
                <div style={{...styles.missionReportTitle, color: '#ff4444'}}>SYNC FAILED</div>
                <div style={styles.missionReportSubtitle}>
                  PATTERN VERIFICATION INCOMPLETE
                </div>
                
                <div style={{...styles.rewardBox, borderColor: '#ff4444', background: 'rgba(255, 68, 68, 0.1)'}}>
                  <div style={{...styles.rewardLabel, color: '#ff4444'}}>SYSTEM DAMAGE</div>
                  <div style={{...styles.rewardValue, color: '#ff4444'}}>{KP_PENALTY} KP</div>
                </div>

                <div style={styles.statsBox}>
                  <div style={styles.statLine}>
                    <span style={{ color: '#888' }}>PROGRESS:</span>
                    <span style={{ color: '#ffd700' }}>Level {currentLevel} of {LEVELS_TO_WIN}</span>
                  </div>
                  <div style={styles.statLine}>
                    <span style={{ color: '#888' }}>ACCURACY:</span>
                    <span style={{ color: '#ff4444' }}>
                      {sequence.length > 0 ? `${Math.floor((playerInput.length / sequence.length) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>

                <div style={styles.buttonGroup}>
                  <button onClick={handleRetry} style={styles.retryButton}>
                    <i className="fas fa-redo"></i> RETRY
                  </button>
                  <button onClick={handleExit} style={styles.exitButtonSecondary}>
                    <i className="fas fa-sign-out-alt"></i> EXIT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={styles.instructions}>
          <div style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '0.5rem' }}>PROTOCOL:</div>
          <div>→ Observe the sequence of cells that light up</div>
          <div>→ Replicate the exact pattern by clicking the cells in order</div>
          <div>→ Complete all 3 levels with increasing difficulty</div>
          <div>→ Level 1: 3 cells | Level 2: 4 cells | Level 3: 5 cells</div>
        </div>
      </div>

      {/* Inject Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(20, 20, 40, 0.95))',
    border: '2px solid rgba(136, 221, 0, 0.3)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 0 40px rgba(136, 221, 0, 0.3)',
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
    color: '#88dd00',
    textShadow: '0 0 20px rgba(136, 221, 0, 0.6)',
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
  gameArea: {
    position: 'relative',
    minHeight: '400px',
  },
  statusMessage: {
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    letterSpacing: '2px',
    marginBottom: '2rem',
    minHeight: '30px',
  },
  gridContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    padding: '2rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    border: '2px solid rgba(0, 212, 255, 0.2)',
  },
  gridCell: {
    width: '100px',
    height: '100px',
    border: '2px solid',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  progressContainer: {
    marginBottom: '2rem',
  },
  progressLabel: {
    color: '#888',
    fontSize: '0.75rem',
    letterSpacing: '2px',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
  },
  progressBar: {
    height: '20px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    boxShadow: '0 0 15px currentColor',
  },
  progressText: {
    textAlign: 'center',
    color: '#00d4ff',
    fontSize: '0.9rem',
  },
  startButton: {
    width: '100%',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #00d4ff, #0088cc)',
    border: 'none',
    borderRadius: '12px',
    color: '#000',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    transition: 'all 0.3s ease',
    fontFamily: "'Courier New', monospace",
  },
  // 🔧 FIX #2: MISSION REPORT OVERLAY STYLES
  missionReportOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.97)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    animation: 'fadeIn 0.5s ease-out',
    zIndex: 10,
  },
  missionReportContent: {
    textAlign: 'center',
    color: '#fff',
    padding: '2rem',
    maxWidth: '500px',
    animation: 'slideUp 0.5s ease-out',
  },
  successIcon: {
    fontSize: '6rem',
    color: '#00ff88',
    textShadow: '0 0 40px rgba(0, 255, 136, 0.8)',
    marginBottom: '1.5rem',
    animation: 'pulse 2s infinite',
  },
  failureIcon: {
    fontSize: '6rem',
    color: '#ff4444',
    textShadow: '0 0 40px rgba(255, 68, 68, 0.8)',
    marginBottom: '1.5rem',
  },
  missionReportTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#00ff88',
    textShadow: '0 0 30px rgba(0, 255, 136, 0.6)',
    marginBottom: '0.5rem',
    letterSpacing: '4px',
    textTransform: 'uppercase',
  },
  missionReportSubtitle: {
    fontSize: '1rem',
    color: '#aaa',
    marginBottom: '2rem',
    letterSpacing: '2px',
  },
  rewardBox: {
    background: 'rgba(0, 255, 136, 0.1)',
    border: '2px solid #00ff88',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  rewardLabel: {
    fontSize: '0.8rem',
    color: '#00ff88',
    letterSpacing: '2px',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
  },
  rewardValue: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#00ff88',
    textShadow: '0 0 20px rgba(0, 255, 136, 0.6)',
  },
  levelBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  levelBadge: {
    background: 'rgba(0, 255, 136, 0.2)',
    border: '1px solid #00ff88',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    color: '#00ff88',
    letterSpacing: '1px',
  },
  statsBox: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
  },
  statLine: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '0.95rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  exitButton: {
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg, #00ff88, #00aa66)',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Courier New', monospace",
    textTransform: 'uppercase',
  },
  retryButton: {
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg, #00d4ff, #0088cc)',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Courier New', monospace",
    textTransform: 'uppercase',
  },
  exitButtonSecondary: {
    padding: '1rem 2.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Courier New', monospace",
    textTransform: 'uppercase',
  },
  instructions: {
    background: 'rgba(136, 221, 0, 0.05)',
    border: '1px solid rgba(136, 221, 0, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '0.9rem',
    color: '#aaa',
    lineHeight: '1.8',
  },
};

export default MemoryMatrixGame;
