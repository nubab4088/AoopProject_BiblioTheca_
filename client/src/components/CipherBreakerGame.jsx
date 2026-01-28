import React, { useState, useEffect } from 'react';
import useUiSound from '../hooks/useUiSound';
import ToastNotification from './ToastNotification';

/**
 * CipherBreakerGame - Hangman-style Password Decryption
 * 
 * A professional cyberpunk-themed word guessing game.
 * Players must decrypt security terms by guessing letters.
 * 
 * Difficulty: HARD | Reward: +75 KP | Lives: 6 Integrity Blocks
 */

const WORD_BANK = [
  'ENCRYPTION',
  'MAINFRAME',
  'FIREWALL',
  'EXPLOIT',
  'HANDSHAKE',
  'PROTOCOL',
  'BACKDOOR',
  'ROOTKIT',
  'PAYLOAD',
  'MALWARE'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_ATTEMPTS = 6;
const KP_REWARD = 75;
const KP_PENALTY = -40;

const CipherBreakerGame = ({ onClose, onWin, onComplete }) => {
  const { playClick, playWin, playPowerUp, stopCountdown } = useUiSound();

  const [targetWord, setTargetWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [remainingAttempts, setRemainingAttempts] = useState(MAX_ATTEMPTS);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [toasts, setToasts] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // 🔧 FIX: Cleanup function to stop all audio
  useEffect(() => {
    return () => {
      // Stop countdown audio on unmount
      stopCountdown();
    };
  }, [stopCountdown]);

  // Initialize game
  useEffect(() => {
    const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    setTargetWord(randomWord);
  }, []);

  // Check win/loss conditions
  useEffect(() => {
    if (!targetWord || gameStatus !== 'playing') return;

    const wordLetters = new Set(targetWord.split(''));
    const allGuessed = [...wordLetters].every(letter => guessedLetters.has(letter));

    if (allGuessed) {
      handleWin();
    } else if (remainingAttempts === 0) {
      handleLoss();
    }
  }, [guessedLetters, remainingAttempts, targetWord]);

  const handleWin = async () => {
    setGameStatus('won');
    setShowCelebration(true);
    playWin();

    try {
      await onWin(KP_REWARD);
      addToast('success', 'ACCESS GRANTED!', 'Password decrypted successfully', KP_REWARD);
    } catch (error) {
      console.error('Failed to award KP:', error);
      addToast('error', 'SYNC ERROR', 'Failed to update KP');
    }
  };

  const handleLoss = async () => {
    setGameStatus('lost');
    
    try {
      // Call onComplete with penalty if provided (for DungeonPlatform integration)
      if (onComplete) {
        await onComplete(KP_PENALTY);
        addToast('error', 'SYSTEM LOCKDOWN', `Integrity compromised`, KP_PENALTY);
      } else {
        addToast('error', 'SYSTEM LOCKDOWN', 'Decryption failed - Access denied');
      }
    } catch (error) {
      console.error('Failed to apply penalty:', error);
      addToast('error', 'SYSTEM LOCKDOWN', 'Decryption failed - Access denied');
    }
  };

  const handleLetterGuess = (letter) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return;

    playClick();
    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    // Check if letter is in word
    if (!targetWord.includes(letter)) {
      setRemainingAttempts(prev => prev - 1);
      playPowerUp(); // Wrong guess sound
    }
  };

  const addToast = (type, title, message, kpAmount = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message, kpAmount }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const renderWord = () => {
    return targetWord.split('').map((letter, index) => (
      <div
        key={index}
        style={styles.letterBox}
        className={guessedLetters.has(letter) ? 'revealed' : ''}
      >
        {guessedLetters.has(letter) ? letter : '_'}
      </div>
    ));
  };

  const renderIntegrityBlocks = () => {
    return Array.from({ length: MAX_ATTEMPTS }).map((_, index) => {
      const isIntact = index < remainingAttempts;
      return (
        <div
          key={index}
          style={{
            ...styles.integrityBlock,
            background: isIntact
              ? 'linear-gradient(135deg, #00ff88, #00aa66)'
              : 'linear-gradient(135deg, #ff4444, #aa0000)',
            boxShadow: isIntact
              ? '0 0 15px rgba(0, 255, 136, 0.6)'
              : '0 0 15px rgba(255, 68, 68, 0.6)',
            opacity: isIntact ? 1 : 0.3
          }}
          className={!isIntact ? 'broken' : ''}
        >
          {isIntact ? '■' : '✕'}
        </div>
      );
    });
  };

  const renderKeyboard = () => {
    return (
      <div style={styles.keyboard}>
        {ALPHABET.map(letter => {
          const isGuessed = guessedLetters.has(letter);
          const isCorrect = isGuessed && targetWord.includes(letter);
          const isWrong = isGuessed && !targetWord.includes(letter);

          return (
            <button
              key={letter}
              onClick={() => handleLetterGuess(letter)}
              disabled={isGuessed || gameStatus !== 'playing'}
              style={{
                ...styles.keyButton,
                background: isCorrect
                  ? 'rgba(0, 255, 136, 0.3)'
                  : isWrong
                  ? 'rgba(255, 68, 68, 0.3)'
                  : 'rgba(255, 255, 255, 0.05)',
                borderColor: isCorrect
                  ? '#00ff88'
                  : isWrong
                  ? '#ff4444'
                  : 'rgba(255, 255, 255, 0.2)',
                cursor: isGuessed || gameStatus !== 'playing' ? 'not-allowed' : 'pointer',
                opacity: isGuessed ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isGuessed && gameStatus === 'playing') {
                  e.target.style.borderColor = '#00d4ff';
                  e.target.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGuessed && gameStatus === 'playing') {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>
    );
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
            <span style={{ fontSize: '2rem' }}>🔐</span>
            CIPHER BREAKER TERMINAL
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <i className="fas fa-times"></i> EXIT
          </button>
        </div>

        {/* Status Bar */}
        <div style={styles.statusBar}>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>DIFFICULTY</span>
            <span style={{ color: '#ff4444', fontSize: '1.2rem', fontWeight: 'bold' }}>HARD</span>
          </div>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>REWARD</span>
            <span style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 'bold' }}>+{KP_REWARD} KP</span>
          </div>
          <div style={styles.statusItem}>
            <span style={{ color: '#888', fontSize: '0.8rem' }}>INTEGRITY</span>
            <span style={{ 
              color: remainingAttempts > 2 ? '#00ff88' : '#ff4444', 
              fontSize: '1.2rem', 
              fontWeight: 'bold' 
            }}>
              {remainingAttempts}/{MAX_ATTEMPTS}
            </span>
          </div>
        </div>

        {/* Main Game Area */}
        <div style={styles.gameArea}>
          {/* Integrity Blocks */}
          <div style={styles.integrityContainer}>
            <div style={styles.sectionLabel}>SYSTEM INTEGRITY</div>
            <div style={styles.blocksRow}>
              {renderIntegrityBlocks()}
            </div>
          </div>

          {/* Encrypted Word Display */}
          <div style={styles.wordContainer}>
            <div style={styles.sectionLabel}>ENCRYPTED PASSWORD</div>
            <div style={styles.wordDisplay}>
              {targetWord && renderWord()}
            </div>
            <div style={{ 
              textAlign: 'center', 
              color: '#00d4ff', 
              fontSize: '0.9rem', 
              marginTop: '1rem',
              letterSpacing: '2px'
            }}>
              {targetWord.length} CHARACTERS
            </div>
          </div>

          {/* Virtual Keyboard */}
          <div style={styles.keyboardContainer}>
            <div style={styles.sectionLabel}>DECRYPTION INTERFACE</div>
            {renderKeyboard()}
          </div>

          {/* Game Over Overlay */}
          {gameStatus !== 'playing' && (
            <div style={styles.gameOverOverlay}>
              <div style={styles.gameOverContent}>
                {gameStatus === 'won' ? (
                  <>
                    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✓</div>
                    <div style={styles.gameOverTitle}>ACCESS GRANTED</div>
                    <div style={styles.gameOverMessage}>Password successfully decrypted</div>
                    <div style={styles.kpReward}>+{KP_REWARD} KP</div>
                    <div style={{ 
                      marginTop: '1rem', 
                      fontSize: '1.2rem', 
                      color: '#00ff88',
                      letterSpacing: '3px'
                    }}>
                      {targetWord}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✕</div>
                    <div style={{...styles.gameOverTitle, color: '#ff4444'}}>SYSTEM LOCKDOWN</div>
                    <div style={styles.gameOverMessage}>Decryption failed - Integrity compromised</div>
                    <div style={{ 
                      marginTop: '1rem', 
                      fontSize: '1.2rem', 
                      color: '#00ff88',
                      letterSpacing: '3px'
                    }}>
                      ANSWER: {targetWord}
                    </div>
                  </>
                )}
                <button 
                  onClick={onClose}
                  style={styles.exitButton}
                >
                  RETURN TO PLATFORM
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={styles.instructions}>
          <div style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '0.5rem' }}>PROTOCOL:</div>
          <div>→ Decrypt the password by guessing letters</div>
          <div>→ Each wrong guess reduces system integrity</div>
          <div>→ Decrypt the full password before integrity reaches zero</div>
        </div>
      </div>

      {/* Inject Animations */}
      <style>{`
        .revealed {
          animation: letterReveal 0.4s ease-out;
          color: #00ff88 !important;
          text-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
        }

        .broken {
          animation: blockBreak 0.5s ease-out;
        }

        @keyframes letterReveal {
          0% {
            transform: scale(0) rotateY(180deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) rotateY(0deg);
          }
          100% {
            transform: scale(1) rotateY(0deg);
            opacity: 1;
          }
        }

        @keyframes blockBreak {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
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
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(20, 20, 40, 0.95))',
    border: '2px solid rgba(0, 212, 255, 0.3)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)',
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
    color: '#00d4ff',
    textShadow: '0 0 20px rgba(0, 212, 255, 0.6)',
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
  },
  integrityContainer: {
    marginBottom: '2rem',
  },
  sectionLabel: {
    color: '#888',
    fontSize: '0.75rem',
    letterSpacing: '2px',
    marginBottom: '1rem',
    textTransform: 'uppercase',
  },
  blocksRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  integrityBlock: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    border: '2px solid rgba(255, 255, 255, 0.2)',
  },
  wordContainer: {
    marginBottom: '2rem',
  },
  wordDisplay: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    padding: '2rem',
    background: 'rgba(0, 212, 255, 0.05)',
    borderRadius: '12px',
    border: '2px dashed rgba(0, 212, 255, 0.3)',
  },
  letterBox: {
    width: '50px',
    height: '60px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '2px solid rgba(0, 212, 255, 0.4)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#00d4ff',
    transition: 'all 0.3s ease',
  },
  keyboardContainer: {
    marginBottom: '2rem',
  },
  keyboard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(13, 1fr)',
    gap: '0.5rem',
  },
  keyButton: {
    aspectRatio: '1',
    border: '2px solid',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#fff',
    fontFamily: "'Courier New', monospace",
    transition: 'all 0.2s ease',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    animation: 'fadeIn 0.5s ease-out',
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
    marginBottom: '1rem',
  },
  exitButton: {
    marginTop: '2rem',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #00d4ff, #0088cc)',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.3s ease',
  },
  instructions: {
    background: 'rgba(0, 212, 255, 0.05)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '0.9rem',
    color: '#aaa',
    lineHeight: '1.8',
  },
};

export default CipherBreakerGame;
