import { createContext, useState, useEffect, useContext } from 'react';

/**
 * UserContext - Production-Grade Persistent User State Management
 * 
 * Architecture:
 * - Lazy initialization from localStorage (instant load on mount)
 * - Auto-save on every state mutation (real-time persistence)
 * - Type-safe operations with duplicate prevention
 * - Graceful error handling and data validation
 * 
 * Persistence Strategy:
 * 1. LOAD: Check localStorage on app startup
 * 2. SAVE: Auto-sync to localStorage on every state change
 * 3. RESET: Clear all data and restart fresh
 * 
 * User State Schema:
 * {
 *   name: string - User display name
 *   kp: number - Knowledge Points (XP system)
 *   unlockedBooks: number[] - IDs of restored books
 *   completedGames: string[] - Game completion records
 * }
 */

const UserContext = createContext();

// 🔑 STORAGE KEY - Change this to force a data reset for all users
const STORAGE_KEY = 'library_user_data';

// 🆕 DEFAULT STATE - Fresh User Profile (No Progress)
// ⚠️ CRITICAL: This is the ONLY source of truth for new users
const DEFAULT_USER = Object.freeze({
  name: 'Guest Agent',
  kp: 100,                // STRICTLY 100 - DO NOT MODIFY
  unlockedBooks: [],      // STRICTLY EMPTY - All books start corrupted
  completedGames: []      // STRICTLY EMPTY - No games completed
});

