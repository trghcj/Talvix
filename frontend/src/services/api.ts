import axios from 'axios';
import { auth } from './firebase';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Update this to your deployed backend URL later
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
