import { useLocation, useNavigate } from 'react-router-dom';

export default function TopNav({ timer, user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const displayName = user?.name || 'Learner';
  const initial = displayName.charAt(0).toUpperCase();

  const getBreadcrumb = () => {
    const pathMap = {
      '/dashboard': 'Dashboard',
      '/upload': 'Upload Center',
      '/quiz': 'Quiz Session',
      '/processing': 'Quiz Engine',
      '/results': 'Results',
      '/history': 'Quiz History',
    };
    return pathMap[location.pathname] || '';
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 w-full z-30 flex justify-between items-center px-8 h-16 bg-slate-50/50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <span className="text-lg font-black text-slate-800 tracking-tight">Curator AI</span>
        <span className="h-4 w-px bg-slate-300"></span>
        <span className="text-sm font-medium text-on-surface-variant">{getBreadcrumb()}</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Timer (shown on quiz page) */}
        {timer && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-tertiary-container/20 text-tertiary font-bold rounded-full">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              timer
            </span>
            <span className="text-sm tabular-nums">{timer}</span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative text-slate-500 hover:text-indigo-500 transition-all p-1 cursor-pointer">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-error rounded-full border-2 border-slate-50"></span>
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-800">{displayName}</p>
            <button
              onClick={handleLogout}
              className="text-[10px] text-slate-500 hover:text-indigo-600 font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
          <div className="w-9 h-9 rounded-full border-2 border-white shadow-sm bg-primary/20 flex items-center justify-center text-primary font-bold">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
