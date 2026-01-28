import React, { useState, useEffect, useRef } from 'react';
import { useGameEconomyContext } from '../context/GameEconomyContext';
import { useUser } from '../context/UserContext';
import useUiSound from '../hooks/useUiSound';
import ToastNotification from './ToastNotification';
import './DataBrokerWidget.css';

/**
 * DataBrokerWidget - Advanced Signal Locking Mini-Game
 * 
 * A professional-grade timing challenge with difficulty levels, cooldowns, and penalties.
 * Players must "lock" a moving cursor within a hit zone to earn KP rewards.
 * 
 * Features:
 * - 3 Difficulty levels: Easy, Medium, Hard
 * - Dynamic cooldown system with visual countdown
 * - Penalty lockouts for failures
 * - Signal bar animation with precision timing
 * - Professional color-coded UI (Cyan, Orange, Red)
 * - PERSISTENT KP updates via UserContext
 */

// Difficulty configurations
const DIFFICULTY_CONFIGS = {
  EASY: {
    name: 'EASY',
    reward: 15,
    speed: 2.5,        // seconds for full cycle
    hitZone: 40,       // percentage of bar
    cooldown: 2000,    // ms after any attempt
    penalty: 0,        // no lockout on fail
    color: '#00d4ff',  // Cyan
    description: 'Slow Speed | 40% Target'
  },
  MEDIUM: {
    name: 'MEDIUM',
    reward: 30,
    speed: 1.5,        // faster
    hitZone: 20,       // smaller target
    cooldown: 3000,    // longer cooldown
    penalty: 5000,     // 5s lockout on fail
    color: '#ff8c00',  // Orange
    description: 'Fast Speed | 20% Target'
  },
  HARD: {
    name: 'HARD',
    reward: 45,
    speed: 0.8,        // glitch speed
    hitZone: 10,       // tiny target
    cooldown: 4000,    // even longer cooldown
    penalty: 5000,     // 5s system lockout on fail
    color: '#ff0044',  // Red
    description: 'Glitch Speed | 10% Target'
  }
};

