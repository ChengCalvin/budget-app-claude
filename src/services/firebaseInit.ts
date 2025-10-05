import { app } from './firebaseConfig';

let isInitialized = false;

export const initializeFirebase = (): boolean => {
  if (isInitialized) {
    return true;
  }

  try {
    if (app) {
      console.log('✅ Firebase initialized successfully');
      isInitialized = true;
      return true;
    } else {
      console.error('❌ Firebase initialization failed: app is null');
      return false;
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return false;
  }
};

export const isFirebaseInitialized = (): boolean => {
  return isInitialized;
};