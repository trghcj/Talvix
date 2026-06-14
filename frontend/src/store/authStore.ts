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
  activeRole: 'candidate' | 'recruiter';
  activeOrganization: any | null;
  organizations: any[];
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setDbUser: (dbUser: any | null) => void;
  setActiveRole: (role: 'candidate' | 'recruiter') => void;
  setActiveOrganization: (org: any | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  fetchDbUser: () => Promise<void>;
  fetchOrganizations: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  dbUser: null,
  activeRole: 'candidate',
  activeOrganization: null,
  organizations: [],
  loading: true,
  error: null,
  
  setUser: (user) => set({ user, loading: false }),
  setDbUser: (dbUser) => set({ dbUser }),
  setActiveRole: (role) => set({ activeRole: role }),
  setActiveOrganization: (org) => set({ activeOrganization: org }),
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

  register: async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Profile
      await updateProfile(userCredential.user, { displayName: fullName });
      
      // Sync to PostgreSQL Backend
      await apiClient.post('/api/auth/sync', {
        firebase_uid: userCredential.user.uid,
        name: fullName,
        email: email
      });
      
    } catch (err: any) {
      set({ error: err.message || 'Failed to register' });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Sync to PostgreSQL Backend
      await apiClient.post('/api/auth/sync', {
        firebase_uid: userCredential.user.uid,
        name: userCredential.user.displayName || '',
        email: userCredential.user.email || ''
      });

    } catch (err: any) {
      set({ error: err.message || 'Failed to authenticate with Google' });
      throw err;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, dbUser: null });
  },

  fetchDbUser: async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      set({ dbUser: response.data });
      await get().fetchOrganizations();
    } catch (err) {
      console.error("Failed to fetch dbUser", err);
      set({ dbUser: null });
    }
  },

  fetchOrganizations: async () => {
    try {
      const response = await apiClient.get('/api/organizations/my');
      const orgs = response.data;
      set({ organizations: orgs });
      if (orgs.length > 0 && !get().activeOrganization) {
        set({ activeOrganization: orgs[0].organization });
      } else if (orgs.length === 0 && get().activeRole === 'recruiter') {
        // Auto-create a default organization for new recruiters
        try {
          const createRes = await apiClient.post('/api/organizations', { name: 'My Company' });
          set({ activeOrganization: createRes.data });
          // Fetch again to update memberships
          const updatedRes = await apiClient.get('/api/organizations/my');
          set({ organizations: updatedRes.data });
        } catch (e) {
          console.error("Failed to auto-create organization", e);
        }
      }
    } catch (err) {
      console.error("Failed to fetch organizations", err);
      set({ organizations: [] });
    }
  }
}));

// Initialize auth listener
onAuthStateChanged(auth, async (user) => {
  useAuthStore.getState().setUser(user);
  if (user) {
    await useAuthStore.getState().fetchDbUser();
  } else {
    useAuthStore.getState().setDbUser(null);
  }
});
