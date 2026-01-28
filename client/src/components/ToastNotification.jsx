import React, { useState, useEffect } from 'react';
import './CipherGameModal.css';

/**
 * ToastNotification - Professional game-style notification system
 */
const ToastNotification = ({ type = 'success', title, message, kpAmount, onClose }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Start exit animation after 400ms
    const exitTimer = setTimeout(() => {
      setIsLeaving(true);
    }, 400);

    // Actually remove the toast after animation completes (500ms total)
    const removeTimer = setTimeout(() => {
      onClose();
    }, 500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [onClose]);

  return (
    <div className={`toast ${type} ${isLeaving ? 'toast-leaving' : ''}`}>
      <div className="toast-header">
        <span className="toast-icon">{type === 'success' ? '✓' : type === 'error' ? '✗' : '⚠'}</span>
        <span className="toast-title">{title}</span>
      </div>
      <div className="toast-body">
        <span className="toast-message">{message}</span>
        {kpAmount && <span className="toast-kp">+{kpAmount} KP</span>}
      </div>
      <div className="toast-progress"></div>
    </div>
  );
};

export default ToastNotification;
