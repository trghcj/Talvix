import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'https://talvix-api.onrender.com';

export const apiClient = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      // Get the Firebase ID token
      const token = await user.getIdToken();
      // Attach the token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
