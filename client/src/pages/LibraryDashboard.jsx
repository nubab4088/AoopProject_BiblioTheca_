import React, { useState, useEffect, useRef } from 'react';
import BookGrid from '../components/BookGrid';
import CipherGameModal from '../components/CipherGameModal';
import DataBrokerWidget from '../components/DataBrokerWidget';
import { useGameEconomyContext } from '../context/GameEconomyContext';
import SystemTerminal from '../components/SystemTerminal';
import activityService from '../services/ActivityService';

const LibraryDashboard = ({ books, handleBookClick, user }) => {
  const { updateKP } = useGameEconomyContext();
  const [showCipherGame, setShowCipherGame] = useState(false);
  const [kpAnimated, setKpAnimated] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const prevKpRef = useRef(user?.kp || 0);

  // Calculate clearance level from KP
  const clearanceLevel = Math.floor((user?.kp || 0) / 100) + 1;

  // Animate KP counter when it changes
  useEffect(() => {
    if (user?.kp !== prevKpRef.current) {
      setKpAnimated(true);
      const timer = setTimeout(() => setKpAnimated(false), 800);
      prevKpRef.current = user?.kp || 0;
      return () => clearTimeout(timer);
    }
  }, [user?.kp]);

  // Start Activity Service on mount
  useEffect(() => {
    activityService.start(8000); // Generate new log every 8 seconds
    
    // Update logs every second for smooth cycling
    const logUpdateInterval = setInterval(() => {
      setActivityLogs(activityService.getLogs());
    }, 1000);

    return () => {
      activityService.stop();
      clearInterval(logUpdateInterval);
    };
  }, []);

  // Handle cipher game win - award KP
  const handleCipherWin = async (kpAmount) => {
    await updateKP(kpAmount);
    console.log(`✅ Data mined! Awarded ${kpAmount} KP`);
  };

  // Handle data broker win - award KP
  const handleDataBrokerWin = async (kpAmount) => {
    await updateKP(kpAmount);
    console.log(`✅ Signal locked! Awarded ${kpAmount} KP`);
  };

  return (
    <>
      {/* Cipher Game Modal */}
      {showCipherGame && (
        <CipherGameModal 
          onWin={handleCipherWin}
          onClose={() => setShowCipherGame(false)}
        />
      )}

      {/* SYSTEM STATUS BAR - HUD Interface */}
      <section className="system-status-bar" style={{
        background: 'linear-gradient(135deg, rgba(26, 11, 46, 0.95), rgba(45, 27, 105, 0.95))',
        backdropFilter: 'blur(20px)',
        borderBottom: '2px solid rgba(255, 68, 68, 0.5)',
        padding: '1.5rem 0',
        marginTop: '80px',
        boxShadow: '0 4px 30px rgba(255, 68, 68, 0.2)',
        fontFamily: "'Courier New', monospace"
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            
            {/* Agent Identification Panel */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(0, 255, 136, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 255, 136, 0.3)'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Agent'})`,
                backgroundSize: 'cover',
                border: '3px solid #00ff88',
                boxShadow: '0 0 15px rgba(0, 255, 136, 0.6)'
              }}></div>
              <div>
                <div style={{
                  color: '#666',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  marginBottom: '0.3rem'
                }}>
                  AGENT_NAME
                </div>
                <div style={{
                  color: '#00ff88',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
                }}>
                  {user?.name || 'UNKNOWN'}
                </div>
              </div>
            </div>

            {/* Clearance Level Panel */}
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              background: 'rgba(0, 150, 255, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 150, 255, 0.4)'
            }}>
              <div style={{
                color: '#666',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '0.3rem'
              }}>
                CLEARANCE_LEVEL
              </div>
              <div style={{
                color: '#0096ff',
                fontSize: '1.6rem',
                fontWeight: 'bold',
                textShadow: '0 0 15px rgba(0, 150, 255, 0.6)'
              }}>
                LEVEL-{clearanceLevel}
              </div>
            </div>

            {/* System Status Panel */}
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              background: 'rgba(255, 68, 68, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 68, 68, 0.5)',
              animation: 'pulse-warning 2s ease-in-out infinite'
            }}>
              <div style={{
                color: '#666',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '0.3rem'
              }}>
                SYSTEM_STATUS
              </div>
              <div style={{
                color: '#ff4444',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  background: '#ff4444',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #ff4444',
                  animation: 'pulse 1s infinite'
                }}></span>
                UNSTABLE
              </div>
            </div>

            {/* Knowledge Points Panel */}
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              background: 'rgba(255, 215, 0, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 215, 0, 0.4)',
              transition: 'transform 0.3s ease',
              transform: kpAnimated ? 'scale(1.1)' : 'scale(1)'
            }}>
              <div style={{
                color: '#666',
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '0.3rem'
              }}>
                KNOWLEDGE_POINTS
              </div>
              <div style={{
                color: '#ffd700',
                fontSize: '1.6rem',
                fontWeight: 'bold',
                textShadow: '0 0 15px rgba(255, 215, 0, 0.6)'
              }}>
                {user?.kp || 0} KP
              </div>
            </div>
          </div>

          {/* DASHBOARD WIDGETS SECTION */}
          <div style={{
            marginTop: '1.5rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            alignItems: 'stretch',
            position: 'relative'
          }}>
            
            {/* System Terminal Message */}
            <SystemTerminal logs={activityLogs} />

            {/* DATA BROKER WIDGET - Word Typing Game */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 200, 100, 0.05))',
              border: '2px solid rgba(0, 255, 136, 0.3)',
              borderRadius: '16px',
              padding: '1.2rem 1.5rem',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onClick={() => setShowCipherGame(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.2)';
            }}
            className="data-broker-card"
            >
              {/* Scanline Effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
                animation: 'scanline 3s linear infinite'
              }}></div>

              {/* Header: Avatar + Info + Online Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                {/* Left: Avatar + Text */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  {/* Robot Avatar with Status Indicator */}
                  <div style={{
                    position: 'relative',
                    width: '70px',
                    height: '70px'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00ff88, #00aa66)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      animation: 'pulse 2s ease-in-out infinite',
                      boxShadow: '0 0 30px rgba(0, 255, 136, 0.6)',
                      border: '3px solid rgba(0, 255, 136, 0.4)'
                    }}>
                      🤖
                    </div>
                    {/* Green Status Dot */}
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      width: '16px',
                      height: '16px',
                      background: '#00ff88',
                      borderRadius: '50%',
                      border: '3px solid rgba(0, 0, 0, 0.8)',
                      boxShadow: '0 0 15px rgba(0, 255, 136, 0.8)',
                      animation: 'statusBlink 2s ease-in-out infinite'
                    }}></div>
                  </div>

                  {/* Text Info */}
                  <div>
                    <div style={{
                      color: '#00ff88',
                      fontSize: '0.75rem',
                      letterSpacing: '2px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      marginBottom: '0.3rem'
                    }}>
                      DATA BROKER
                    </div>
                    <div style={{
                      color: '#fff',
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}>
                      Anonymous Agent
                    </div>
                  </div>
                </div>

                {/* Right: Online Badge */}
                <div style={{
                  background: 'rgba(0, 255, 136, 0.2)',
                  border: '1px solid #00ff88',
                  borderRadius: '20px',
                  padding: '0.3rem 0.8rem',
                  fontSize: '0.7rem',
                  color: '#00ff88',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    background: '#00ff88',
                    borderRadius: '50%',
                    boxShadow: '0 0 8px #00ff88',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}></span>
                  ONLINE
                </div>
              </div>

              {/* Dialog Box */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '8px',
                padding: '0.8rem 1rem',
                marginBottom: '1rem',
                position: 'relative'
              }}>
                <p style={{
                  color: '#00ff88',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  margin: 0,
                  fontStyle: 'italic'
                }}>
                  "Greetings, Agent. I've got encrypted data for you. Decrypt it, keep the rewards. Deal?"
                </p>
              </div>

              {/* Action Badge + Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '1rem',
                alignItems: 'center'
              }}>
                {/* Action Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.8rem 1rem',
                  background: 'linear-gradient(135deg, #00ff88, #00aa66)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCipherGame(true);
                }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#000',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>⚡</span>
                    DATA MINING OPERATION
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '8px',
                  padding: '0.6rem',
                  border: '1px solid rgba(0, 255, 136, 0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>REWARD</span>
                    <span style={{ fontSize: '0.85rem', color: '#ffd700', fontWeight: 'bold' }}>+15 KP</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>TYPE</span>
                    <span style={{ fontSize: '0.85rem', color: '#00ff88', fontWeight: 'bold' }}>TYPING</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase' }}>TIME</span>
                    <span style={{ fontSize: '0.85rem', color: '#ff8844', fontWeight: 'bold' }}>10s</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE OPERATOR INTERFACE - BOOKS ONLY */}
      <BookGrid 
        books={books}
        handleBookClick={handleBookClick}
        showSearch={true}
        user={user}
      />

      {/* Inject CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes scanline {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes statusBlink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
};

export default LibraryDashboard;