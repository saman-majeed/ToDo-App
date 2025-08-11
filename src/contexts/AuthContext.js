import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  const loadUserProfile = async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          // If no profile document exists, create a basic one from auth data
          setUserProfile({
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            firstName: user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User',
            lastName: user.displayName?.split(' ')[1] || '',
            email: user.email
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to basic user data from auth
        setUserProfile({
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          firstName: user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User',
          lastName: user.displayName?.split(' ')[1] || '',
          email: user.email
        });
      }
    } else {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await loadUserProfile(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUserProfile = async () => {
    if (currentUser) {
      await loadUserProfile(currentUser);
    }
  };

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
