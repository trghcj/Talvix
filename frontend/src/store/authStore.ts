import { create } from 'zustand';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { apiClient } from '../services/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  loginWithGoogle: (role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  
  setUser: (user) => set({ user, loading: false }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  login: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      set({ error: err.message || 'Failed to login' });
      throw err;
    }
  },

  register: async (email, password, fullName, role) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Profile
      await updateProfile(userCredential.user, { displayName: fullName });
      
      // Sync to PostgreSQL Backend
      await apiClient.post('/auth/sync', {
        firebase_uid: userCredential.user.uid,
        name: fullName,
        email: email,
        role: role
      });
      
    } catch (err: any) {
      set({ error: err.message || 'Failed to register' });
      throw err;
    }
  },

  loginWithGoogle: async (role = 'candidate') => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Sync to PostgreSQL Backend
      await apiClient.post('/auth/sync', {
        firebase_uid: userCredential.user.uid,
        name: userCredential.user.displayName || '',
        email: userCredential.user.email || '',
        role: role
      });

    } catch (err: any) {
      set({ error: err.message || 'Failed to authenticate with Google' });
      throw err;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
}));

// Initialize auth listener
onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
});