export const UserProvider = ({ children }) => {
  // 🎯 BULLETPROOF LAZY INITIALIZATION: Load from localStorage ONCE on mount
  const [user, setUser] = useState(() => {
    console.log('🔍 [UserContext] Initializing...');
    
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      
      // ✅ RETURNING USER: Load existing progress
      if (savedData && savedData !== 'undefined' && savedData !== 'null') {
        const parsed = JSON.parse(savedData);
        
        // 🛡️ STRICT DATA VALIDATION: Ensure ALL required fields exist and are valid
        const validatedUser = {
          name: typeof parsed.name === 'string' && parsed.name.trim() !== '' 
            ? parsed.name 
            : DEFAULT_USER.name,
          kp: typeof parsed.kp === 'number' && !isNaN(parsed.kp) && isFinite(parsed.kp)
            ? Math.max(0, Math.floor(parsed.kp))
            : DEFAULT_USER.kp,
          unlockedBooks: Array.isArray(parsed.unlockedBooks) 
            ? parsed.unlockedBooks.filter(id => typeof id === 'number' || !isNaN(parseInt(id)))
            : [],
          completedGames: Array.isArray(parsed.completedGames) 
            ? parsed.completedGames.filter(key => typeof key === 'string')
            : []
        };
        
        console.log('✅ [UserContext] RETURNING USER - Loaded:', {
          name: validatedUser.name,
          kp: validatedUser.kp,
          unlockedBooksCount: validatedUser.unlockedBooks.length,
          completedGamesCount: validatedUser.completedGames.length
        });
        
        return validatedUser;
      }
    } catch (error) {
      // 🚨 CORRUPTED DATA: Clear and start fresh
      console.error('❌ [UserContext] Failed to parse localStorage:', error);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('❌ [UserContext] Failed to remove corrupted data:', e);
      }
    }
    
    // 🆕 NEW USER: Start with pristine fresh state
    console.log('🆕 [UserContext] NEW USER - Starting with clean slate:', {
      name: DEFAULT_USER.name,
      kp: DEFAULT_USER.kp,
      unlockedBooks: DEFAULT_USER.unlockedBooks,
      completedGames: DEFAULT_USER.completedGames
    });
    
    // Return a DEEP COPY to prevent any reference mutations
    return JSON.parse(JSON.stringify(DEFAULT_USER));
  });

  // 💾 AUTO-SAVE: Persist to localStorage on EVERY state change
  useEffect(() => {
    try {
      const serialized = JSON.stringify(user);
      localStorage.setItem(STORAGE_KEY, serialized);
      console.log('💾 State auto-saved to localStorage:', user);
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
      
      // 🚨 QUOTA EXCEEDED: Notify user (optional)
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ localStorage quota exceeded - data may not persist');
      }
    }
  }, [user]); // Triggers on ANY user state change

  // 🎮 UPDATE KP (XP SYSTEM)
  const updateKP = (amount) => {
    setUser(prev => {
      const newKP = Math.max(0, prev.kp + amount); // Floor at 0 (no negative KP)
      
      console.log(`💰 KP ${amount >= 0 ? 'GAINED' : 'LOST'}: ${prev.kp} ${amount >= 0 ? '+' : ''}${amount} = ${newKP}`);
      
      return {
        ...prev,
        kp: newKP
      };
    });
  };

  // 📚 UNLOCK BOOK (Add to collection)
  const unlockBook = (bookId) => {
    return new Promise((resolve) => {
      setUser(prev => {
        // 🔍 NORMALIZE ID: Convert to integer for consistency
        const normalizedId = parseInt(bookId, 10);
        
        // ❌ INVALID ID: Reject non-numeric IDs
        if (isNaN(normalizedId)) {
          console.error(`❌ Invalid book ID: ${bookId}`);
          resolve(false);
          return prev;
        }
        
        // ℹ️ ALREADY UNLOCKED: Prevent duplicates
        if (prev.unlockedBooks.includes(normalizedId)) {
          console.log(`ℹ️ Book ${normalizedId} already unlocked - skipping`);
          resolve(false);
          return prev;
        }

        // ✅ UNLOCK: Add to collection
        const updatedBooks = [...prev.unlockedBooks, normalizedId];
        const newState = {
          ...prev,
          unlockedBooks: updatedBooks
        };

        console.log(`🔓 BOOK UNLOCKED: ${normalizedId} | Total: ${updatedBooks.length}`);
        
        // ⚡ CRITICAL: Immediate persistence (don't wait for useEffect)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          console.log('💾 Unlock persisted immediately to localStorage');
        } catch (error) {
          console.error('❌ Failed to persist unlock:', error);
        }

        resolve(true);
        return newState;
      });
    });
  };

  // 🎯 MARK GAME AS COMPLETED
  const completeGame = (gameId, bookId) => {
    setUser(prev => {
      const gameKey = `${gameId}-${bookId}`;
      
      // ℹ️ ALREADY COMPLETED: Prevent duplicates
      if (prev.completedGames.includes(gameKey)) {
        console.log(`ℹ️ Game ${gameKey} already completed - skipping`);
        return prev;
      }

      console.log(`✅ GAME COMPLETED: ${gameKey}`);
      
      return {
        ...prev,
        completedGames: [...prev.completedGames, gameKey]
      };
    });
  };

  // 👤 UPDATE USER PROFILE (Name, etc.)
  const updateUser = (userData) => {
    setUser(prev => {
      const updated = {
        ...prev,
        ...userData
      };
      
      console.log('👤 User profile updated:', updated);
      return updated;
    });
  };

  // 🔄 RESET PROGRESS (Clear all data, keep name)
  const resetProgress = () => {
    const resetState = {
      ...DEFAULT_USER,
      name: user.name // Keep current name
    };
    
    console.log('🔄 PROGRESS RESET - Clearing all unlocked books and games');
    setUser(resetState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
  };

  // 🧹 CLEAR ALL DATA (Full reset to default)
  const clearAllData = () => {
    console.log('🧹 CLEARING ALL USER DATA - Full reset');
    localStorage.removeItem(STORAGE_KEY);
    setUser({ ...DEFAULT_USER });
  };

  // 🔃 RELOAD APP (Useful for demo/testing)
  const reloadApp = () => {
    console.log('🔃 Reloading application...');
    window.location.reload();
  };

  // 🚪 LOGOUT (Reset to guest)
  const logout = () => {
    console.log('🚪 User logged out - Resetting to Guest');
    clearAllData();
    reloadApp();
  };

  // 📊 CONTEXT VALUE: All exposed functions and state
  const value = {
    // State
    user,
    
    // Core Functions
    updateKP,          // Update Knowledge Points
    unlockBook,        // Unlock a book (async)
    completeGame,      // Mark game as completed
    updateUser,        // Update user profile
    
    // Utility Functions
    resetProgress,     // Clear progress but keep name
    clearAllData,      // Full reset to default
    logout,            // Logout and reload
    reloadApp          // Force page reload
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// 🪝 CUSTOM HOOK: Easy access to UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};

export default UserContext;
