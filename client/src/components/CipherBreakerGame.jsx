import React, { useState, useEffect } from 'react';
import useUiSound from '../hooks/useUiSound';
import ToastNotification from './ToastNotification';

/**
 * CipherBreakerGame - Cyberpunk Terminal Decryption Interface
 * 
 * Premium Features:
 * - CLI-style bracket slots with blinking cursor
 * - Hex-block letter bank with glitch effects
 * - Typewriter animation on letter placement
 * - System notification hints
 * - Matrix-style access granted animation
 * 
 * Difficulty: HARD | Reward: +75 KP | Lives: 6 Integrity Blocks
 */

const WORD_BANK = [
  'ENCRYPTION',
  'FIREWALL',
  'EXPLOIT',
  'HANDSHAKE',
  'PROTOCOL',
  'BACKDOOR',
  'ROOTKIT',
  'MALWARE'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_ATTEMPTS = 6;
const KP_REWARD = 75;
const KP_PENALTY = -40;

const CipherBreakerGame = ({ onClose, onWin, onComplete }) => {
  const { playClick, playWin, playPowerUp, stopCountdown } = useUiSound();

  const [targetWord, setTargetWord] = useState('');
  const [userInput, setUserInput] = useState([]);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [remainingAttempts, setRemainingAttempts] = useState(MAX_ATTEMPTS);
  const [gameStatus, setGameStatus] = useState('playing');
  const [toasts, setToasts] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    return () => {
      stopCountdown();
    };
  }, [stopCountdown]);

  useEffect(() => {
    const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    setTargetWord(randomWord);
  }, []);

  useEffect(() => {
    if (targetWord) {
      const letters = targetWord.split('');
      const scrambled = [...letters].sort(() => Math.random() - 0.5);
      setAvailableLetters(scrambled);
      setUserInput(new Array(targetWord.length).fill(''));
      setCursorPosition(0);
    }
  }, [targetWord]);

  useEffect(() => {
    if (!targetWord || gameStatus !== 'playing') return;

    const answer = userInput.join('');
    if (answer === targetWord && answer.length === targetWord.length) {
      handleWin();
    }
  }, [userInput]);

  const handleWin = async () => {
    setGameStatus('won');
    playWin();

    try {
      // 🔧 FIX: Call onComplete instead of onWin to trigger DungeonPlatform's handleGameComplete
      if (onComplete) {
        await onComplete(KP_REWARD);
      } else if (onWin) {
        // Fallback for backward compatibility
        await onWin(KP_REWARD);
      }
      addToast('success', 'ACCESS GRANTED!', 'Password decrypted successfully', KP_REWARD);
    } catch (error) {
      console.error('Failed to award KP:', error);
      addToast('error', 'SYNC ERROR', 'Failed to update KP');
    }
  };

  const handleLoss = async () => {
    setGameStatus('lost');
    
    try {
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

  const handleLetterClick = (letter, index) => {
    if (gameStatus !== 'playing') return;

    playClick();

    const emptySlotIndex = userInput.findIndex(slot => slot === '');
    if (emptySlotIndex === -1) return;

    const newInput = [...userInput];
    newInput[emptySlotIndex] = letter;
    setUserInput(newInput);
    setCursorPosition(emptySlotIndex + 1);

    const newAvailable = [...availableLetters];
    newAvailable.splice(index, 1);
    setAvailableLetters(newAvailable);

    if (emptySlotIndex === userInput.length - 1) {
      const fullAnswer = newInput.join('');
      if (fullAnswer !== targetWord) {
        setTimeout(() => {
          handleWrongAttempt();
        }, 500);
      }
    }
  };

  const handleClearBuffer = () => {
    if (gameStatus !== 'playing') return;
    playClick();
    
    const usedLetters = userInput.filter(l => l !== '');
    setAvailableLetters([...availableLetters, ...usedLetters].sort(() => Math.random() - 0.5));
    setUserInput(new Array(targetWord.length).fill(''));
    setCursorPosition(0);
  };

  const handleBackspace = () => {
    if (gameStatus !== 'playing') return;
    playClick();

    const lastFilledIndex = userInput.map((letter, i) => letter !== '' ? i : -1)
                                     .filter(i => i !== -1)
                                     .pop();
    
    if (lastFilledIndex === undefined) return;

    const removedLetter = userInput[lastFilledIndex];
    setAvailableLetters([...availableLetters, removedLetter].sort(() => Math.random() - 0.5));

    const newInput = [...userInput];
    newInput[lastFilledIndex] = '';
    setUserInput(newInput);
    setCursorPosition(lastFilledIndex);
  };

  const handleWrongAttempt = () => {
    setRemainingAttempts(prev => {
      const newAttempts = prev - 1;
      if (newAttempts === 0) {
        handleLoss();
      }
      return newAttempts;
    });
    playPowerUp();
    
    addToast('error', 'INCORRECT', 'Access denied - Try again');
    setTimeout(() => {
      handleClearBuffer();
    }, 800);
  };

  const addToast = (type, title, message, kpAmount = null) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message, kpAmount }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const renderAnswerSlots = () => {
    return (
      <div style={styles.answerSlots}>
        {userInput.map((letter, index) => (
          <div key={index} style={styles.bracketSlot}>
            <span style={styles.bracket}>{'['}</span>
            <span style={{
              ...styles.slotLetter,
              color: letter ? '#00ff88' : '#444',
              animation: letter ? 'letterTypeIn 0.3s ease-out' : 'none'
            }}>
              {letter || (index === cursorPosition && gameStatus === 'playing' ? '█' : '_')}
            </span>
            <span style={styles.bracket}>{']'}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderHexBlocks = () => {
    return (
      <div style={styles.hexGrid}>
        {availableLetters.map((letter, index) => (
          <div
            key={`${letter}-${index}`}
            onClick={() => handleLetterClick(letter, index)}
            style={styles.hexBlock}
            onMouseEnter={(e) => {
              e.currentTarget.style.animation = 'glitchHover 0.3s ease';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.animation = 'none';
            }}
          >
            <div style={styles.hexCode}>0x{letter.charCodeAt(0).toString(16).toUpperCase()}</div>
            <div style={styles.hexLetter}>{letter}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderHint = () => {
    const hints = {
      'ENCRYPTION': 'Network Security Barrier',
      'MAINFRAME': 'Central Computing System',
      'FIREWALL': 'Network Protection Protocol',
      'EXPLOIT': 'Security Vulnerability',
      'HANDSHAKE': 'Connection Authentication',
      'PROTOCOL': 'Communication Standard',
      'BACKDOOR': 'Unauthorized Access Point',
      'ROOTKIT': 'System-Level Malware',
      'PAYLOAD': 'Malicious Code Package',
      'MALWARE': 'Malicious Software'
    };

    return showHint ? (
      <div style={styles.systemHint}>
        <span style={styles.hintPrompt}>&gt; SYSTEM_HINT:</span>
        <span style={styles.hintText}>[ "{hints[targetWord] || 'Unknown Term'}" ]</span>
      </div>
    ) : null;
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
        <div style={styles.header}>
          <div style={styles.title}>
            <span style={{ fontSize: '2rem' }}>🔐</span>
            CIPHER BREAKER TERMINAL
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <i className="fas fa-times"></i> EXIT
          </button>
        </div>

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

        <div style={styles.terminalArea}>
          <div style={styles.integrityContainer}>
            <div style={styles.terminalLabel}>
              <span style={styles.labelPrompt}>&gt;&gt;</span> SYSTEM INTEGRITY
            </div>
            <div style={styles.blocksRow}>
              {renderIntegrityBlocks()}
            </div>
          </div>

          <div style={styles.inputContainer}>
            <div style={styles.terminalLabel}>
              <span style={styles.labelPrompt}>&gt;&gt;</span> DECRYPTION_BUFFER
            </div>
            {renderAnswerSlots()}
            <div style={styles.inputMeta}>
              <span>LENGTH: {targetWord.length} CHARS</span>
              <span>|</span>
              <span>FILLED: {userInput.filter(l => l !== '').length}/{targetWord.length}</span>
            </div>
          </div>

          <div style={styles.controlPanel}>
            <button onClick={handleClearBuffer} style={styles.controlBtn} disabled={gameStatus !== 'playing'}>
              <i className="fas fa-redo"></i> CLEAR BUFFER
            </button>
            <button onClick={handleBackspace} style={styles.controlBtn} disabled={gameStatus !== 'playing'}>
              <i className="fas fa-backspace"></i> BACKSPACE
            </button>
            <button 
              onClick={() => setShowHint(!showHint)} 
              style={{...styles.controlBtn, background: 'rgba(255, 215, 0, 0.2)', borderColor: '#ffd700'}}
              disabled={gameStatus !== 'playing'}
            >
              <i className="fas fa-lightbulb"></i> {showHint ? 'HIDE' : 'SHOW'} HINT
            </button>
          </div>

          {renderHint()}

          <div style={styles.dataContainer}>
            <div style={styles.terminalLabel}>
              <span style={styles.labelPrompt}>&gt;&gt;</span> AVAILABLE_DATA_BLOCKS
            </div>
            {renderHexBlocks()}
          </div>

          {gameStatus === 'won' && (
            <div style={styles.terminalOverlay}>
              <div style={styles.terminalOverlayContent}>
                <div style={styles.accessGranted}>
                  <div style={styles.matrixEffect}>█ █ █ █ █</div>
                  <div style={styles.accessText}>ACCESS GRANTED</div>
                  <div style={styles.matrixEffect}>█ █ █ █ █</div>
                </div>
                <div style={styles.decryptedWord}>
                  <span style={styles.labelPrompt}>&gt;</span> {targetWord}
                </div>
                <div style={styles.kpRewardTerminal}>+{KP_REWARD} KNOWLEDGE_POINTS</div>
                <button onClick={onClose} style={styles.exitButtonTerminal}>
                  [ RETURN_TO_PLATFORM ]
                </button>
              </div>
            </div>
          )}

          {gameStatus === 'lost' && (
            <div style={styles.terminalOverlay}>
              <div style={styles.terminalOverlayContent}>
                <div style={{...styles.accessGranted, color: '#ff4444'}}>
                  <div style={styles.matrixEffect}>✕ ✕ ✕ ✕ ✕</div>
                  <div style={styles.accessText}>SYSTEM LOCKDOWN</div>
                  <div style={styles.matrixEffect}>✕ ✕ ✕ ✕ ✕</div>
                </div>
                <div style={styles.decryptedWord}>
                  <span style={styles.labelPrompt}>&gt;</span> ANSWER: {targetWord}
                </div>
                <div style={{...styles.kpRewardTerminal, color: '#ff4444'}}>INTEGRITY_COMPROMISED</div>
                <button onClick={onClose} style={styles.exitButtonTerminal}>
                  [ RETURN_TO_PLATFORM ]
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.terminalInstructions}>
          <div style={styles.instructionLine}>
            <span style={styles.labelPrompt}>&gt;</span> PROTOCOL: Click hex blocks to fill decryption buffer
          </div>
          <div style={styles.instructionLine}>
            <span style={styles.labelPrompt}>&gt;</span> WARNING: Wrong answers reduce system integrity
          </div>
          <div style={styles.instructionLine}>
            <span style={styles.labelPrompt}>&gt;</span> OBJECTIVE: Decrypt full password before lockdown
          </div>
        </div>
      </div>

      <style>{`
        @keyframes letterTypeIn {
          0% {
            transform: scale(0) translateY(-20px);
            opacity: 0;
          }
          60% {
            transform: scale(1.3) translateY(0);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes glitchHover {
          0%, 100% { transform: translate(0); }
          25% { transform: translate(-2px, 2px); opacity: 0.8; }
          50% { transform: translate(2px, -2px); opacity: 0.6; }
          75% { transform: translate(-2px, -2px); opacity: 0.9; }
        }

        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes matrixRain {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        .broken {
          animation: blockBreak 0.5s ease-out;
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
    background: 'rgba(0, 0, 0, 0.98)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '2rem',
    fontFamily: "'Courier New', monospace",
  },
  container: {
    maxWidth: '1100px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'linear-gradient(135deg, rgba(5, 5, 15, 0.98), rgba(10, 10, 20, 0.98))',
    border: '2px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 0 40px rgba(0, 255, 65, 0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(0, 255, 65, 0.2)',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#00ff41',
    textShadow: '0 0 20px rgba(0, 255, 65, 0.6)',
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
    borderRadius: '4px',
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
    borderRadius: '4px',
    border: '1px solid rgba(0, 255, 65, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  terminalArea: {
    position: 'relative',
    minHeight: '400px',
  },
  terminalLabel: {
    color: '#00ff41',
    fontSize: '0.75rem',
    letterSpacing: '1px',
    marginBottom: '1rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  labelPrompt: {
    color: '#00ff41',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  inputContainer: {
    marginBottom: '2rem',
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid rgba(0, 255, 65, 0.2)',
  },
  answerSlots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  bracketSlot: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
  },
  bracket: {
    color: '#00ff41',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  slotLetter: {
    width: '2rem',
    textAlign: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    fontFamily: "'Courier New', monospace",
    textShadow: '0 0 10px currentColor',
  },
  inputMeta: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    color: '#666',
    fontSize: '0.8rem',
    letterSpacing: '1px',
  },
  controlPanel: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  controlBtn: {
    background: 'rgba(0, 255, 65, 0.1)',
    border: '2px solid rgba(0, 255, 65, 0.4)',
    color: '#00ff41',
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: "'Courier New', monospace",
    fontSize: '0.85rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },
  systemHint: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.4)',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    animation: 'fadeIn 0.3s ease',
  },
  hintPrompt: {
    color: '#ffd700',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  hintText: {
    color: '#ffed4e',
    fontSize: '1rem',
    letterSpacing: '1px',
  },
  dataContainer: {
    marginBottom: '2rem',
  },
  hexGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    border: '1px dashed rgba(0, 255, 65, 0.2)',
  },
  hexBlock: {
    background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.15), rgba(0, 200, 50, 0.1))',
    border: '2px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '6px',
    padding: '1rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },
  hexCode: {
    color: '#666',
    fontSize: '0.7rem',
    letterSpacing: '1px',
  },
  hexLetter: {
    color: '#00ff41',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(0, 255, 65, 0.6)',
  },
  terminalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    animation: 'fadeIn 0.5s ease',
  },
  terminalOverlayContent: {
    textAlign: 'center',
  },
  accessGranted: {
    color: '#00ff41',
    marginBottom: '2rem',
  },
  matrixEffect: {
    fontSize: '2rem',
    letterSpacing: '1rem',
    opacity: 0.6,
    animation: 'matrixRain 2s ease-in-out infinite',
  },
  accessText: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    textShadow: '0 0 30px currentColor',
    letterSpacing: '0.5rem',
    margin: '1rem 0',
  },
  decryptedWord: {
    fontSize: '2rem',
    color: '#00ff41',
    marginBottom: '2rem',
    letterSpacing: '0.5rem',
  },
  kpRewardTerminal: {
    fontSize: '1.5rem',
    color: '#ffd700',
    marginBottom: '2rem',
    letterSpacing: '0.2rem',
  },
  exitButtonTerminal: {
    marginTop: '2rem',
    padding: '1rem 2rem',
    background: 'rgba(0, 255, 65, 0.2)',
    border: '2px solid #00ff41',
    borderRadius: '4px',
    color: '#00ff41',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    letterSpacing: '0.2rem',
    fontFamily: "'Courier New', monospace",
    transition: 'all 0.3s ease',
  },
  terminalInstructions: {
    background: 'rgba(0, 255, 65, 0.05)',
    border: '1px solid rgba(0, 255, 65, 0.2)',
    borderRadius: '4px',
    padding: '1rem',
  },
  instructionLine: {
    color: '#00aa41',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  integrityContainer: {
    marginBottom: '2rem',
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
};

export default CipherBreakerGame;
