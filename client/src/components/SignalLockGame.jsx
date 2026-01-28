import React, { useState, useEffect, useRef } from 'react';
import useUiSound from '../hooks/useUiSound';
import ToastNotification from './ToastNotification';
import './DataBrokerWidget.css';

/**
 * SignalLockGame - Professional Timing Challenge (REFACTORED)
 * 
 * FIXED ISSUES:
 * ✅ Race Condition - Use refs to track real-time state in animation loop
 * ✅ Animation Cleanup - Immediate cancelAnimationFrame on LOCK click
 * ✅ Precise Hit Detection - Mathematical accuracy for target zone
 * ✅ Mission Report UI - Professional WIN/LOSS overlays
 * ✅ Proper XP Integration - Only calls onComplete on EXIT
 * ✅ Animation Restart - Properly restarts animation on retry
 * 
 * Game States: 'MENU' | 'PLAYING' | 'WIN' | 'LOSS'
 */

// Difficulty configurations with correct rewards/penalties
const DIFFICULTY_CONFIGS = {
  EASY: {
    name: 'EASY',
    reward: 15,
    penalty: 0,
    speed: 2.5, // seconds for full traversal
    hitZone: 40, // percentage
    color: '#00d4ff',
    description: 'Slow Speed | 40% Target'
  },
  MEDIUM: {
    name: 'MEDIUM',
    reward: 30,
    penalty: -10,
    speed: 1.5,
    hitZone: 20,
    color: '#ff8c00',
    description: 'Fast Speed | 20% Target'
  },
  HARD: {
    name: 'HARD',
    reward: 45,
    penalty: -20,
    speed: 0.8,
    hitZone: 10,
    color: '#ff0044',
    description: 'Glitch Speed | 10% Target'
  }
};

