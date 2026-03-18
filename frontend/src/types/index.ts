export interface User {
  _id: string;
  email: string;
  userName?: string;
  profilePicture?: string;
}

export interface Post {
  _id: string;
  text: string;
  img: string;
  sender: string | User;
  likes: string[];
  commentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedPosts {
  posts: Post[];
  page: number;
  limit: number;
  total: number;
  pages: number;
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
  googleLogin: (credential: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    userName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
