import { createContext, useState, useEffect, useContext } from 'react';

/**
 * UserContext - Centralized User State Management with Persistence
 * 
 * Manages:
 * - User profile (name, ID)
 * - Knowledge Points (KP) with persistence
 * - Unlocked books tracking
 * - Completed games tracking
 * 
 * Features:
 * - Automatic localStorage sync
 * - Type-safe operations
 * - Prevents negative KP
 * - Duplicate prevention for unlocks
 */

const UserContext = createContext();

// Storage keys
const STORAGE_KEY = 'bibliotheca_user';

// Default user state - NEW USERS START WITH ZERO UNLOCKED BOOKS
const DEFAULT_USER = {
  name: 'Guest',
  id: null,
  kp: 100,
  unlockedBooks: [],      // ✅ CRITICAL: Empty array for new users
  completedGames: []      // ✅ CRITICAL: Empty array for new users
};

export const UserProvider = ({ children }) => {
  // 🎯 INITIALIZE STATE FROM LOCALSTORAGE - NEW USERS GET EMPTY ARRAYS
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('✅ User state loaded from localStorage:', parsed);
        
        // ⚠️ SAFETY CHECK: Ensure arrays exist and are valid
        return {
          ...DEFAULT_USER,
          ...parsed,
          unlockedBooks: Array.isArray(parsed.unlockedBooks) ? parsed.unlockedBooks : [],
          completedGames: Array.isArray(parsed.completedGames) ? parsed.completedGames : []
        };
      }
    } catch (error) {
      console.error('❌ Error loading user from localStorage:', error);
      // On error, clear corrupted data and start fresh
      localStorage.removeItem(STORAGE_KEY);
    }
    
    // 🆕 NEW USER: Start with empty unlocked books
    console.log('ℹ️ New user - Starting with ZERO unlocked books');
    return DEFAULT_USER;
  });

  // 💾 PERSIST TO LOCALSTORAGE ON EVERY STATE CHANGE
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      console.log('💾 User state saved to localStorage:', user);
    } catch (error) {
      console.error('❌ Error saving user to localStorage:', error);
    }
  }, [user]);

  // 🎮 UPDATE KP FUNCTION
  const updateKP = (amount) => {
    setUser(prev => {
      const newKP = Math.max(0, prev.kp + amount); // Prevent negative KP
      
      console.log(`🎯 KP Update: ${prev.kp} ${amount >= 0 ? '+' : ''}${amount} = ${newKP}`);
      
      return {
        ...prev,
        kp: newKP
      };
    });
  };

  // 📚 UNLOCK BOOK FUNCTION - ENHANCED WITH IMMEDIATE PERSISTENCE
  const unlockBook = (bookId) => {
    return new Promise((resolve) => {
      setUser(prev => {
        // 🔍 NORMALIZE ID: Handle both string and number formats
        const normalizedId = parseInt(bookId);
        
        // Prevent duplicates - check both formats
        if (prev.unlockedBooks.includes(normalizedId) || 
            prev.unlockedBooks.includes(String(normalizedId))) {
          console.log(`ℹ️ Book ${normalizedId} already unlocked`);
          resolve(false);
          return prev;
        }

        console.log(`🔓 UNLOCKING Book ${normalizedId}...`);
        
        const updatedBooks = [...prev.unlockedBooks, normalizedId];
        const newState = {
          ...prev,
          unlockedBooks: updatedBooks
        };

        // ⚡ CRITICAL: Immediate localStorage write (bypass useEffect delay)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          console.log(`✅ Book ${normalizedId} UNLOCKED and PERSISTED to localStorage:`, updatedBooks);
        } catch (error) {
          console.error('❌ Failed to persist unlock to localStorage:', error);
        }

        resolve(true);
        return newState;
      });
    });
  };

  // 🎮 MARK GAME AS COMPLETED
  const completeGame = (gameId, bookId) => {
    setUser(prev => {
      const gameKey = `${gameId}-${bookId}`;
      
      // Prevent duplicates
      if (prev.completedGames.includes(gameKey)) {
        console.log(`ℹ️ Game ${gameKey} already completed`);
        return prev;
      }

      console.log(`✅ Game ${gameKey} completed!`);
      
      return {
        ...prev,
        completedGames: [...prev.completedGames, gameKey]
      };
    });
  };

  // 👤 UPDATE USER INFO
  const updateUser = (userData) => {
    setUser(prev => ({
      ...prev,
      ...userData
    }));
  };

  // 🔄 RESET USER TO DEFAULT - CLEARS ALL UNLOCKED BOOKS
  const resetUser = () => {
    console.log('🔄 Resetting user to default state - CLEARING all unlocked books');
    setUser(DEFAULT_USER);
    localStorage.removeItem(STORAGE_KEY);
  };

  // 🚪 LOGOUT - ALSO CLEARS UNLOCKED BOOKS
  const logout = () => {
    console.log('🚪 User logged out - CLEARING all unlocked books');
    resetUser();
  };

  // 🧹 NEW UTILITY: Clear localStorage and reload (for testing/demo reset)
  const clearAllData = () => {
    console.log('🧹 CLEARING ALL USER DATA');
    localStorage.removeItem(STORAGE_KEY);
    setUser(DEFAULT_USER);
    window.location.reload();
  };

  const value = {
    user,
    updateKP,
    unlockBook,
    completeGame,
    updateUser,
    resetUser,
    logout,
    clearAllData  // ✨ NEW: Expose clear function for dev/testing
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easy access
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export default UserContext;
