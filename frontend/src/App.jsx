import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import DoctorsPage from './pages/DoctorsPage';

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

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapse, toggleMobile }}>
      <div className="app-wrapper">
        {/* Mobile overlay */}
        {mobileOpen && user && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 199,
            }}
            className="d-lg-none"
          />
        )}

        {user && <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} />}

        <div
          className={user ? `main-area${collapsed ? ' collapsed' : ''}` : ''}
          style={{ flex: 1 }}
        >
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
