import React, { useState, useEffect, useRef } from 'react';
import useUiSound from '../hooks/useUiSound';
import ToastNotification from './ToastNotification';
import './CipherGameModal.css';

/**
 * CipherGameModal - Voluntary Data Mining Mini-Game
 * 
 * A standalone Matrix-style word scramble game where users can earn extra KP.
 * Accessible via a "DATA MINING OPERATION" button on the dashboard.
 * 
 * Features:
 * - Tech-themed word scramble challenges
 * - 10-second countdown per word
 * - Rewards +15 KP per successful decode
 * - Matrix-style green-on-black aesthetic
 * - Professional win/loss feedback
 */
const CipherGameModal = ({ onClose, onWin }) => {
  // Enhanced tech word bank
  const WORD_BANK = [
// --- LIBRARY & KNOWLEDGE (Theme) ---
  'LIBRARY', 'BOOK', 'PAGE', 'READ',
  'SHELF', 'INDEX', 'PAPER', 'INK','SCRIPT',
  'STUDY', 'LEARN', 'SCHOOL', 'CLASS', 'TEST',
  'GRADE', 'NOTE', 'QUIZ', 'EXAM', 'FACT', 'DATA', 'INPUT','CODE', 'LOGIC', 'DEBUG'
  ];

  const TIME_LIMIT = 10; // seconds per word
  const KP_REWARD = 15;

  // State management
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [totalMined, setTotalMined] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [flashError, setFlashError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Refs
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const modalRef = useRef(null);

  // Sound hooks
  const { playClick, playWin, playCountdown, stopCountdown, playPowerUp } = useUiSound();

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
   * Scramble a word using Fisher-Yates shuffle
   */
  const scrambleWord = (word) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const scrambled = arr.join('');
    // Ensure it's actually scrambled
    return scrambled === word && word.length > 1 ? scrambleWord(word) : scrambled;
  };

  /**
   * Load next mining challenge
   */
  const loadNextChallenge = () => {
    const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    setCurrentWord(randomWord);
    setScrambledWord(scrambleWord(randomWord));
    setUserInput('');
    setTimeLeft(TIME_LIMIT);
    setFeedback('');
    setIsActive(true);
    setShowSuccess(false);
    setShowCelebration(false);
    
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  /**
   * Create celebration particles
   */
  const createCelebrationParticles = () => {
    const particles = [];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const velocity = 100 + Math.random() * 150;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      particles.push(
        <div
          key={i}
          className="win-particle"
          style={{
            left: '50%',
            top: '50%',
            '--tx': `${tx}px`,
            '--ty': `${ty}px`,
            animationDelay: `${Math.random() * 0.2}s`
          }}
        />
      );
    }
    return particles;
  };

  /**
   * Handle successful data mining
   */
  const handleSuccess = async () => {
    setFeedback('DATA MINED');
    setShowSuccess(true);
    setShowCelebration(true);
    setSuccessCount(prev => prev + 1);
    setTotalMined(prev => prev + KP_REWARD);
    
    // Play win sound
    playWin();
    
    // Add success glow to modal
    if (modalRef.current) {
      modalRef.current.classList.add('success-glow');
      setTimeout(() => modalRef.current?.classList.remove('success-glow'), 800);
    }
    
    // Award KP via parent callback
    try {
      await onWin(KP_REWARD);
      
      // Show toast notification
      addToast('success', 'DATA MINED!', 'Decryption successful', KP_REWARD);
      
      console.log(`✅ Successfully mined ${KP_REWARD} KP!`);
    } catch (error) {
      console.error('Failed to award KP:', error);
      addToast('error', 'SYNC ERROR', 'Failed to update KP');
    }
    
    // Load next challenge
    setTimeout(() => {
      loadNextChallenge();
    }, 2000);
  };

  /**
   * Handle timeout failure
   */
  const handleTimeout = () => {
    setFeedback('CONNECTION LOST');
    setFlashError(true);
    setFailCount(prev => prev + 1);
    
    // DON'T play countdown here - it's already finished
    // playCountdown(); // REMOVED
    
    // Add failure shake to modal
    if (modalRef.current) {
      modalRef.current.classList.add('failure-shake');
      setTimeout(() => modalRef.current?.classList.remove('failure-shake'), 500);
    }
    
    setTimeout(() => {
      setFlashError(false);
      loadNextChallenge();
    }, 2000);
  };

  /**
   * Handle user submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isActive || userInput.trim().length === 0) return;
    
    const normalizedInput = userInput.trim().toUpperCase();
    
    if (normalizedInput === currentWord) {
      setIsActive(false);
      handleSuccess();
    } else {
      // Wrong answer - flash and clear
      setFlashError(true);
      playClick();
      setUserInput('');
      
      setTimeout(() => setFlashError(false), 300);
    }
  };

  /**
   * Timer countdown
   */
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          handleTimeout();
          return 0;
        }
        
        // Play warning sound at 3 seconds (not countdown)
        if (prev === 3) {
          playPowerUp();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      // Stop countdown sound when timer cleanup happens
      stopCountdown();
    };
  }, [timeLeft, isActive, stopCountdown]);

  /**
   * Initialize on mount and cleanup on unmount
   */
  useEffect(() => {
    loadNextChallenge();
    
    return () => {
      clearInterval(timerRef.current);
      // Stop any playing countdown sounds when component unmounts
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

      <div className="cipher-modal-overlay" onClick={onClose}>
        <div 
          ref={modalRef}
          className={`cipher-modal ${flashError ? 'error-flash' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Win Celebration Effect */}
          {showCelebration && (
            <div className="win-celebration">
              <div className="win-burst">
                {createCelebrationParticles()}
              </div>
              <div className="win-text">SUCCESS!</div>
            </div>
          )}

          {/* Header */}
          <div className="cipher-modal-header">
            <div className="modal-title">
              <span className="title-icon">⚡</span>
              DATA MINING TERMINAL
            </div>
            <button 
              className="disconnect-btn" 
              onClick={onClose}
              title="Disconnect Terminal"
            >
              DISCONNECT
            </button>
          </div>

          {/* Stats Bar */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">MINED:</span>
              <span className="stat-value success">{successCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">FAILED:</span>
              <span className="stat-value error">{failCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">TOTAL KP:</span>
              <span className="stat-value kp">+{totalMined}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="cipher-modal-content">
            
            {/* System Status */}
            <div className="system-status">
              <div className="status-line">
                <span className="cmd-prompt">&gt;</span> INITIATING DATA EXTRACTION...
              </div>
              <div className="status-line">
                <span className="cmd-prompt">&gt;</span> DECRYPTING NETWORK PACKETS
              </div>
              <div className="status-line">
                <span className="cmd-prompt">&gt;</span> REWARD: {KP_REWARD} KP PER SUCCESSFUL MINE
              </div>
            </div>

            {/* Encrypted Data Display */}
            <div className="encrypted-display">
              <div className="encrypt-label">ENCRYPTED PACKET:</div>
              <div className="encrypted-text">{scrambledWord}</div>
            </div>

            {/* Timer */}
            <div className="timer-section">
              <div className="timer-label">TIME REMAINING</div>
              <div className="timer-bar-container">
                <div 
                  className="timer-bar" 
                  style={{ 
                    width: `${(timeLeft / TIME_LIMIT) * 100}%`,
                    backgroundColor: timeLeft <= 3 ? '#ff4444' : '#00ff88'
                  }}
                />
              </div>
              <div className={`timer-display ${timeLeft <= 3 ? 'critical' : ''}`}>
                {timeLeft}s
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mining-form">
              <div className="input-wrapper">
                <span className="input-label">DECODE&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                  className="decode-input"
                  placeholder="ENTER DECRYPTED TEXT..."
                  disabled={!isActive}
                  autoFocus
                  autoComplete="off"
                  maxLength={20}
                />
              </div>
              <button 
                type="submit" 
                className="mine-btn"
                disabled={!isActive || userInput.trim().length === 0}
              >
                EXTRACT DATA
              </button>
            </form>

            {/* Feedback */}
            {feedback && (
              <div className={`feedback ${showSuccess ? 'success-feedback' : 'error-feedback'}`}>
                {showSuccess && (
                  <>
                    <div className="feedback-title">✓ {feedback}</div>
                    <div className="kp-reward">+{KP_REWARD} KP</div>
                  </>
                )}
                {!showSuccess && (
                  <div className="feedback-title">✗ {feedback}</div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="instructions">
              <div className="instruction-title">OPERATION PROTOCOL:</div>
              <div className="instruction-item">→ Decrypt the scrambled packet</div>
              <div className="instruction-item">→ Type the original word in uppercase</div>
              <div className="instruction-item">→ Submit within {TIME_LIMIT} seconds</div>
              <div className="instruction-item">→ Earn {KP_REWARD} KP per successful extraction</div>
            </div>

          </div>

          {/* Footer */}
          <div className="cipher-modal-footer">
            <span className="footer-status">STATUS: MINING_ACTIVE</span>
            <span className="footer-cursor">█</span>
          </div>

        </div>
      </div>
    </>
  );
};

export default CipherGameModal;
