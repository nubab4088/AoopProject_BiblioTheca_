import { useEffect, useRef, useState } from 'react';

/**
 * AudioController - Professional audio engine for immersive game experience
 * 
 * Features:
 * - Background ambience loop with autoplay bypass
 * - Volume control and mute functionality
 * - Respects browser autoplay policies
 * - Persistent user preferences via localStorage
 */
function AudioController({ onMuteChange }) {
  const [isMuted, setIsMuted] = useState(() => {
    // Load mute preference from localStorage
    const saved = localStorage.getItem('audioMuted');
    return saved === 'true';
  });
  
  const [isReady, setIsReady] = useState(false);
  const ambienceRef = useRef(null);
  const hasInteracted = useRef(false);

  // Constants
  const AMBIENCE_VOLUME = 0.2;
  const FADE_DURATION = 1000; // 1 second fade in/out

  /**
   * Initialize audio element
   */
  useEffect(() => {
    ambienceRef.current = new Audio('/sounds/ambience.mp3');
    ambienceRef.current.loop = true;
    ambienceRef.current.volume = isMuted ? 0 : AMBIENCE_VOLUME;
    ambienceRef.current.preload = 'auto';

    // Mark as ready when audio can play
    ambienceRef.current.addEventListener('canplaythrough', () => {
      setIsReady(true);
      console.log('🎵 Audio engine ready');
    });

    return () => {
      if (ambienceRef.current) {
        ambienceRef.current.pause();
        ambienceRef.current = null;
      }
    };
  }, [isMuted]);

  /**
   * Handle mute toggle with fade effect
   */
  useEffect(() => {
    if (!ambienceRef.current) return;

    if (isMuted) {
      // Fade out
      fadeOut(ambienceRef.current, FADE_DURATION);
    } else if (hasInteracted.current) {
      // Fade in (only if user has interacted)
      fadeIn(ambienceRef.current, AMBIENCE_VOLUME, FADE_DURATION);
    }

    // Save preference
    localStorage.setItem('audioMuted', isMuted);

    // Notify parent component
    if (onMuteChange) {
      onMuteChange(isMuted);
    }
  }, [isMuted, onMuteChange]);

  /**
   * Start playback on first user interaction
   * This bypasses browser autoplay policies
   */
  useEffect(() => {
    const startAudioOnInteraction = () => {
      if (!hasInteracted.current && isReady && !isMuted && ambienceRef.current) {
        hasInteracted.current = true;
        
        ambienceRef.current.play()
          .then(() => {
            console.log('🎵 Background ambience started');
            fadeIn(ambienceRef.current, AMBIENCE_VOLUME, FADE_DURATION);
          })
          .catch(err => {
            console.warn('Audio autoplay blocked by browser:', err);
          });
      }
    };

    // Listen for any user interaction
    const events = ['click', 'keydown', 'touchstart', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, startAudioOnInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, startAudioOnInteraction);
      });
    };
  }, [isReady, isMuted]);

  /**
   * Fade in audio smoothly
   */
  const fadeIn = (audio, targetVolume, duration) => {
    if (!audio) return;

    audio.volume = 0;
    audio.play().catch(() => {});

    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps || !audio) {
        clearInterval(interval);
        if (audio) audio.volume = targetVolume;
        return;
      }

      audio.volume = Math.min(volumeStep * currentStep, targetVolume);
      currentStep++;
    }, stepDuration);
  };

  /**
   * Fade out audio smoothly
   */
  const fadeOut = (audio, duration) => {
    if (!audio) return;

    const startVolume = audio.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps || !audio) {
        clearInterval(interval);
        if (audio) {
          audio.volume = 0;
          audio.pause();
        }
        return;
      }

      audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);
      currentStep++;
    }, stepDuration);
  };

  /**
   * Toggle mute state - FIXED
   */
  const toggleMute = () => {
    console.log('🔊 Toggle audio called');
    setIsMuted(prev => {
      const newMuted = !prev;
      console.log('Audio muted:', newMuted);
      return newMuted;
    });
  };

  // Expose toggle function via window for external access (e.g., from Navbar)
  useEffect(() => {
    window.toggleAudio = toggleMute;
    window.getAudioMuted = () => isMuted;
    
    console.log('🎵 Audio controls registered');
    
    return () => {
      delete window.toggleAudio;
      delete window.getAudioMuted;
    };
  }, [isMuted]);

  // This component doesn't render anything visible
  return null;
}

export default AudioController;
