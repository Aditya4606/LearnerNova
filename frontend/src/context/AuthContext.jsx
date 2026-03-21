import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check if user is already logged in via cookie
    const storedUser = localStorage.getItem('learnova_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    const u = data.user;
    setUser(u);
    localStorage.setItem('learnova_user', JSON.stringify(u));
    return u;
  };

  const signup = async (email, username, password) => {
    const data = await api.post('/auth/signup', { email, username, password });
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // ignore logout errors
    }
    setUser(null);
    localStorage.removeItem('learnova_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
