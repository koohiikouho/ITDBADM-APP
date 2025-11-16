import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { JWTManager } from "./jwtUtils";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string, userData?: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const token = JWTManager.getToken();

      if (token && !JWTManager.isTokenExpired(token)) {
        setIsAuthenticated(true);
        // Get user data from localStorage or token
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } else {
        // Token is expired or invalid
        if (token) {
          JWTManager.removeToken();
          localStorage.removeItem("user");
        }
        setIsAuthenticated(false);
        setUser(null);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData?: any) => {
    JWTManager.setToken(token);
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    JWTManager.removeToken();
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
