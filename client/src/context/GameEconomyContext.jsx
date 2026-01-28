import { createContext, useContext } from 'react';
import useGameEconomy from '../hooks/useGameEconomy';

// Create context
const GameEconomyContext = createContext(null);

// Provider component
export function GameEconomyProvider({ children, userId }) {
  const economyState = useGameEconomy(userId);
  
  return (
    <GameEconomyContext.Provider value={economyState}>
      {children}
    </GameEconomyContext.Provider>
  );
}

// Custom hook to use the context
export function useGameEconomyContext() {
  const context = useContext(GameEconomyContext);
  if (!context) {
    throw new Error('useGameEconomyContext must be used within GameEconomyProvider');
  }
  return context;
}
