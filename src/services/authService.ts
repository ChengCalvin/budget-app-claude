import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  displayName?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

class AuthService {
  async register(userData: UserRegistration): Promise<AuthResult> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      if (userData.displayName) {
        await updateProfile(userCredential.user, {
          displayName: userData.displayName,
        });
      }

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  }

  async login(loginData: UserLogin): Promise<AuthResult> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  async logout(): Promise<AuthResult> {
    try {
      await signOut(auth);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

export default new AuthService();