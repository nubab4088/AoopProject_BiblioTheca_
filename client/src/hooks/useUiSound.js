import { useRef, useCallback, useEffect } from 'react';

/**
 * useUiSound Hook - Centralized Sound Effect System
 * 
 * Manages all UI sound effects with proper preloading, volume control,
 * and playback state management.
 * 
 * Available sounds:
 * - Click (click.mp3) - Button clicks
 * - Hover (hover.mp3) - Button hover
 * - Win (win.mp3) - Success/achievement
 * - Power-up (power-up.mp3) - Power-ups/boosts
 * - Countdown (count.mp3) - Timer warnings/urgency
 * - Ambience (ambience.mp3) - Background music (optional)
 */

const useUiSound = () => {
  // Sound effect refs
  const clickSoundRef = useRef(null);
  const hoverSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  const powerUpSoundRef = useRef(null);
  const countdownSoundRef = useRef(null);
  const ambienceSoundRef = useRef(null);

  // Volume levels (0.0 to 1.0)
  const CLICK_VOLUME = 0.3;
  const HOVER_VOLUME = 0.2;
  const WIN_VOLUME = 0.5;
  const POWERUP_VOLUME = 0.4;
  const COUNTDOWN_VOLUME = 0.6;
  const AMBIENCE_VOLUME = 0.15;

  // Initialize and preload all sounds
  useEffect(() => {
    // Preload all sound files
    clickSoundRef.current = new Audio('/sounds/click.mp3');
    hoverSoundRef.current = new Audio('/sounds/hover.mp3');
    winSoundRef.current = new Audio('/sounds/win.mp3');
    powerUpSoundRef.current = new Audio('/sounds/power-up.mp3');
    countdownSoundRef.current = new Audio('/sounds/count.mp3');
    ambienceSoundRef.current = new Audio('/sounds/ambience.mp3');

    // Set volumes
    clickSoundRef.current.volume = CLICK_VOLUME;
    hoverSoundRef.current.volume = HOVER_VOLUME;
    winSoundRef.current.volume = WIN_VOLUME;
    powerUpSoundRef.current.volume = POWERUP_VOLUME;
    countdownSoundRef.current.volume = COUNTDOWN_VOLUME;
    ambienceSoundRef.current.volume = AMBIENCE_VOLUME;

    // Make ambience loop
    ambienceSoundRef.current.loop = true;

    // Preload by setting preload attribute
    [
      clickSoundRef,
      hoverSoundRef,
      winSoundRef,
      powerUpSoundRef,
      countdownSoundRef,
      ambienceSoundRef
    ].forEach(ref => {
      if (ref.current) {
        ref.current.preload = 'auto';
      }
    });

    console.log('🔊 UI Sound System Initialized - All sounds preloaded');

    // Cleanup on unmount
    return () => {
      [
        clickSoundRef,
        hoverSoundRef,
        winSoundRef,
        powerUpSoundRef,
        countdownSoundRef,
        ambienceSoundRef
      ].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = '';
        }
      });
    };
  }, []);

  /**
   * Helper function to safely play a sound
   */
  const playSoundSafely = useCallback((soundRef, soundName) => {
    if (soundRef.current) {
      try {
        // Reset to start
        soundRef.current.currentTime = 0;
        
        // Play with error handling
        const playPromise = soundRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn(`⚠️ Failed to play ${soundName}:`, error.message);
          });
        }
      } catch (error) {
        console.error(`❌ Error playing ${soundName}:`, error);
      }
    }
  }, []);

  /**
   * Helper function to stop a sound
   */
  const stopSoundSafely = useCallback((soundRef, soundName) => {
    if (soundRef.current) {
      try {
        soundRef.current.pause();
        soundRef.current.currentTime = 0;
        console.log(`🔇 Stopped ${soundName}`);
      } catch (error) {
        console.error(`❌ Error stopping ${soundName}:`, error);
      }
    }
  }, []);

  // Individual sound players
  const playClick = useCallback(() => {
    playSoundSafely(clickSoundRef, 'click sound');
  }, [playSoundSafely]);

  const playHover = useCallback(() => {
    playSoundSafely(hoverSoundRef, 'hover sound');
  }, [playSoundSafely]);

  const playWin = useCallback(() => {
    playSoundSafely(winSoundRef, 'win sound');
  }, [playSoundSafely]);

  const playPowerUp = useCallback(() => {
    playSoundSafely(powerUpSoundRef, 'power-up sound');
  }, [playSoundSafely]);

  const playCountdown = useCallback(() => {
    playSoundSafely(countdownSoundRef, 'countdown sound');
  }, [playSoundSafely]);

  const stopCountdown = useCallback(() => {
    stopSoundSafely(countdownSoundRef, 'countdown sound');
  }, [stopSoundSafely]);

  // Alias for backward compatibility
  const playCountdown2 = playCountdown;
  const stopCountdown2 = stopCountdown;

  const playAmbience = useCallback(() => {
    if (ambienceSoundRef.current) {
      try {
        const playPromise = ambienceSoundRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('🎵 Ambience music started');
            })
            .catch(error => {
              console.warn('⚠️ Failed to play ambience:', error.message);
            });
        }
      } catch (error) {
        console.error('❌ Error playing ambience:', error);
      }
    }
  }, []);

  const stopAmbience = useCallback(() => {
    if (ambienceSoundRef.current) {
      ambienceSoundRef.current.pause();
      ambienceSoundRef.current.currentTime = 0;
      console.log('🔇 Ambience music stopped');
    }
  }, []);

  const setAmbienceVolume = useCallback((volume) => {
    if (ambienceSoundRef.current) {
      ambienceSoundRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    playClick,
    playHover,
    playWin,
    playPowerUp,
    playCountdown,
    stopCountdown,
    playCountdown2,
    stopCountdown2,
    playAmbience,
    stopAmbience,
    setAmbienceVolume,
  };
};

export default useUiSound;