const SignalLockGame = ({ onClose, onComplete }) => {
  // 🎮 STRICT STATE MANAGEMENT
  const [gameState, setGameState] = useState('MENU'); // 'MENU' | 'PLAYING' | 'WIN' | 'LOSS'
  const [selectedDifficulty, setSelectedDifficulty] = useState('EASY');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hitZoneStart, setHitZoneStart] = useState(30);
  const [earnedKP, setEarnedKP] = useState(0); // Track KP for mission report
  const [toasts, setToasts] = useState([]);

  // 🔧 REFS for animation control and state tracking
  const animationRef = useRef(null);
  const directionRef = useRef(1); // 1 = forward, -1 = backward
  const gameStateRef = useRef('MENU'); // Track state in real-time for animation loop
  const positionRef = useRef(0); // Track position in real-time

  const { playClick, playWin, playPowerUp } = useUiSound();
  const config = DIFFICULTY_CONFIGS[selectedDifficulty];

  // Keep refs in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // 🧹 CLEANUP - Stop all animations and timers
  const cleanup = () => {
    console.log('🧹 Cleaning up SignalLockGame');
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // 🎯 START GAME - Begin signal animation
  const startGame = () => {
    console.log('🎮 Starting game with difficulty:', selectedDifficulty);
    
    // Clean up any existing animation first
    cleanup();
    
    // Generate random hit zone position
    const minStart = 10;
    const maxStart = 90 - config.hitZone;
    const randomStart = minStart + Math.random() * (maxStart - minStart);
    
    setHitZoneStart(randomStart);
    
    // Reset position
    setCursorPosition(0);
    positionRef.current = 0;
    directionRef.current = 1;
    
    // Update state synchronously
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
    
    playPowerUp();
    
    // Start animation immediately (state is already updated in ref)
    startAnimation();
  };

  // 🎬 ANIMATION LOOP - Move cursor back and forth
  const startAnimation = () => {
    console.log('🎬 Starting animation loop');
    
    const speed = (100 / (config.speed * 60)); // pixels per frame (60fps)
    let lastTimestamp = null;

    const animate = (timestamp) => {
      // CRITICAL: Check ref instead of state closure
      if (gameStateRef.current !== 'PLAYING') {
        console.log('⚠️ Animation stopped - game state is:', gameStateRef.current);
        animationRef.current = null;
        return;
      }

      // Calculate delta time for smooth animation
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Update position (aim for 60fps = 16.67ms per frame)
      const normalizedDelta = deltaTime / 16.67;
      positionRef.current += speed * directionRef.current * normalizedDelta;

      // Bounce at boundaries
      if (positionRef.current >= 100) {
        positionRef.current = 100;
        directionRef.current = -1;
      } else if (positionRef.current <= 0) {
        positionRef.current = 0;
        directionRef.current = 1;
      }

      setCursorPosition(positionRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // 🔒 LOCK ATTEMPT - Player clicks to lock signal
  const handleLockAttempt = () => {
    if (gameStateRef.current !== 'PLAYING') {
      console.log('⚠️ Lock attempt ignored - not in PLAYING state');
      return;
    }

    // 🚨 CRITICAL: IMMEDIATELY stop animation to prevent race conditions
    const currentPosition = positionRef.current;
    console.log('🔒 Lock attempt at position:', currentPosition);
    
    // Stop animation immediately
    cleanup();

    playClick();

    // 🎯 PRECISE HIT DETECTION
    const hitZoneEnd = hitZoneStart + config.hitZone;
    const isHit = currentPosition >= hitZoneStart && currentPosition <= hitZoneEnd;

    console.log('Hit detection:', {
      cursorPosition: currentPosition,
      hitZoneStart,
      hitZoneEnd,
      isHit
    });

    if (isHit) {
      // ✅ WIN
      handleWin();
    } else {
      // ❌ LOSS
      handleLoss();
    }
  };

  // ✅ WIN HANDLER
  const handleWin = () => {
    console.log('🎉 WIN! Awarding', config.reward, 'KP');
    
    setGameState('WIN');
    gameStateRef.current = 'WIN';
    setEarnedKP(config.reward);
    playWin();
  };

  // ❌ LOSS HANDLER
  const handleLoss = () => {
    console.log('💀 LOSS! Penalty:', config.penalty, 'KP');
    
    setGameState('LOSS');
    gameStateRef.current = 'LOSS';
    setEarnedKP(config.penalty);
    playClick();
  };

  // 🔄 RETRY - Reset to menu and restart
  const handleRetry = () => {
    console.log('🔁 Retry clicked');
    
    cleanup();
    setCursorPosition(0);
    positionRef.current = 0;
    setGameState('MENU');
    gameStateRef.current = 'MENU';
    setEarnedKP(0);
  };

  // 🚪 EXIT - Award/deduct KP and close
  const handleExit = async () => {
    console.log('🚪 Exit clicked - awarding KP:', earnedKP);
    
    cleanup();
    
    // Only call onComplete if there's a KP change (WIN or LOSS with penalty)
    if (onComplete && earnedKP !== 0) {
      try {
        await onComplete(earnedKP);
      } catch (error) {
        console.error('Failed to update KP:', error);
      }
    }
    
    if (onClose) {
      onClose();
    }
  };

  // Toast management
  const addToast = (type, title, message, kpAmount = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message, kpAmount }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
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

      <div className="data-broker-widget" style={styles.gameContainer}>
        
        {/* Header with Close Button */}
        <div className="broker-header" style={styles.header}>
          <div className="broker-title">
            <span className="broker-icon">🎯</span>
            SIGNAL LOCK TERMINAL
          </div>
          <button onClick={handleExit} style={styles.closeBtn}>
            <i className="fas fa-times"></i> EXIT
          </button>
        </div>

        {/* Difficulty Selector - Only show in MENU state */}
        {gameState === 'MENU' && (
          <div className="difficulty-selector">
            {Object.entries(DIFFICULTY_CONFIGS).map(([key, diff]) => {
              const isSelected = selectedDifficulty === key;
              
              return (
                <button
                  key={key}
                  className={`difficulty-btn ${isSelected ? 'selected' : ''}`}
                  style={{
                    borderColor: isSelected ? diff.color : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: isSelected ? `0 0 20px ${diff.color}40` : 'none'
                  }}
                  onClick={() => {
                    setSelectedDifficulty(key);
                    playClick();
                  }}
                >
                  <div className="diff-name" style={{ color: diff.color }}>{diff.name}</div>
                  <div className="diff-reward">
                    +{diff.reward} KP
                    {diff.penalty < 0 && <span style={{ color: '#ff4444', marginLeft: '0.5rem' }}>({diff.penalty} KP fail)</span>}
                  </div>
                  <div className="diff-desc">{diff.description}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Signal Bar - Show during MENU and PLAYING */}
        {(gameState === 'MENU' || gameState === 'PLAYING') && (
          <>
            <div className="signal-bar-container">
              <div className="signal-bar-label">SIGNAL TRACKER</div>
              
              <div className="signal-bar" style={{ borderColor: config.color }}>
                {/* Hit Zone */}
                <div 
                  className="hit-zone"
                  style={{
                    left: `${hitZoneStart}%`,
                    width: `${config.hitZone}%`,
                    backgroundColor: `${config.color}20`,
                    borderColor: config.color
                  }}
                >
                  <div className="hit-zone-label">TARGET</div>
                </div>

                {/* Moving Cursor */}
                <div 
                  className="signal-cursor"
                  style={{
                    left: `${cursorPosition}%`,
                    backgroundColor: config.color,
                    boxShadow: `0 0 15px ${config.color}`,
                    transition: 'none' // REMOVED TRANSITION - Instant updates for accurate clicking
                  }}
                />

                {/* Grid Lines */}
                <div className="signal-grid">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="grid-line" />
                  ))}
                </div>
              </div>

              <div className="signal-info">
                <span>Speed: {config.speed}s</span>
                <span>Zone: {config.hitZone}%</span>
                <span style={{ color: config.color }}>
                  Position: {Math.round(cursorPosition)}%
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="broker-controls">
              {gameState === 'MENU' ? (
                <button
                  className="start-btn"
                  onClick={startGame}
                  style={{
                    borderColor: config.color,
                    color: config.color
                  }}
                >
                  <span className="start-icon">▶</span>
                  START SIGNAL
                </button>
              ) : (
                <button
                  className="lock-btn"
                  onClick={handleLockAttempt}
                  style={{
                    backgroundColor: config.color,
                    boxShadow: `0 0 30px ${config.color}80`
                  }}
                >
                  <span className="lock-icon">🔒</span>
                  LOCK SIGNAL
                </button>
              )}
            </div>
          </>
        )}

        {/* 🎉 MISSION REPORT - WIN STATE */}
        {gameState === 'WIN' && (
          <div style={styles.missionReportOverlay}>
            <div style={styles.missionReportContent}>
              <div style={styles.successIcon}>✓</div>
              <div style={styles.missionReportTitle}>SIGNAL LOCKED</div>
              <div style={styles.missionReportSubtitle}>
                {selectedDifficulty} MODE COMPLETED
              </div>
              
              <div style={styles.rewardBox}>
                <div style={styles.rewardLabel}>DATA UPLOADED</div>
                <div style={styles.rewardValue}>+{config.reward} KP</div>
              </div>

              <div style={styles.statsBox}>
                <div style={styles.statLine}>
                  <span style={{ color: '#888' }}>DIFFICULTY:</span>
                  <span style={{ color: config.color }}>{config.name}</span>
                </div>
                <div style={styles.statLine}>
                  <span style={{ color: '#888' }}>LOCK POSITION:</span>
                  <span style={{ color: '#00ff88' }}>{Math.round(cursorPosition)}%</span>
                </div>
                <div style={styles.statLine}>
                  <span style={{ color: '#888' }}>TARGET ZONE:</span>
                  <span style={{ color: '#ffd700' }}>{Math.round(hitZoneStart)}% - {Math.round(hitZoneStart + config.hitZone)}%</span>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button onClick={handleExit} style={styles.exitButton}>
                  <i className="fas fa-sign-out-alt"></i> EXIT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 💀 MISSION REPORT - LOSS STATE */}
        {gameState === 'LOSS' && (
          <div style={styles.missionReportOverlay}>
            <div style={styles.missionReportContent}>
              <div style={styles.failureIcon}>✕</div>
              <div style={{...styles.missionReportTitle, color: '#ff4444'}}>SIGNAL LOST</div>
              <div style={styles.missionReportSubtitle}>
                TARGET ACQUISITION FAILED
              </div>
              
              {config.penalty < 0 ? (
                <div style={{...styles.rewardBox, borderColor: '#ff4444', background: 'rgba(255, 68, 68, 0.1)'}}>
                  <div style={{...styles.rewardLabel, color: '#ff4444'}}>SYSTEM DAMAGE</div>
                  <div style={{...styles.rewardValue, color: '#ff4444'}}>{config.penalty} KP</div>
                </div>
              ) : (
                <div style={{...styles.rewardBox, borderColor: '#ffd700', background: 'rgba(255, 215, 0, 0.1)'}}>
                  <div style={{...styles.rewardLabel, color: '#ffd700'}}>NO PENALTY</div>
                  <div style={{...styles.rewardValue, color: '#ffd700', fontSize: '1.5rem'}}>EASY MODE</div>
                </div>
              )}

              <div style={styles.statsBox}>
                <div style={styles.statLine}>
                  <span style={{ color: '#888' }}>DIFFICULTY:</span>
                  <span style={{ color: config.color }}>{config.name}</span>
                </div>
                <div style={styles.statLine}>
                  <span style={{ color: '#888' }}>LOCK POSITION:</span>
                  <span style={{ color: '#ff4444' }}>{Math.round(cursorPosition)}%</span>
                </div>
                <div style={styles.statLine}>
                  <span style={{ color: '#888' }}>TARGET ZONE:</span>
                  <span style={{ color: '#ffd700' }}>{Math.round(hitZoneStart)}% - {Math.round(hitZoneStart + config.hitZone)}%</span>
                </div>
                <div style={styles.statLine}>
                  <span style={{ color: '#888' }}>MISS DISTANCE:</span>
                  <span style={{ color: '#ff4444' }}>
                    {cursorPosition < hitZoneStart 
                      ? `${Math.round(hitZoneStart - cursorPosition)}% too early`
                      : `${Math.round(cursorPosition - (hitZoneStart + config.hitZone))}% too late`
                    }
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

        {/* Instructions - Only show in MENU */}
        {gameState === 'MENU' && (
          <div className="broker-instructions">
            <div className="instruction-title">OPERATION PROTOCOL:</div>
            <div className="instruction-item">→ Select difficulty level (EASY = no penalty)</div>
            <div className="instruction-item">→ Click START to activate signal</div>
            <div className="instruction-item">→ Click LOCK when cursor is in TARGET zone</div>
            <div className="instruction-item">→ Higher difficulty = More rewards & penalties</div>
          </div>
        )}

      </div>

      {/* Animations */}
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
  },
  gameContainer: {
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  // Mission Report Overlay Styles
  missionReportOverlay: {
    position: 'relative',
    minHeight: '500px',
    background: 'rgba(0, 0, 0, 0.97)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    animation: 'fadeIn 0.5s ease-out',
    padding: '2rem',
    marginTop: '2rem',
  },
  missionReportContent: {
    textAlign: 'center',
    color: '#fff',
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
  statsBox: {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
    textAlign: 'left',
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
};

export default SignalLockGame;
