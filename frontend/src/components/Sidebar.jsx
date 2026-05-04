import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Zap, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects',  label: 'Projects',  icon: FolderKanban },
  { to: '/tasks',     label: 'Tasks',     icon: CheckSquare },
  { to: '/team',      label: 'Team',      icon: Users },
];

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const visibleLinks = isAdmin ? links : links.filter((l) => l.to !== '/team');

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col z-30"
      style={{
        background: 'rgba(8,8,8,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #ef233c, #c1121f)',
            boxShadow: '0 2px 12px rgba(239,35,60,0.4)',
          }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-sm tracking-tight">TaskFlow</span>
          <p className="text-gray-600 text-xs">Workspace</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-gray-600 text-[10px] font-semibold uppercase tracking-widest px-3 pb-2">Menu</p>
        {visibleLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-200 group relative
               ${isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-200'
               }`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(90deg, rgba(239,35,60,0.15) 0%, rgba(239,35,60,0.04) 100%)',
              border: '1px solid rgba(239,35,60,0.2)',
              boxShadow: '0 0 12px rgba(239,35,60,0.1)',
            } : {}}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                    style={{ background: '#ef233c', boxShadow: '0 0 8px rgba(239,35,60,0.8)' }} />
                )}
                <Icon className={`w-4 h-4 shrink-0 transition-colors duration-200
                  ${isActive ? 'text-brand-red' : 'text-gray-600 group-hover:text-gray-300'}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-brand-red/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(239,35,60,0.3), rgba(239,35,60,0.1))',
              border: '1px solid rgba(239,35,60,0.3)',
              color: '#ff4d6d',
              boxShadow: '0 0 10px rgba(239,35,60,0.15)',
            }}>
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
              <p className="text-gray-500 text-xs truncate">{user?.role}</p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-gray-500 text-xs font-medium
                     hover:text-red-400 transition-all duration-200 hover:bg-red-950/20">
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
