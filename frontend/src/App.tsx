// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NetworkPage from './pages/NetworkPage';
import LearningPage from './pages/LearningPage';
import Layout from './components/shared/Layout';
import Leaderboard from './components/leaderboard/Leaderboard';
import AIRecommendations from './components/ai/AIRecommendations';
import OfflineMode from './components/offline/OfflineMode';
import ErrorBoundary from './components/shared/ErrorBoundary';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen"><div className="spinner" /><div>Loading...</div></div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"       element={<DashboardPage />} />
                <Route path="network"         element={<NetworkPage />} />
                <Route path="learning"        element={<LearningPage />} />
                <Route path="leaderboard"     element={<Leaderboard />} />
                <Route path="recommendations" element={<AIRecommendations networkQuality="good" />} />
                <Route path="offline"         element={<OfflineMode />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
