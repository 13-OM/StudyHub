import { NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { Avatar } from './ui';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  IconBook, IconCalendarCheck, IconCheckSquare, IconDashboard, IconLayers,
  IconLogout, IconMegaphone, IconMoon, IconSun, IconUser, IconUsers,
} from './Icons';

/**
 * Sidebar — the main navigation of the authenticated application.
 * On mobile it slides in as a drawer (the `open` prop comes from the layout).
 */
const NAV_MAIN = [
  { to: '/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
  { to: '/groups', label: 'Browse Groups', icon: <IconUsers /> },
  { to: '/my-groups', label: 'My Groups', icon: <IconLayers /> },
  { to: '/sessions', label: 'Sessions', icon: <IconCalendarCheck /> },
  { to: '/resources', label: 'Resources', icon: <IconBook /> },
  { to: '/announcements', label: 'Announcements', icon: <IconMegaphone /> },
  { to: '/attendance', label: 'Attendance', icon: <IconCheckSquare /> },
  { to: '/history', label: 'Session History', icon: <IconLayers /> },
];

const Sidebar = ({ open, onClose, pendingCount = 0 }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('You have been logged out. See you soon!');
    navigate('/login');
  };

  return (
    <>
      {open && <div className="sidebar-backdrop mobile-only" onClick={onClose} aria-hidden="true" />}

      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-brand">
          <Logo />
        </div>

        <nav className="sidebar-nav">
          <p className="nav-group-label">Main</p>
          {NAV_MAIN.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.to === '/my-groups' && pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
            </NavLink>
          ))}

          <p className="nav-group-label">Settings</p>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <IconUser />
            <span>Profile</span>
          </NavLink>

          {/* Theme toggle — switches the whole application between light and dark */}
          <button
            type="button"
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'transparent' }}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <IconSun /> : <IconMoon />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            <span className="spacer" />
            <span className="badge badge-neutral">{isDark ? 'ON' : 'OFF'}</span>
          </button>
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <Avatar name={user?.name} color={user?.avatarColor} size="md" />
            <div style={{ minWidth: 0 }}>
              <p className="li-title truncate" style={{ fontSize: '0.86rem' }}>{user?.name}</p>
              <p className="li-sub truncate" style={{ fontSize: '0.72rem' }}>{user?.course}</p>
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-block" onClick={handleLogout}>
            <IconLogout size={17} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
