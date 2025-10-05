export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  profileImage?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  currency: string;
}

export interface AuthUser {
  id: string;
  email: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}