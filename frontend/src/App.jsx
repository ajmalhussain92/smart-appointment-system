import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import DoctorsPage from './pages/DoctorsPage';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/dashboard" />;
  return children;
};

function Layout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  return (
    <div className="app-wrapper">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 199, display: 'none',
          }}
          className="d-lg-none"
        />
      )}
      <Sidebar open={sidebarOpen} />
      <div className="main-area">
        {/* Pass toggle to children via context or prop drilling */}
        {typeof children === 'function'
          ? children({ onMenuToggle: () => setSidebarOpen(o => !o) })
          : children}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Layout>
        {({ onMenuToggle } = {}) => (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard onMenuToggle={onMenuToggle} /></PrivateRoute>
            } />
            <Route path="/book" element={
              <PrivateRoute role="patient"><BookAppointment onMenuToggle={onMenuToggle} /></PrivateRoute>
            } />
            <Route path="/doctors" element={
              <PrivateRoute role="patient"><DoctorsPage onMenuToggle={onMenuToggle} /></PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </Layout>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
