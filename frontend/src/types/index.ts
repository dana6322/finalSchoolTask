export interface User {
  _id: string;
  email: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: string;
}

export interface Post {
  _id: string;
  text: string;
  img: string;
  sender: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  message: string;
  postId: string;
  sender: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  _id: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userName?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
