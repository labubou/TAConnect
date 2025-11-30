import { createContext, useContext, useState, useCallback } from 'react';

const GlobalLoadingContext = createContext();

export const useGlobalLoading = () => {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx) {
    throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
  }
  return ctx;
};

export const GlobalLoadingProvider = ({ children }) => {
  const [loadingStack, setLoadingStack] = useState([]);
  const isLoading = loadingStack.length > 0;
  const loadingMessage = loadingStack.length > 0 ? loadingStack[loadingStack.length - 1].message : '';

  // Add a loading operation to the stack
  const startLoading = useCallback((id, message = 'Loading...') => {
    setLoadingStack((prev) => {
      // Avoid duplicate IDs
      if (prev.some((item) => item.id === id)) {
        return prev;
      }
      return [...prev, { id, message }];
    });
  }, []);

  // Remove a loading operation from the stack
  const stopLoading = useCallback((id) => {
    setLoadingStack((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Clear all loading states (emergency reset)
  const clearLoading = useCallback(() => {
    setLoadingStack([]);
  }, []);

  // Update the message of an existing loading operation
  const updateLoadingMessage = useCallback((id, message) => {
    setLoadingStack((prev) =>
      prev.map((item) => (item.id === id ? { ...item, message } : item))
    );
  }, []);

  const value = {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    clearLoading,
    updateLoadingMessage,
  };

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
    </GlobalLoadingContext.Provider>
  );
};
