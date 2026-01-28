import React, { useState, useEffect, useRef } from 'react';

// Ghost Mode: Fallback messages when no real logs exist
const GHOST_LOGS = [
  'SYSTEM_READY >> Awaiting user activity...',
  'Scanning network perimeter...',
  'Encrypted connection established...',
  'Firewall protocols active...',
  'Database synchronization in progress...',
  'User authentication verified...',
  'Memory allocation optimized...',
  'Cache cleared successfully...',
  'Security protocols engaged...',
  'System monitoring active...',
  'Background processes running...',
  'All systems nominal...'
];

const SystemTerminal = ({ logs = [] }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const typewriterRef = useRef(null);
  const currentCharIndex = useRef(0);

  // Safe log parsing: Extract string from various data types
  const parseLogMessage = (log) => {
    if (!log) return null;
    
    // If it's already a string, use it
    if (typeof log === 'string') return log;
    
    // If it's an object, try different properties
    if (typeof log === 'object') {
      // Try common properties in order of priority
      if (log.message) return String(log.message);
      if (log.payload) return String(log.payload);
      if (log.text) return String(log.text);
      if (log.content) return String(log.content);
      if (log.data) return String(log.data);
      
      // Last resort: stringify the object
      try {
        return JSON.stringify(log);
      } catch {
        return null;
      }
    }
    
    // For any other type, convert to string
    return String(log);
  };

  // Get the current log message with ghost mode fallback
  const getCurrentMessage = () => {
    // If we have real logs, try to use them
    if (logs && logs.length > 0) {
      const parsedMessage = parseLogMessage(logs[currentLogIndex]);
      if (parsedMessage) return parsedMessage;
    }
    
    // Ghost Mode: Use fallback messages
    return GHOST_LOGS[currentLogIndex % GHOST_LOGS.length];
  };

  const currentLog = getCurrentMessage();
  const totalLogs = logs && logs.length > 0 ? logs.length : GHOST_LOGS.length;

  // Typewriter effect
  useEffect(() => {
    if (!currentLog) return;

    setIsTyping(true);
    currentCharIndex.current = 0;
    setDisplayedText('');

    // Clear any existing interval
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }

    // Type out the message character by character
    typewriterRef.current = setInterval(() => {
      if (currentCharIndex.current < currentLog.length) {
        setDisplayedText(currentLog.slice(0, currentCharIndex.current + 1));
        currentCharIndex.current++;
      } else {
        // Finished typing this message
        setIsTyping(false);
        clearInterval(typewriterRef.current);
        
        // Wait 3 seconds, then move to next log
        setTimeout(() => {
          setCurrentLogIndex((prev) => (prev + 1) % totalLogs);
        }, 3000);
      }
    }, 50); // Type speed: 50ms per character

    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  }, [currentLog, totalLogs]);

  return (
    <div
      style={{
        flex: 1,
        padding: '1rem 1.5rem',
        background: 'rgba(0, 0, 0, 0.6)',
        border: '2px solid rgba(0, 255, 136, 0.5)',
        borderRadius: '12px',
        fontFamily: "'Courier New', monospace",
        color: '#00ff88',
        fontSize: '0.85rem',
        letterSpacing: '1px',
        lineHeight: '1.6',
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.3), inset 0 0 30px rgba(0, 255, 136, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      {/* Scanline Effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(to right, transparent, rgba(0, 255, 136, 0.5), transparent)',
          animation: 'scanline 3s linear infinite',
          pointerEvents: 'none'
        }}
      ></div>

      {/* Terminal Header */}
      <div
        style={{
          fontSize: '0.65rem',
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            background: '#00ff88',
            borderRadius: '50%',
            boxShadow: '0 0 8px #00ff88',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        ></span>
        SYSTEM_TERMINAL
      </div>

      {/* Live Typewriter Text */}
      <div
        style={{
          color: '#00ff88',
          textShadow: '0 0 10px rgba(0, 255, 136, 0.8)',
          wordBreak: 'break-word',
          minHeight: '40px'
        }}
      >
        {displayedText}
        {/* Blinking Cursor - Always show when typing */}
        <span
          style={{
            display: 'inline-block',
            width: '2px',
            height: '16px',
            background: '#00ff88',
            marginLeft: '2px',
            animation: 'blink 0.7s step-end infinite',
            verticalAlign: 'middle',
            opacity: isTyping ? 1 : 0
          }}
        >_</span>
      </div>

      {/* Log Counter */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.5rem',
          right: '1rem',
          fontSize: '0.6rem',
          color: 'rgba(0, 255, 136, 0.5)',
          letterSpacing: '1px'
        }}
      >
        LOG [{currentLogIndex + 1}/{totalLogs}]
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes scanline {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }

        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 8px #00ff88;
          }
          50% {
            opacity: 0.5;
            box-shadow: 0 0 4px #00ff88;
          }
        }
      `}</style>
    </div>
  );
};

export default SystemTerminal;
