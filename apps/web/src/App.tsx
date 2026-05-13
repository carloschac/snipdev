import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';
import { Dashboard } from '@/pages/dashboard/Dashboard';
import { Analytics } from '@/pages/dashboard/Analytics';
import { LinkAnalytics } from '@/pages/dashboard/LinkAnalytics';
import { Links } from '@/pages/dashboard/Links';
import { Profile } from '@/pages/dashboard/Profile';
import { Settings } from '@/pages/dashboard/Settings';
import { PublicProfile } from '@/pages/Profile';
import { UsernameProfile } from '@/pages/UsernameProfile';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Home } from '@/pages/Home';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/links"
        element={
          <ProtectedRoute>
            <Links />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/:linkId"
        element={
          <ProtectedRoute>
            <LinkAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="/profile/:userId" element={<PublicProfile />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
      <Route path="/u/:username" element={<UsernameProfile />} />
    </Routes>
  );
}
