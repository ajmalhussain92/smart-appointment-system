import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import DoctorsPage from './pages/DoctorsPage';
import { connectSocket, disconnectSocket } from './api/socket';

const SidebarContext = createContext();
export const useSidebar = () => useContext(SidebarContext);

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/dashboard" />;
  return children;
};

function AppLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setCollapsed(c => !c);
  const toggleMobile = () => setMobileOpen(o => !o);

  // Connect/disconnect socket based on auth
  useEffect(() => {
    if (user?.token) {
      connectSocket(user.token);
    } else {
      disconnectSocket();
    }
    return () => { if (!user) disconnectSocket(); };
  }, [user]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapse, toggleMobile }}>
      <div className="app-wrapper">
        {mobileOpen && user && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
            className="d-lg-none"
          />
        )}

        {user && <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} />}

        <div className={user ? `main-area${collapsed ? ' collapsed' : ''}` : ''}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/book" element={<PrivateRoute role="patient"><BookAppointment /></PrivateRoute>} />
            <Route path="/doctors" element={<PrivateRoute role="patient"><DoctorsPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

function AppWithPreloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show preloader for 1.8s on first load
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <Preloader />;

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppWithPreloader />
    </ThemeProvider>
  );
}
