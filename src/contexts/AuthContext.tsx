import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { toast } from 'sonner';

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  freeVideosRemaining: number;
  isSubscribed: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  decrementFreeVideos: () => void;
  checkSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get saved user data or set defaults
        const savedData = localStorage.getItem(`user_data_${firebaseUser.uid}`);
        const userData = savedData ? JSON.parse(savedData) : {
          freeVideosRemaining: 2, 
          isSubscribed: false 
        };

        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          freeVideosRemaining: userData.freeVideosRemaining,
          isSubscribed: userData.isSubscribed 
        };
        setUser(user);
        toast.success(`Welcome ${user.displayName || 'back'}!`);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign in successful:', result.user.email);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      toast.error(`Failed to sign in: ${error.message}`);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to log out');
    }
  };

  const decrementFreeVideos = () => {
    if (user && !user.isSubscribed && user.freeVideosRemaining > 0) {
      const newCount = user.freeVideosRemaining - 1;
      const updatedUser = { ...user, freeVideosRemaining: newCount };
      setUser(updatedUser);
      
      // Save to localStorage
      localStorage.setItem(`user_data_${user.uid}`, JSON.stringify({
        freeVideosRemaining: newCount,
        isSubscribed: user.isSubscribed
      }));
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`https://api.whop.com/api/v2/memberships`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_WHOP_API_KEY}`,
        }
      });
      
      const data = await response.json();
      const isActive = data.some((membership: any) => 
        membership.user_id === user.uid && membership.status === 'active'
      );
      
      const updatedUser = { ...user, isSubscribed: isActive };
      setUser(updatedUser);
      
      // Save to localStorage
      localStorage.setItem(`user_data_${user.uid}`, JSON.stringify({
        freeVideosRemaining: user.freeVideosRemaining,
        isSubscribed: isActive
      }));
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
    decrementFreeVideos,
    checkSubscriptionStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 