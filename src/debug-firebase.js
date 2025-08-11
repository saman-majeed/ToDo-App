import { auth, db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Test Firebase connection and authentication
export const testFirebaseConnection = () => {
  console.log('🧪 Testing Firebase Connection...');
  
  // Test authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('✅ User is authenticated:', user.email);
      console.log('🆔 User ID:', user.uid);
      
      // Test Firestore read access
      testFirestoreRead(user);
      
      // Test Firestore write access
      testFirestoreWrite(user);
    } else {
      console.log('❌ No user is authenticated');
    }
  });
};

const testFirestoreRead = async (user) => {
  try {
    console.log('🔍 Testing Firestore read access...');
    const tasksRef = collection(db, 'Tasks');
    const snapshot = await getDocs(tasksRef);
    console.log('✅ Firestore read successful. Found', snapshot.size, 'documents');
  } catch (error) {
    console.error('❌ Firestore read failed:', error.code, error.message);
  }
};

const testFirestoreWrite = async (user) => {
  try {
    console.log('🔧 Testing Firestore write access...');
    const testTask = {
      text: 'Test task - ' + Date.now(),
      completed: false,
      userId: user.uid,
      createdAt: new Date(),
      isTestTask: true
    };
    
    const docRef = await addDoc(collection(db, 'Tasks'), testTask);
    console.log('✅ Firestore write successful. Document ID:', docRef.id);
    
    // Clean up test task
    // Note: We'll leave the cleanup to manual deletion to avoid additional permissions
    
  } catch (error) {
    console.error('❌ Firestore write failed:', error.code, error.message);
    
    if (error.code === 'permission-denied') {
      console.error('🚫 Permission denied - Check your Firestore security rules');
      console.error('💡 Your security rules might be too restrictive');
    } else if (error.code === 'unauthenticated') {
      console.error('🔐 User not authenticated properly');
    }
  }
};

// Call this function to run the test
if (typeof window !== 'undefined') {
  window.testFirebaseConnection = testFirebaseConnection;
}
