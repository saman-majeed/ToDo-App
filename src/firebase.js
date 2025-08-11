import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
apiKey: "AIzaSyChh76TsbxGHIx6wt8iKImX1CaZlxKzMyo",
  authDomain: "to-do-app-ec3b4.firebaseapp.com",
  projectId: "to-do-app-ec3b4",
  storageBucket: "to-do-app-ec3b4.firebasestorage.app",
  messagingSenderId: "149290076224",
  appId: "1:149290076224:web:b6e62f83f6e5dafa9537a5",
  measurementId: "G-Z92T0PC0E5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
