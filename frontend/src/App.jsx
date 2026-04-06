import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import History from './pages/History';

const AUTH_STORAGE_KEY = 'autoquiz.auth';

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.isAuthenticated) return null;
    return {
      isAuthenticated: true,
      user: parsed.user ?? null,
    };
  } catch {
    return null;
  }
};

function AppLayout({ timer, user, onLogout, onTimerUpdate }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopNav timer={timer} user={user} onLogout={onLogout} />
        <Outlet context={{ onTimerUpdate }} />
      </main>
    </div>
  );
}

function ProtectedRoute({ isAuth, children }) {
  if (!isAuth) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const storedAuth = readStoredAuth();
  const [user, setUser] = useState(storedAuth?.user ?? null);
  const [isAuthenticated, setIsAuthenticated] = useState(storedAuth?.isAuthenticated ?? false);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        isAuthenticated: true,
        user,
      }),
    );
  }, [isAuthenticated, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setTimer(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Protected Layout Routes */}
        <Route
          element={
            <ProtectedRoute isAuth={isAuthenticated}>
              <AppLayout timer={timer} user={user} onLogout={handleLogout} onTimerUpdate={setTimer} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/quiz" element={<Quiz onTimerUpdate={setTimer} />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
