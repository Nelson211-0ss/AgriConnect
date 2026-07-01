import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/ui';
import { Layout } from './components/Layout';
import { RoleGuard, AppHome } from './components/RoleGuard';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Farmers from './pages/Farmers';
import ExtensionWorkers from './pages/ExtensionWorkers';
import Users from './pages/Users';
import Advisories from './pages/Advisories';
import Market from './pages/Market';
import Weather from './pages/Weather';
import Pests from './pages/Pests';
import Marketplace from './pages/Marketplace';
import Financial from './pages/Financial';
import Messaging from './pages/Messaging';
import Training from './pages/Training';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MobileApp from './pages/MobileApp';
import MapsView from './pages/MapsView';
import Cooperatives from './pages/Cooperatives';
import Knowledge from './pages/Knowledge';
import Directory from './pages/Directory';
import AuditLogs from './pages/AuditLogs';
import Cms from './pages/Cms';

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-mist">
        <Spinner className="h-8 w-8" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/app"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<AppHome />} />
        <Route
          path="dashboard"
          element={
            <RoleGuard allow={['super_admin', 'extension_officer']}>
              <Dashboard />
            </RoleGuard>
          }
        />
        <Route
          path="farmers"
          element={
            <RoleGuard allow={['super_admin', 'extension_officer']}>
              <Farmers />
            </RoleGuard>
          }
        />
        <Route path="extension-workers" element={<ExtensionWorkers />} />
        <Route path="users" element={<Users />} />
        <Route path="advisories" element={<Advisories />} />
        <Route path="market" element={<Market />} />
        <Route path="weather" element={<Weather />} />
        <Route path="pests" element={<Pests />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="financial" element={<Financial />} />
        <Route path="messaging" element={<Messaging />} />
        <Route path="training" element={<Training />} />
        <Route path="reports" element={<Reports />} />
        <Route path="maps" element={<MapsView />} />
        <Route path="cooperatives" element={<Cooperatives />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="directory" element={<Directory />} />
        <Route
          path="audit"
          element={
            <RoleGuard allow={['super_admin', 'extension_officer']}>
              <AuditLogs />
            </RoleGuard>
          }
        />
        <Route
          path="cms"
          element={
            <RoleGuard allow={['super_admin', 'extension_officer', 'digital_champion']}>
              <Cms />
            </RoleGuard>
          }
        />
        <Route path="mobile" element={<MobileApp />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
