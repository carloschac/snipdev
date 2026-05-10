import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <rect x="1" y="1" width="5.5" height="5.5" rx="1" />
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1" />
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1" />
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Links',
    path: '/links',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M9 5.5L12 2.5M12 2.5H9M12 2.5V5.5" />
        <path d="M6 3H3.5A1.5 1.5 0 002 4.5v7A1.5 1.5 0 003.5 13h7A1.5 1.5 0 0012 11.5V9" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    path: '/Analytics',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M1 11l3.5-4 3 2.5L11 5l3 3" />
        <path d="M1 14h13" />
      </svg>
    ),
  },
];

const config = [
  {
    label: 'Perfil',
    path: '/profile',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <circle cx="7.5" cy="5" r="2.5" />
        <path d="M2 13c0-3.04 2.46-5.5 5.5-5.5S13 9.96 13 13" />
      </svg>
    ),
  },
  {
    label: 'Ajustes',
    path: '/settings',
    icon: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <circle cx="7.5" cy="7.5" r="2" />
        <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.1 3.1l1.1 1.1M10.8 10.8l1.1 1.1M3.1 11.9l1.1-1.1M10.8 4.2l1.1-1.1" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/analytics')
      return location.pathname.startsWith('/analytics');
    return location.pathname === path;
  };

  return (
    <aside className="w-52 bg-zinc-900 border-r border-zinc-800 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div
        className="p-5 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => navigate('/home')}
      >
        <div className="flex items-center gap-2 select-none">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="#052e16"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M8 2.5L11.5 6 8 9.5M3 6h8.5" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-medium">snip.dev</p>
            <p className="text-zinc-500 text-xs tracking-widest">
              LINK TRACKER
            </p>
          </div>
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navigation.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors ${
              isActive(item.path)
                ? 'bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        {/* Seção configurações */}
        <div className="mt-4">
          <p className="text-zinc-600 text-xs px-3 mb-1 tracking-widest">
            CONFIGURAÇÕES
          </p>
          {config.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors ${
                isActive(item.path)
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 mb-2 truncate">{user?.email}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          Sair
        </Button>
      </div>
    </aside>
  );
}
