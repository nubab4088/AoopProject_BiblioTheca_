import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useGameEconomyContext } from '../context/GameEconomyContext';
import useUiSound from '../hooks/useUiSound';

/**
 * RechargeOverlay - High-priority fullscreen overlay for system lockout
 * 
 * Features:
 * - Full-screen dark overlay (z-index: 3000)
 * - Animated progress bar (10-second fill)
 * - Cyberpunk/Neural theme styling
 * - Non-dismissible during recharge
 * - Smooth animations and glowing effects
 * - NOW PLAYS COUNTDOWN_2 SOUND DURING RESTORE
 * - Professional "System Restored" popup after completion
 * 
 * @param {boolean} isVisible - Whether overlay is shown
 * @param {number} timer - Remaining seconds
 * @param {number} progress - Progress percentage (0-100)
 */
const RechargeOverlay = ({ isVisible, timer, progress }) => {
  // 🎮 GET REAL KP VALUE FROM CONTEXT
  const { kp } = useGameEconomyContext();
  
  // 🎵 GET COUNTDOWN2 SOUND
  const { playCountdown2, stopCountdown2, playPowerUp } = useUiSound();
  
  // Track if sound has been played
  const soundPlayed = useRef(false);
  const wasVisible = useRef(false);
  
  // 🎉 SUCCESS POPUP STATE
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // ⏱️ Play countdown_2 sound when timer reaches 5 seconds
  useEffect(() => {
    if (isVisible && timer === 5 && !soundPlayed.current) {
      console.log('⏰ 5 seconds remaining - playing countdown_2 sound');
      playCountdown2();
      soundPlayed.current = true;
    }
    
    // Reset and stop sound when overlay closes
    if (!isVisible) {
      soundPlayed.current = false;
      stopCountdown2(); // Stop the sound when overlay disappears
    }
  }, [isVisible, timer, playCountdown2, stopCountdown2]);

  // 🎉 SHOW SUCCESS POPUP WHEN RESTORATION COMPLETES
  useEffect(() => {
    // Detect when overlay transitions from visible to invisible (restoration complete)
    if (wasVisible.current && !isVisible) {
      console.log('✅ System restored - showing success popup');
      stopCountdown2(); // Ensure countdown sound is stopped
      playPowerUp();
      setShowSuccessPopup(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    }
    
    wasVisible.current = isVisible;
  }, [isVisible, playPowerUp, stopCountdown2]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCountdown2(); // Stop countdown sound when component unmounts
    };
  }, [stopCountdown2]);

  // Don't render if not visible and no success popup
  if (!isVisible && !showSuccessPopup) return null;

  return (
    <>
      {/* 🔋 RECHARGE OVERLAY */}
      {isVisible && (
        <div style={styles.overlay}>
          <div style={styles.container}>
            
            {/* Warning Icon */}
            <div style={styles.iconContainer}>
              <div style={styles.icon}>⚠️</div>
              <div style={styles.pulseRing}></div>
            </div>

            {/* Main Title */}
            <div style={styles.title}>
              SYSTEM DEPLETED
            </div>

            {/* Subtitle */}
            <div style={styles.subtitle}>
              RECHARGING NEURAL LINK...
            </div>

            {/* Progress Bar Container */}
            <div style={styles.progressContainer}>
              <div style={styles.progressLabel}>
                <span>ENERGY RESTORATION</span>
                <span>{Math.round(progress)}%</span>
              </div>
              
              <div style={styles.progressBarOuter}>
                <div 
                  style={{
                    ...styles.progressBarInner,
                    width: `${progress}%`
                  }}
                >
                  <div style={styles.progressGlow}></div>
                </div>
                
                {/* Segments overlay */}
                <div style={styles.segments}>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} style={styles.segment}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timer Display */}
            <div style={styles.timerContainer}>
              <div style={styles.timerLabel}>TIME REMAINING</div>
              <div style={styles.timer}>
                {timer}<span style={styles.timerUnit}>s</span>
              </div>
            </div>

            {/* Status Messages - NOW SHOWS REAL KP */}
            <div style={styles.statusBox}>
              <div style={styles.statusLine}>
                &gt; KNOWLEDGE POINTS: <span style={styles.statusValue}>{kp} KP</span>
              </div>
              <div style={styles.statusLine}>
                &gt; SYSTEM STATUS: <span style={styles.statusWarning}>LOCKED</span>
              </div>
              <div style={styles.statusLine}>
                &gt; RESTORATION TARGET: <span style={styles.statusValue}>50 KP</span>
              </div>
            </div>

            {/* Footer Message */}
            <div style={styles.footer}>
              Please wait while your neural connection stabilizes...
            </div>

          </div>
        </div>
      )}

      {/* 🎉 SUCCESS POPUP - Modern Game Style */}
      {showSuccessPopup && (
        <div style={styles.successOverlay}>
          <div style={styles.successContainer}>
            
            {/* Success Icon with Glow */}
            <div style={styles.successIconContainer}>
              <div style={styles.successIcon}>✓</div>
              <div style={styles.successGlow}></div>
            </div>

            {/* Title */}
            <div style={styles.successTitle}>
              SYSTEM RESTORED
            </div>

            {/* Subtitle */}
            <div style={styles.successSubtitle}>
              Neural Connection Stabilized
            </div>

            {/* Reward Display - Modern Game Style */}
            <div style={styles.rewardCard}>
              <div style={styles.rewardHeader}>
                <span style={styles.rewardIcon}>⚡</span>
                <span style={styles.rewardLabel}>ENERGY RESTORED</span>
              </div>
              <div style={styles.rewardAmount}>
                +50 <span style={styles.rewardUnit}>KP</span>
              </div>
              <div style={styles.rewardDivider}></div>
              <div style={styles.rewardCurrent}>
                Current Balance: <span style={styles.rewardCurrentValue}>{kp} KP</span>
              </div>
            </div>

            {/* Status Messages */}
            <div style={styles.successMessage}>
              <div style={styles.successMessageLine}>✓ System integrity verified</div>
              <div style={styles.successMessageLine}>✓ Knowledge pathway active</div>
              <div style={styles.successMessageLine}>✓ Ready to continue</div>
            </div>

            {/* Progress Indicator */}
            <div style={styles.autoCloseBar}>
              <div style={styles.autoCloseProgress}></div>
            </div>

          </div>

          {/* Particle Effects */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.particle,
                left: `${50 + (Math.random() - 0.5) * 60}%`,
                top: `${50 + (Math.random() - 0.5) * 60}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};

RechargeOverlay.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  timer: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
};

// Styles
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    zIndex: 3000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Courier New", Consolas, monospace',
    color: '#00ff41',
    backdropFilter: 'blur(10px)',
    animation: 'fadeIn 0.3s ease-out',
  },
  container: {
    width: '90%',
    maxWidth: '600px',
    padding: '50px 40px',
    background: 'linear-gradient(135deg, rgba(0, 20, 0, 0.95), rgba(0, 10, 0, 0.95))',
    border: '3px solid #00ff41',
    borderRadius: '15px',
    boxShadow: '0 0 60px rgba(0, 255, 65, 0.4), inset 0 0 60px rgba(0, 255, 65, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '25px',
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: '10px',
  },
  icon: {
    fontSize: '80px',
    textShadow: '0 0 20px #ffaa00, 0 0 40px #ffaa00',
    animation: 'pulse 1.5s ease-in-out infinite',
    position: 'relative',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100px',
    height: '100px',
    border: '3px solid rgba(255, 170, 0, 0.5)',
    borderRadius: '50%',
    animation: 'pulseRing 2s ease-out infinite',
  },
  title: {
    fontSize: '42px',
    fontWeight: 'bold',
    letterSpacing: '6px',
    textShadow: '0 0 15px #ff4444, 0 0 30px #ff4444',
    color: '#ff4444',
    textAlign: 'center',
    animation: 'glitchText 0.8s infinite',
  },
  subtitle: {
    fontSize: '16px',
    letterSpacing: '3px',
    opacity: 0.9,
    textAlign: 'center',
    color: '#00ff41',
  },
  progressContainer: {
    width: '100%',
    marginTop: '10px',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginBottom: '10px',
    letterSpacing: '2px',
    opacity: 0.8,
  },
  progressBarOuter: {
    width: '100%',
    height: '30px',
    background: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid #00ff41',
    borderRadius: '15px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.8)',
  },
  progressBarInner: {
    height: '100%',
    background: 'linear-gradient(90deg, #00ff41 0%, #00cc33 50%, #00ff41 100%)',
    transition: 'width 0.3s ease-out',
    position: 'relative',
    boxShadow: '0 0 20px rgba(0, 255, 65, 0.8)',
    animation: 'shimmer 2s linear infinite',
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    animation: 'slide 1.5s linear infinite',
  },
  segments: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'space-around',
    pointerEvents: 'none',
  },
  segment: {
    width: '2px',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  timerContainer: {
    marginTop: '15px',
    textAlign: 'center',
  },
  timerLabel: {
    fontSize: '11px',
    letterSpacing: '2px',
    opacity: 0.6,
    marginBottom: '8px',
  },
  timer: {
    fontSize: '64px',
    fontWeight: 'bold',
    textShadow: '0 0 20px #00ff41, 0 0 40px #00ff41',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  timerUnit: {
    fontSize: '32px',
    marginLeft: '5px',
    opacity: 0.7,
  },
  statusBox: {
    width: '100%',
    padding: '20px',
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '8px',
    marginTop: '10px',
  },
  statusLine: {
    fontSize: '13px',
    marginBottom: '8px',
    letterSpacing: '1px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  statusValue: {
    color: '#00ff41',
    fontWeight: 'bold',
  },
  statusWarning: {
    color: '#ff4444',
    fontWeight: 'bold',
    animation: 'blink 1s infinite',
  },
  footer: {
    fontSize: '12px',
    opacity: 0.5,
    textAlign: 'center',
    marginTop: '10px',
    fontStyle: 'italic',
  },

  // 🎉 SUCCESS POPUP STYLES - PROFESSIONAL & MODERN
  successOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 3500,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Courier New", Consolas, monospace',
    backdropFilter: 'blur(8px)',
    animation: 'fadeIn 0.4s ease-out',
  },
  successContainer: {
    width: '90%',
    maxWidth: '500px',
    padding: '40px',
    background: 'linear-gradient(135deg, rgba(0, 30, 0, 0.98), rgba(0, 50, 20, 0.98))',
    border: '3px solid #00ff41',
    borderRadius: '20px',
    boxShadow: '0 0 80px rgba(0, 255, 65, 0.6), inset 0 0 60px rgba(0, 255, 65, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '25px',
    position: 'relative',
    overflow: 'hidden',
    animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  successIconContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: '80px',
    fontWeight: 'bold',
    color: '#00ff41',
    textShadow: '0 0 30px #00ff41, 0 0 60px #00ff41',
    animation: 'successPulse 1s ease-in-out infinite',
    zIndex: 2,
  },
  successGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 255, 65, 0.4), transparent)',
    animation: 'successGlow 2s ease-in-out infinite',
  },
  successTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    letterSpacing: '5px',
    color: '#00ff41',
    textShadow: '0 0 20px #00ff41, 0 0 40px #00ff41',
    textAlign: 'center',
    animation: 'successGlowText 2s ease-in-out infinite',
  },
  successSubtitle: {
    fontSize: '14px',
    letterSpacing: '2px',
    color: 'rgba(0, 255, 65, 0.8)',
    textAlign: 'center',
  },
  rewardCard: {
    width: '100%',
    padding: '25px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '2px solid rgba(0, 255, 65, 0.5)',
    borderRadius: '12px',
    boxShadow: 'inset 0 0 30px rgba(0, 255, 65, 0.1)',
    marginTop: '5px',
  },
  rewardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  rewardIcon: {
    fontSize: '24px',
    animation: 'bounce 1s ease-in-out infinite',
  },
  rewardLabel: {
    fontSize: '12px',
    letterSpacing: '2px',
    opacity: 0.8,
  },
  rewardAmount: {
    fontSize: '56px',
    fontWeight: 'bold',
    color: '#00ff41',
    textAlign: 'center',
    textShadow: '0 0 25px #00ff41',
    lineHeight: 1,
    animation: 'rewardPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  rewardUnit: {
    fontSize: '28px',
    marginLeft: '8px',
    opacity: 0.9,
  },
  rewardDivider: {
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #00ff41, transparent)',
    margin: '15px 0',
    opacity: 0.5,
  },
  rewardCurrent: {
    fontSize: '13px',
    textAlign: 'center',
    color: 'rgba(0, 255, 65, 0.7)',
    letterSpacing: '1px',
  },
  rewardCurrentValue: {
    fontWeight: 'bold',
    color: '#00ff41',
    fontSize: '16px',
  },
  successMessage: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
  },
  successMessageLine: {
    fontSize: '12px',
    color: 'rgba(0, 255, 65, 0.9)',
    letterSpacing: '1px',
    animation: 'slideInLeft 0.5s ease-out',
  },
  autoCloseBar: {
    width: '100%',
    height: '4px',
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '10px',
  },
  autoCloseProgress: {
    height: '100%',
    background: 'linear-gradient(90deg, #00ff41, #00cc33)',
    width: '100%',
    animation: 'autoClose 3s linear',
    boxShadow: '0 0 10px #00ff41',
  },
  particle: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    background: '#00ff41',
    borderRadius: '50%',
    boxShadow: '0 0 10px #00ff41',
    animation: 'particleFade 2s ease-out forwards',
    pointerEvents: 'none',
  },
};

// Inject CSS animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
       50% { transform: scale(1.1); opacity: 0.8; }
    }
    @keyframes pulseRing {
      0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
    }
    @keyframes glitchText {
      0%, 90%, 100% { text-shadow: 0 0 15px #ff4444, 0 0 30px #ff4444; }
      95% { text-shadow: -3px 0 15px #ff0000, 3px 0 30px #00ff41; }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes slide {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }
    @keyframes blink {
      0%, 50%, 100% { opacity: 1; }
      25%, 75% { opacity: 0.3; }
    }
    @keyframes successPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    @keyframes successGlow {
      0% { transform: scale(0.9); opacity: 0.8; }
      50% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(0.9); opacity: 0.8; }
    }
    @keyframes successGlowText {
      0%, 100% { text-shadow: 0 0 20px #00ff41, 0 0 40px #00ff41; }
      50% { text-shadow: 0 0 30px #00ff41, 0 0 60px #00ff41; }
    }
    @keyframes rewardPop {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes scaleIn {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes autoClose {
      0% { width: 100%; }
      100% { width: 0%; }
    }
    @keyframes particleFade {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(0.5); opacity: 0; }
    }
    @keyframes slideInLeft {
      0% { transform: translateX(-100%); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
  `;
  if (!document.querySelector('#recharge-overlay-styles')) {
    styleSheet.id = 'recharge-overlay-styles';
    document.head.appendChild(styleSheet);
  }
}

export default RechargeOverlay;
