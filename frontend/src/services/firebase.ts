import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDSJ7IsgfmIXgxaHT-DV8XViMiFnUigrOA",
  authDomain: "talvix-77f04.firebaseapp.com",
  projectId: "talvix-77f04",
  storageBucket: "talvix-77f04.firebasestorage.app",
  messagingSenderId: "1048205964095",
  appId: "1:1048205964095:web:9cba26355d1f113333598a",
  measurementId: "G-CX88B9JH8K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
