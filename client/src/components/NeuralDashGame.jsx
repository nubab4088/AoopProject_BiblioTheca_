import React, { useState, useEffect, useRef } from 'react';
import useUiSound from '../hooks/useUiSound';
import ToastNotification from './ToastNotification';

/**
 * NeuralDashGame - Endless Runner Reflex Challenge
 * 
 * Navigate a data packet through firewall barriers.
 * Professional cyberpunk-themed reflex game.
 * 
 * Difficulty: EASY/MED | Win: +40 KP | Loss: -20 KP
 */

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400; // FIXED: Reduced from 800 to fit modal
const PLAYER_SIZE = 20;
const OBSTACLE_WIDTH = 80;
const OBSTACLE_HEIGHT = 20;
const OBSTACLE_SPEED = 5;
const OBSTACLE_SPAWN_RATE = 1500; // ms
const GAME_DURATION = 20; // seconds
const KP_REWARD = 40;
const KP_PENALTY = -20;

const NeuralDashGame = ({ onComplete, onClose }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timerRef = useRef(null); // ✅ useRef for intervalId
  const obstaclesRef = useRef([]);
  const playerXRef = useRef(CANVAS_WIDTH / 2);
  const lastSpawnRef = useRef(0);
  const keysRef = useRef({ left: false, right: false });

  const [gameState, setGameState] = useState('PLAYING'); // FIXED: Proper state management
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [toasts, setToasts] = useState([]);

  const { playClick, playWin, stopCountdown, stopCountdown2 } = useUiSound();

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

    // Cancel animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => stopGame();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleWin();
          return 0;
        }
        // REMOVED: Countdown sound at 5 seconds - no audio warning
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let lastTime = performance.now();

    const gameLoop = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw grid background
      drawGrid(ctx);

      // Update player position based on keys
      if (keysRef.current.left) {
        playerXRef.current = Math.max(PLAYER_SIZE, playerXRef.current - 8);
      }
      if (keysRef.current.right) {
        playerXRef.current = Math.min(CANVAS_WIDTH - PLAYER_SIZE, playerXRef.current + 8);
      }

      // Spawn obstacles
      if (currentTime - lastSpawnRef.current > OBSTACLE_SPAWN_RATE) {
        spawnObstacle();
        lastSpawnRef.current = currentTime;
      }

      // Update and draw obstacles
      updateObstacles();
      drawObstacles(ctx);

      // Draw player
      drawPlayer(ctx);

      // Check collisions
      if (checkCollision()) {
        handleCollision();
        return;
      }

      // Continue loop
      if (gameState === 'PLAYING') {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse controls
  const handleMouseMove = (e) => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    playerXRef.current = Math.max(
      PLAYER_SIZE,
      Math.min(CANVAS_WIDTH - PLAYER_SIZE, e.clientX - rect.left)
    );
  };

  const spawnObstacle = () => {
    const gapPosition = Math.random() * (CANVAS_WIDTH - OBSTACLE_WIDTH * 2);
    
    obstaclesRef.current.push({
      y: -OBSTACLE_HEIGHT,
      gapStart: gapPosition,
      gapEnd: gapPosition + OBSTACLE_WIDTH * 1.5,
      passed: false
    });
  };

  const updateObstacles = () => {
    obstaclesRef.current = obstaclesRef.current.filter(obstacle => {
      obstacle.y += OBSTACLE_SPEED;

      // Check if player passed obstacle
      if (!obstacle.passed && obstacle.y > CANVAS_HEIGHT / 2) {
        obstacle.passed = true;
        setScore(prev => prev + 10);
        playClick();
      }

      return obstacle.y < CANVAS_HEIGHT + OBSTACLE_HEIGHT;
    });
  };

  const drawGrid = (ctx) => {
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  };

  const drawPlayer = (ctx) => {
    const playerY = CANVAS_HEIGHT - 60; // FIXED: Adjusted for new canvas height

    // Glow effect
    const gradient = ctx.createRadialGradient(
      playerXRef.current, playerY,
      0,
      playerXRef.current, playerY,
      PLAYER_SIZE * 2
    );
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(
      playerXRef.current - PLAYER_SIZE * 2,
      playerY - PLAYER_SIZE * 2,
      PLAYER_SIZE * 4,
      PLAYER_SIZE * 4
    );

    // Player dot
    ctx.fillStyle = '#00d4ff';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(playerXRef.current, playerY, PLAYER_SIZE, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const drawObstacles = (ctx) => {
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 10;

    obstaclesRef.current.forEach(obstacle => {
      // Left barrier
      ctx.fillRect(0, obstacle.y, obstacle.gapStart, OBSTACLE_HEIGHT);
      
      // Right barrier
      ctx.fillRect(
        obstacle.gapEnd,
        obstacle.y,
        CANVAS_WIDTH - obstacle.gapEnd,
        OBSTACLE_HEIGHT
      );
    });

    ctx.shadowBlur = 0;
  };

  const checkCollision = () => {
    const playerY = CANVAS_HEIGHT - 60; // FIXED: Match drawPlayer position

    return obstaclesRef.current.some(obstacle => {
      const playerBottom = playerY + PLAYER_SIZE;
      const playerTop = playerY - PLAYER_SIZE;
      const obstacleBottom = obstacle.y + OBSTACLE_HEIGHT;
      const obstacleTop = obstacle.y;

      // Check if vertically aligned
      if (playerBottom >= obstacleTop && playerTop <= obstacleBottom) {
        // Check if horizontally colliding (not in gap)
        if (playerXRef.current < obstacle.gapStart + PLAYER_SIZE ||
            playerXRef.current > obstacle.gapEnd - PLAYER_SIZE) {
          return true;
        }
      }
      return false;
    });
  };

  // ✅ CLEANUP AT START OF handleCollision
  const handleCollision = () => {
    stopGame(); // ✅ Kill switch activated FIRST
    
    setGameState('GAME_OVER');
    // REMOVED: playCountdown(); - No countdown sound on collision
    onComplete(KP_PENALTY);
    addToast('error', 'CONNECTION SEVERED!', 'Neural pathway disrupted', KP_PENALTY);
  };

  // ✅ CLEANUP AT START OF handleWin
  const handleWin = async () => {
    stopGame(); // ✅ Kill switch activated FIRST
    
    setGameState('WIN');
    playWin();

    try {
      await onComplete(KP_REWARD);
      addToast('success', 'NEURAL LINK ESTABLISHED!', 'Data transmitted successfully', KP_REWARD);
    } catch (error) {
      console.error('Failed to award KP:', error);
    }
  };

  // FIXED: Retry function to reset game without closing modal
  const handleRetry = () => {
    // Reset all game state
    setGameState('PLAYING');
    setTimeLeft(GAME_DURATION);
    setScore(0);
    obstaclesRef.current = [];
    playerXRef.current = CANVAS_WIDTH / 2;
    lastSpawnRef.current = 0;
    keysRef.current = { left: false, right: false };
    setToasts([]);
  };

  const addToast = (type, title, message, kpAmount = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message, kpAmount }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
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
            NEURAL DASH TERMINAL
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <i className="fas fa-times"></i> EXIT
          </button>
        </div>

        {/* Status Bar */}
        <div style={styles.statusBar}>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>DIFFICULTY</span>
            <span style={{ color: '#00ccff', fontSize: '1.2rem', fontWeight: 'bold' }}>EASY/MED</span>
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
            <span style={{ color: '#888', fontSize: '0.8rem' }}>SCORE</span>
            <span style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {score}
            </span>
          </div>
        </div>

        {/* Game Canvas - FIXED: Proper container with no overflow */}
        <div style={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={styles.canvas}
            onMouseMove={handleMouseMove}
          />
        </div>

        {/* FIXED: Mission Report Overlay with Retry */}
        {gameState === 'WIN' && (
          <div style={styles.missionOverlay}>
            <div style={styles.missionContent}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 30px rgba(0, 255, 136, 0.8))' }}>✓</div>
              <div style={styles.missionTitle}>NEURAL LINK ESTABLISHED</div>
              <div style={styles.missionMessage}>Data transmission successful</div>
              <div style={styles.scoreDisplay}>Final Score: {score}</div>
              <div style={styles.kpReward}>+{KP_REWARD} KP</div>
              <button onClick={onClose} style={styles.exitButton}>
                <i className="fas fa-sign-out-alt"></i> EXIT TERMINAL
              </button>
            </div>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div style={{...styles.missionOverlay, background: 'rgba(20, 0, 0, 0.98)'}}>
            <div style={styles.missionContent}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 30px rgba(255, 68, 68, 0.8))' }}>✕</div>
              <div style={{...styles.missionTitle, color: '#ff4444'}}>CONNECTION SEVERED</div>
              <div style={styles.missionMessage}>Neural pathway disrupted</div>
              <div style={styles.scoreDisplay}>Final Score: {score}</div>
              <div style={styles.kpPenalty}>{KP_PENALTY} KP</div>
              <div style={styles.buttonGroup}>
                <button onClick={handleRetry} style={styles.retryButton}>
                  <i className="fas fa-redo"></i> RETRY MISSION
                </button>
                <button onClick={onClose} style={styles.exitButtonAlt}>
                  <i className="fas fa-sign-out-alt"></i> EXIT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={styles.instructions}>
          <div style={{ color: '#00ccff', fontWeight: 'bold', marginBottom: '0.5rem' }}>⚡ MISSION BRIEFING:</div>
          <div>→ Move Mouse Left/Right OR Arrow Keys/A/D to control neural packet</div>
          <div>→ Navigate through gaps in red firewall barriers</div>
          <div>→ Survive for {GAME_DURATION} seconds to establish neural link</div>
          <div>→ Collision with barriers = CONNECTION SEVERED</div>
          <div style={{ marginTop: '0.5rem', color: '#ffd700' }}>→ Victory: +{KP_REWARD} KP | Defeat: {KP_PENALTY} KP</div>
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
    overflow: 'hidden', // FIXED: Prevent overlay scroll
  },
  container: {
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden', // FIXED: Changed from overflowY to overflow hidden
    background: 'linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(20, 20, 40, 0.95))',
    border: '2px solid rgba(0, 204, 255, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem', // FIXED: Reduced padding
    boxShadow: '0 0 40px rgba(0, 204, 255, 0.3)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem', // FIXED: Reduced margin
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: '1.5rem', // FIXED: Slightly smaller
    fontWeight: 'bold',
    color: '#00ccff',
    textShadow: '0 0 20px rgba(0, 204, 255, 0.6)',
    letterSpacing: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
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
    marginBottom: '1rem', // FIXED: Reduced margin
  },
  statusItem: {
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '0.75rem', // FIXED: Reduced padding
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  canvasContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem', // FIXED: Reduced margin
    position: 'relative',
    overflow: 'hidden', // FIXED: Prevent canvas overflow
  },
  canvas: {
    border: '2px solid rgba(0, 204, 255, 0.3)',
    borderRadius: '8px',
    background: '#000',
    boxShadow: '0 0 20px rgba(0, 204, 255, 0.2)',
    display: 'block',
  },
  missionOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 20, 10, 0.98)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    animation: 'fadeIn 0.3s ease',
  },
  missionContent: {
    textAlign: 'center',
    color: '#fff',
    padding: '2rem',
  },
  missionTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#00ff88',
    textShadow: '0 0 30px rgba(0, 255, 136, 0.8)',
    marginBottom: '1rem',
    letterSpacing: '4px',
  },
  missionMessage: {
    fontSize: '1.2rem',
    color: '#aaa',
    marginBottom: '1.5rem',
    letterSpacing: '1px',
  },
  scoreDisplay: {
    fontSize: '1.5rem',
    color: '#00ccff',
    marginBottom: '1rem',
    fontWeight: 'bold',
  },
  kpReward: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#ffd700',
    textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
    marginBottom: '2rem',
    animation: 'pulse 1s infinite',
  },
  kpPenalty: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#ff4444',
    textShadow: '0 0 30px rgba(255, 68, 68, 0.8)',
    marginBottom: '2rem',
    animation: 'pulse 1s infinite',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  exitButton: {
    marginTop: '1rem',
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg, #00ccff, #0088aa)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 204, 255, 0.4)',
  },
  retryButton: {
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg, #00ff88, #00aa55)',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 255, 136, 0.4)',
  },
  exitButtonAlt: {
    padding: '1rem 2.5rem',
    background: 'linear-gradient(135deg, #666, #444)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
  },
  instructions: {
    background: 'rgba(0, 204, 255, 0.05)',
    border: '1px solid rgba(0, 204, 255, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '0.85rem', // FIXED: Slightly smaller
    color: '#aaa',
    lineHeight: '1.6',
  },
};

export default NeuralDashGame;
