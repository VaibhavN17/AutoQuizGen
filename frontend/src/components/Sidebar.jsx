import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/upload', label: 'Upload', icon: 'cloud_upload' },
  { path: '/quiz', label: 'Quiz', icon: 'quiz' },
  { path: '/history', label: 'History', icon: 'history' },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/quiz') {
      return ['/quiz', '/processing', '/results'].some(p => location.pathname.startsWith(p));
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 h-full z-40 flex flex-col p-4 bg-white/85 backdrop-blur-xl w-64 border-r border-slate-200/15 shadow-2xl shadow-slate-200/40">
      {/* Logo */}
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-10 h-10 primary-glow rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-indigo-600">Curator</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">SaaS Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={() =>
              `flex items-center gap-3 px-3 py-2.5 font-sans text-sm font-medium tracking-tight rounded-lg transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-indigo-500/20 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-100/50'
              }`
            }
          >
            <span
              className="material-symbols-outlined text-lg"
              style={isActive(item.path) ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className={isActive(item.path) ? 'font-semibold' : ''}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Create New Button */}
      <div className="mt-auto pt-4">
        <NavLink to="/upload">
          <button className="w-full primary-glow text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 duration-150 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Create New</span>
          </button>
        </NavLink>
      </div>
    </aside>
  );
}
