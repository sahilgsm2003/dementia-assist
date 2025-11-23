import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "../services/api";
import i18n from "../i18n/config";

interface User {
  id: number;
  username: string;
  language?: string;
  translation_provider?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string, language?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const persistTranslationProvider = (provider?: string | null) => {
    localStorage.setItem("translation_provider", provider || "libretranslate");
  };

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          persistTranslationProvider(parsedUser.translation_provider);

          // Verify token is still valid by fetching current user
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
          persistTranslationProvider(currentUser.translation_provider);
        } catch (error) {
          console.error("Token validation failed:", error);
          // Clear invalid token and user data
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      } else {
        // No stored token, ensure state is cleared
        setToken(null);
        setUser(null);
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      const { access_token } = response;

      // Store token
      localStorage.setItem("access_token", access_token);
      setToken(access_token);

      // Fetch and store user data
      const userData = await authAPI.getCurrentUser();
      localStorage.setItem("user", JSON.stringify(userData));
      persistTranslationProvider(userData.translation_provider);
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (username: string, password: string, language: string = "en") => {
    try {
      // Clear any existing tokens before registration to avoid auth conflicts
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      
      await authAPI.register(username, password, language);
      // Auto-login after successful registration
      await login(username, password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("translation_provider");
    localStorage.setItem("i18nextLng", "en");
    i18n.changeLanguage("en");
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const userData = await authAPI.getCurrentUser();
        localStorage.setItem("user", JSON.stringify(userData));
        persistTranslationProvider(userData.translation_provider);
        setUser(userData);
      } catch (error) {
        console.error("Failed to refresh user:", error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
