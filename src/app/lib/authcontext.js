// lib/AuthContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle loading state

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to the context
export const useAuth = () => useContext(AuthContext);