const DataBrokerWidget = ({ onWin, isCompact = false }) => {
  // 🔥 CONNECT TO CONTEXTS FOR PERSISTENCE
  const { updateKP } = useGameEconomyContext();
  const { updateKP: updateUserKP } = useUser();

  // State management
  const [selectedDifficulty, setSelectedDifficulty] = useState('EASY');
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hitZoneStart, setHitZoneStart] = useState(30);
  const [result, setResult] = useState(null);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [stats, setStats] = useState({
    easy: { wins: 0, fails: 0 },
    medium: { wins: 0, fails: 0 },
    hard: { wins: 0, fails: 0 }
  });

  // Refs
  const animationRef = useRef(null);
  const cooldownIntervalRef = useRef(null);
  const lockoutIntervalRef = useRef(null);

  // Sound hooks
  const { playClick, playWin, playPowerUp, playHover, playCountdown, stopCountdown } = useUiSound();

  // Current difficulty config
  const config = DIFFICULTY_CONFIGS[selectedDifficulty];

  /**
   * Add toast notification
   */
  const addToast = (type, title, message, kpAmount = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message, kpAmount }]);
  };

  /**
   * Remove toast notification
   */
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  /**
   * Start signal animation
   */
  const startSignalAnimation = () => {
    setIsPlaying(true);
    setResult(null);
    
    // Randomize hit zone position (ensure it's not at edges)
    const minStart = 10;
    const maxStart = 90 - config.hitZone;
    setHitZoneStart(minStart + Math.random() * (maxStart - minStart));

    let direction = 1;
    let position = 0;
    const speed = (100 / (config.speed * 60)); // pixels per frame at 60fps

    const animate = () => {
      position += speed * direction;

      // Bounce at edges
      if (position >= 100) {
        position = 100;
        direction = -1;
      } else if (position <= 0) {
        position = 0;
        direction = 1;
      }

      setCursorPosition(position);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  /**
   * Stop signal animation
   */
  const stopSignalAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  };

  /**
   * Start cooldown timer
   */
  const startCooldown = (duration) => {
    setIsOnCooldown(true);
    setCooldownTime(Math.ceil(duration / 1000));

    cooldownIntervalRef.current = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          setIsOnCooldown(false);
          clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      setIsOnCooldown(false);
      setCooldownTime(0);
    }, duration);
  };

  /**
   * Start lockout penalty
   */
  const startLockout = (duration) => {
    const seconds = Math.ceil(duration / 1000);
    setIsLocked(true);
    setLockoutTime(seconds);
    
    // DON'T play countdown sound yet - wait until countdown reaches 4
    if (seconds <= 4) {
      playCountdown();
    }

    lockoutIntervalRef.current = setInterval(() => {
      setLockoutTime(prev => {
        const newTime = prev - 1;
        
        // Start countdown sound when we hit 4
        if (newTime === 4) {
          playCountdown();
        }
        
        if (newTime <= 0) {
          setIsLocked(false);
          clearInterval(lockoutIntervalRef.current);
          stopCountdown();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    setTimeout(() => {
      setIsLocked(false);
      setLockoutTime(0);
      stopCountdown();
    }, duration);
  };

  /**
   * Handle lock attempt - UPDATED WITH PERSISTENCE
   */
  const handleLockAttempt = async () => {
    if (!isPlaying || isOnCooldown || isLocked) return;

    stopSignalAnimation();
    playClick();

    // Check if cursor is in hit zone
    const hitZoneEnd = hitZoneStart + config.hitZone;
    const isHit = cursorPosition >= hitZoneStart && cursorPosition <= hitZoneEnd;

    if (isHit) {
      // SUCCESS
      setResult('success');
      playWin();

      // Update stats
      setStats(prev => ({
        ...prev,
        [selectedDifficulty.toLowerCase()]: {
          ...prev[selectedDifficulty.toLowerCase()],
          wins: prev[selectedDifficulty.toLowerCase()].wins + 1
        }
      }));

      // 💰 AWARD KP WITH DUAL SYNC (GameEconomy + UserContext)
      try {
        await updateKP(config.reward); // Game economy (navbar)
        updateUserKP(config.reward);   // User context (persisted to localStorage)
        
        console.log(`✅ Data Broker: Awarded ${config.reward} KP (${selectedDifficulty} difficulty)`);
        
        addToast('success', 'SIGNAL LOCKED!', `Data extracted successfully`, config.reward);
        
        // Call parent callback if provided
        if (onWin) {
          await onWin(config.reward);
        }
      } catch (error) {
        console.error('❌ Failed to award KP:', error);
        addToast('error', 'SYNC ERROR', 'Failed to update KP');
      }

      // Start cooldown
      startCooldown(config.cooldown);

      // Reset after 2 seconds
      setTimeout(() => {
        setResult(null);
        setCursorPosition(0);
      }, 2000);

    } else {
      // FAILURE
      setResult('fail');
      playPowerUp(); // Error sound

      // Update stats
      setStats(prev => ({
        ...prev,
        [selectedDifficulty.toLowerCase()]: {
          ...prev[selectedDifficulty.toLowerCase()],
          fails: prev[selectedDifficulty.toLowerCase()].fails + 1
        }
      }));

      // Apply penalty if exists
      if (config.penalty > 0) {
        addToast('error', 'LOCK FAILED!', `System lockout: ${config.penalty / 1000}s`, null);
        startLockout(config.penalty);
      } else {
        addToast('warning', 'LOCK FAILED!', 'Try again', null);
        startCooldown(config.cooldown);
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setResult(null);
        setCursorPosition(0);
      }, 2000);
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopSignalAnimation();
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
      if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
      stopCountdown();
    };
  }, [stopCountdown]);

  return (
    <>
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

      <div className={`data-broker-widget ${isCompact ? 'compact' : ''}`}>
        
        {/* Header */}
        <div className="broker-header">
          <div className="broker-title">
            <span className="broker-icon">🎯</span>
            SIGNAL LOCK TERMINAL
          </div>
          <div className="broker-status" style={{ color: isLocked ? '#ff0044' : '#00ff88' }}>
            {isLocked ? '🔒 LOCKED' : '✓ ACTIVE'}
          </div>
        </div>

        {/* Lockout Overlay */}
        {isLocked && (
          <div className="lockout-overlay">
            <div className="lockout-content">
              <div className="lockout-icon">⚠️</div>
              <div className="lockout-title">SYSTEM LOCKOUT</div>
              <div className="lockout-timer">{lockoutTime}s</div>
              <div className="lockout-message">Security protocol active...</div>
            </div>
          </div>
        )}

        {/* Difficulty Selector */}
        <div className="difficulty-selector">
          {Object.entries(DIFFICULTY_CONFIGS).map(([key, diff]) => {
            const isSelected = selectedDifficulty === key;
            const diffStats = stats[key.toLowerCase()];
            
            return (
              <button
                key={key}
                className={`difficulty-btn ${isSelected ? 'selected' : ''}`}
                style={{
                  borderColor: isSelected ? diff.color : 'rgba(255, 255, 255, 0.2)',
                  boxShadow: isSelected ? `0 0 20px ${diff.color}40` : 'none'
                }}
                onClick={() => {
                  if (!isPlaying && !isLocked) {
                    setSelectedDifficulty(key);
                    playHover();
                  }
                }}
                disabled={isPlaying || isLocked}
                onMouseEnter={playHover}
              >
                <div className="diff-name" style={{ color: diff.color }}>{diff.name}</div>
                <div className="diff-reward">+{diff.reward} KP</div>
                <div className="diff-desc">{diff.description}</div>
                <div className="diff-stats">
                  <span className="stat-wins">✓ {diffStats.wins}</span>
                  <span className="stat-fails">✗ {diffStats.fails}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Signal Bar */}
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

            {/* Cursor */}
            <div 
              className={`signal-cursor ${result ? `cursor-${result}` : ''}`}
              style={{
                left: `${cursorPosition}%`,
                backgroundColor: config.color,
                boxShadow: `0 0 15px ${config.color}`
              }}
            />

            {/* Background Grid */}
            <div className="signal-grid">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid-line" />
              ))}
            </div>
          </div>

          {/* Signal Bar Footer */}
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
          {!isPlaying ? (
            <button
              className="start-btn"
              onClick={() => {
                if (!isOnCooldown && !isLocked) {
                  startSignalAnimation();
                  playPowerUp();
                }
              }}
              disabled={isOnCooldown || isLocked}
              style={{
                borderColor: config.color,
                color: config.color
              }}
            >
              {isOnCooldown ? (
                <>
                  <span className="cooldown-icon">⏳</span>
                  RECHARGING... {cooldownTime}s
                </>
              ) : (
                <>
                  <span className="start-icon">▶</span>
                  START SIGNAL
                </>
              )}
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

        {/* Result Feedback */}
        {result && (
          <div className={`result-feedback ${result}`}>
            {result === 'success' ? (
              <>
                <div className="result-icon">✓</div>
                <div className="result-text">SIGNAL LOCKED!</div>
                <div className="result-kp">+{config.reward} KP</div>
              </>
            ) : (
              <>
                <div className="result-icon">✗</div>
                <div className="result-text">LOCK FAILED</div>
                {config.penalty > 0 && (
                  <div className="result-penalty">Lockout: {config.penalty / 1000}s</div>
                )}
              </>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="broker-instructions">
          <div className="instruction-title">OPERATION PROTOCOL:</div>
          <div className="instruction-item">→ Select difficulty level</div>
          <div className="instruction-item">→ Click START to activate signal</div>
          <div className="instruction-item">→ Click LOCK when cursor is in TARGET zone</div>
          <div className="instruction-item">→ Higher difficulty = More rewards & penalties</div>
        </div>

      </div>
    </>
  );
};

export default DataBrokerWidget;
