import React, { useState, useEffect, useRef } from 'react';
import useUiSound from '../hooks/useUiSound';
import './CipherGame.css';

/**
 * CipherGame - Emergency Cipher Terminal Mini-Game
 * 
 * When user has 0 KP, they must decrypt scrambled tech words to earn KP back.
 * Features:
 * - Hacking terminal aesthetic (green text, black background, monospace)
 * - 5-second countdown per word
 * - Rewards +15 KP per successful decryption
 * - Sound effects for success/failure
 */
const CipherGame = ({ onWin, onClose }) => {
  // Word bank - tech/hacking themed words
  const WORD_BANK = [
    'LIBRARY', 'BOOK', 'PAGE', 'READ',
  'SHELF', 'INDEX', 'PAPER', 'INK','SCRIPT',
  'STUDY', 'LEARN', 'SCHOOL', 'CLASS', 'TEST',
  'GRADE', 'NOTE', 'QUIZ', 'EXAM', 'FACT', 'DATA', 'INPUT','CODE', 'LOGIC', 'DEBUG'
  ];

  const TIME_LIMIT = 5; // seconds per word
  const KP_REWARD = 15;

  // State management
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [flashError, setFlashError] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Sound hooks
  const { playClick, playWin, playPowerUp } = useUiSound();

  // 🔧 FIX: Cleanup function to stop all audio
  useEffect(() => {
    return () => {
      // Stop countdown audio on unmount
      stopCountdown();
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stopCountdown]);

  /**
   * Scramble a word - Fisher-Yates shuffle algorithm
   */
  const scrambleWord = (word) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const scrambled = arr.join('');
    // Ensure scrambled version is different from original
    return scrambled === word && word.length > 1 ? scrambleWord(word) : scrambled;
  };

  /**
   * Load next word challenge
   */
  const loadNextWord = () => {
    const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    setCurrentWord(randomWord);
    setScrambledWord(scrambleWord(randomWord));
    setUserInput('');
    setTimeLeft(TIME_LIMIT);
    setFeedback('');
    setIsActive(true);
    
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  /**
   * Handle successful decryption
   */
  const handleSuccess = () => {
    setFeedback('✓ DECRYPTION SUCCESSFUL');
    setScore(prev => prev + 1);
    playWin();
    
    // Award KP
    onWin(KP_REWARD);
    
    // Load next word after brief delay
    setTimeout(() => {
      loadNextWord();
    }, 1500);
  };

  /**
   * Handle timeout failure
   */
  const handleTimeout = () => {
    setFeedback('✗ PACKET LOST - SYSTEM TIMEOUT');
    setFlashError(true);
    setAttempts(prev => prev + 1);
    
    setTimeout(() => {
      setFlashError(false);
      loadNextWord();
    }, 2000);
  };

  /**
   * Handle user input submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isActive) return;
    
    const normalizedInput = userInput.trim().toUpperCase();
    
    if (normalizedInput === currentWord) {
      setIsActive(false);
      handleSuccess();
    } else {
      // Wrong answer - flash red and clear input
      setFlashError(true);
      playClick();
      setUserInput('');
      
      setTimeout(() => setFlashError(false), 300);
    }
  };

  /**
   * Timer countdown effect
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
        
        // Play warning sound at 2 seconds
        if (prev === 3) {
          playPowerUp();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, isActive]);

  /**
   * Initialize first word on mount
   */
  useEffect(() => {
    loadNextWord();
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="cipher-game-overlay">
      <div className={`cipher-terminal ${flashError ? 'error-flash' : ''}`}>
        
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="terminal-title">
            <span className="terminal-icon">⚠</span>
            EMERGENCY CIPHER TERMINAL
          </div>
          <button 
            className="terminal-close" 
            onClick={onClose}
            title="Exit (requires KP restore)"
          >
            ✕
          </button>
        </div>

        {/* Status Bar */}
        <div className="terminal-status">
          <div className="status-item">
            <span className="status-label">DECRYPTED:</span>
            <span className="status-value">{score}</span>
          </div>
          <div className="status-item">
            <span className="status-label">FAILED:</span>
            <span className="status-value">{attempts}</span>
          </div>
          <div className="status-item">
            <span className="status-label">REWARD:</span>
            <span className="status-value">+{KP_REWARD} KP</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="terminal-content">
          
          {/* System Message */}
          <div className="system-message">
            <div className="message-line">
              <span className="prompt">$</span> SYSTEM FAILURE DETECTED
            </div>
            <div className="message-line">
              <span className="prompt">$</span> KNOWLEDGE POINTS DEPLETED
            </div>
            <div className="message-line">
              <span className="prompt">$</span> DECRYPT CIPHERS TO RESTORE ACCESS
            </div>
          </div>

          {/* Scrambled Word Display */}
          <div className="cipher-display">
            <div className="cipher-label">ENCRYPTED PACKET:</div>
            <div className="cipher-text">{scrambledWord}</div>
          </div>

          {/* Timer Display */}
          <div className="timer-container">
            <div className="timer-bar-bg">
              <div 
                className="timer-bar-fill" 
                style={{ 
                  width: `${(timeLeft / TIME_LIMIT) * 100}%`,
                  backgroundColor: timeLeft <= 2 ? '#ff4444' : '#00ff88'
                }}
              />
            </div>
            <div className={`timer-value ${timeLeft <= 2 ? 'timer-critical' : ''}`}>
              {timeLeft}s
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="cipher-form">
            <div className="input-container">
              <span className="input-prompt">DECRYPT&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                className="cipher-input"
                placeholder="TYPE THE ORIGINAL WORD..."
                disabled={!isActive}
                autoFocus
                maxLength={15}
              />
            </div>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={!isActive || userInput.length === 0}
            >
              EXECUTE
            </button>
          </form>

          {/* Feedback Message */}
          {feedback && (
            <div className={`feedback-message ${feedback.includes('✓') ? 'success' : 'error'}`}>
              {feedback}
            </div>
          )}

          {/* Instructions */}
          <div className="instructions">
            <div className="instruction-line">• Unscramble the encrypted packet</div>
            <div className="instruction-line">• Type the original word</div>
            <div className="instruction-line">• Press EXECUTE or ENTER to submit</div>
            <div className="instruction-line">• Each success awards {KP_REWARD} KP</div>
          </div>

        </div>

        {/* Terminal Footer */}
        <div className="terminal-footer">
          <span className="footer-text">BiblioTheca Emergency Systems v2.1.0</span>
          <span className="footer-blink">█</span>
        </div>

      </div>
    </div>
  );
};

export default CipherGame;
