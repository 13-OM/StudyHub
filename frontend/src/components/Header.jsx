import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, EmptyState } from './ui';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { requestService } from '../services';
import { useClickOutside } from '../hooks/useApi';
import { greeting, timeAgo } from '../utils/format';
import {
  IconBell, IconChevronDown, IconInbox, IconLogout, IconMoon, IconPlus,
  IconSun, IconUser, IconUsers,
} from './Icons';

/**
 * Header — sticky top bar: page title / greeting, global search,
 * notifications, theme toggle and the user dropdown.
 */
const Header = ({ title, subtitle, onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [openMenu, setOpenMenu] = useState(''); // 'bell' | 'user' | ''

  const bellRef = useClickOutside(() => setOpenMenu((m) => (m === 'bell' ? '' : m)));
  const userRef = useClickOutside(() => setOpenMenu((m) => (m === 'user' ? '' : m)));

  // Load incoming join requests to show a real notification counter
  useEffect(() => {
    let active = true;
    requestService
      .incoming()
      .then((response) => {
        if (!active) return;
        setNotifications(response.data.requests.filter((r) => r.status === 'Pending').slice(0, 6));
      })
      .catch(() => {
        /* notifications are not critical — ignore errors silently */
      });
    return () => {
      active = false;
    };
  }, []);

  const submitSearch = () => {
    if (!query.trim()) return;
    navigate(`/groups?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = async () => {
    setOpenMenu('');
    await logout();
    toast.info('You have been logged out.');
    navigate('/login');
  };

  return (
    <header className="header">
      <button
        type="button"
        className="icon-btn mobile-only"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <div className="header-greeting" style={{ flex: '0 1 auto' }}>
        <p className="g-title">{title || `${greeting()}, ${user?.name?.split(' ')[0] || 'student'} 👋`}</p>
        <p className="g-sub">{subtitle || "Here's what's happening with your study groups."}</p>
      </div>

      <div className="header-search" style={{ marginLeft: 'auto' }}>
        <SearchBar
          id="global-search"
          value={query}
          onChange={setQuery}
          onSubmit={submitSearch}
          placeholder="Search study groups…"
        />
      </div>

      <Link to="/groups/create" className="btn btn-primary btn-sm desktop-only">
        <IconPlus size={15} /> New group
      </Link>

      {/* Notifications */}
      <div className="dropdown" ref={bellRef}>
        <button
          type="button"
          className="icon-btn"
          aria-label={`Notifications (${notifications.length} pending)`}
          onClick={() => setOpenMenu((m) => (m === 'bell' ? '' : 'bell'))}
        >
          <IconBell />
          {notifications.length > 0 && <span className="dot">{notifications.length}</span>}
        </button>

        {openMenu === 'bell' && (
          <div className="dropdown-menu" style={{ minWidth: 320 }}>
            <div className="dropdown-head row-between">
              <strong style={{ fontSize: '0.87rem' }}>Pending join requests</strong>
              <span className="badge badge-warning">{notifications.length}</span>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '8px 4px 10px' }}>
                <EmptyState
                  icon={<IconInbox size={22} />}
                  title="No new requests"
                  message="Join requests for groups you own will appear here."
                />
              </div>
            ) : (
              notifications.map((request) => (
                <Link
                  key={request._id}
                  to={`/groups/${request.group?._id || request.group}?tab=members`}
                  className="dropdown-item"
                  onClick={() => setOpenMenu('')}
                >
                  <Avatar name={request.user?.name} color={request.user?.avatarColor} size="sm" />
                  <span style={{ minWidth: 0 }}>
                    <span className="truncate" style={{ display: 'block', fontWeight: 600, color: 'var(--text)' }}>
                      {request.user?.name}
                    </span>
                    <span className="text-xs text-muted">
                      wants to join {request.group?.name} · {timeAgo(request.createdAt)}
                    </span>
                  </span>
                </Link>
              ))
            )}
            <div className="dropdown-divider" />
            <Link to="/my-groups" className="dropdown-item" onClick={() => setOpenMenu('')}>
              <IconUsers size={16} /> Manage all requests
            </Link>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        type="button"
        className="icon-btn"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? <IconSun /> : <IconMoon />}
      </button>

      {/* User dropdown */}
      <div className="dropdown" ref={userRef}>
        <button
          type="button"
          className="row"
          style={{ background: 'none', border: 'none', gap: 9, padding: 4, borderRadius: 10 }}
          onClick={() => setOpenMenu((m) => (m === 'user' ? '' : 'user'))}
          aria-haspopup="menu"
          aria-expanded={openMenu === 'user'}
        >
          <Avatar name={user?.name} color={user?.avatarColor} size="md" />
          <span className="desktop-only" style={{ textAlign: 'left', lineHeight: 1.25 }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>
              {user?.name?.split(' ')[0]}
            </span>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {user?.skillLevel}
            </span>
          </span>
          <IconChevronDown size={15} className="desktop-only" />
        </button>

        {openMenu === 'user' && (
          <div className="dropdown-menu" role="menu">
            <div className="dropdown-head">
              <div className="row" style={{ gap: 10 }}>
                <Avatar name={user?.name} color={user?.avatarColor} size="md" />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '0.87rem' }} className="truncate">
                    {user?.name}
                  </span>
                  <span className="text-xs text-muted truncate" style={{ display: 'block' }}>{user?.email}</span>
                </span>
              </div>
            </div>
            <Link to="/profile" className="dropdown-item" onClick={() => setOpenMenu('')}>
              <IconUser size={16} /> My profile
            </Link>
            <Link to="/my-groups" className="dropdown-item" onClick={() => setOpenMenu('')}>
              <IconUsers size={16} /> My groups
            </Link>
            <button type="button" className="dropdown-item" onClick={toggleTheme}>
              {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>
            <div className="dropdown-divider" />
            <button type="button" className="dropdown-item danger" onClick={handleLogout}>
              <IconLogout size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
