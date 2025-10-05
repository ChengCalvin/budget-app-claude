import { AuthUser, LoginCredentials, RegisterCredentials } from '../models/userModel';
import firebaseAuthService from '../../../services/authService';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const result = await firebaseAuthService.login({
      email: credentials.email,
      password: credentials.password
    });

    if (result.success && result.user) {
      const token = await result.user.getIdToken();
      return {
        id: result.user.uid,
        email: result.user.email!,
        token
      };
    }

    throw new Error(result.error || 'Login failed');
  }

  async register(credentials: RegisterCredentials): Promise<AuthUser> {
    const result = await firebaseAuthService.register({
      email: credentials.email,
      password: credentials.password,
      displayName: `${credentials.firstName} ${credentials.lastName}`
    });

    if (result.success && result.user) {
      const token = await result.user.getIdToken();
      return {
        id: result.user.uid,
        email: result.user.email!,
        token
      };
    }

    throw new Error(result.error || 'Registration failed');
  }

  async logout(): Promise<void> {
    const result = await firebaseAuthService.logout();
    if (!result.success) {
      throw new Error(result.error || 'Logout failed');
    }
  }

  async refreshToken(): Promise<string> {
    const user = firebaseAuthService.getCurrentUser();
    if (user) {
      return await user.getIdToken(true);
    }
    throw new Error('No authenticated user');
  }
}

export default new AuthService();