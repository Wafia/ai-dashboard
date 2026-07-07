import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ToolPage from './pages/ToolPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClients from './pages/admin/AdminClients';
import AdminAlerts from './pages/admin/AdminAlerts';
import { useState } from 'react';

function AdminRouter() {
  const [tab, setTab] = useState('dashboard');

  const renderContent = () => {
    switch (tab) {
      case 'dashboard': return <AdminDashboard />;
      case 'clients': return <AdminClients />;
      case 'alerts': return <AdminAlerts />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout activeTab={tab} onNavigate={setTab}>
      {renderContent()}
    </AdminLayout>
  );
}

function RequireAuth({ children, adminOnly = false }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/tool/:toolId"
        element={
          <RequireAuth>
            <ToolPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/login"
        element={<LoginPage />}
      />
      <Route
        path="/admin/*"
        element={
          <RequireAuth adminOnly>
            <AdminRouter />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}