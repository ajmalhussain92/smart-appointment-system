import { createContext, useContext, useState } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('user') || 'null')
  );

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch (e) { /* ignore */ }
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
