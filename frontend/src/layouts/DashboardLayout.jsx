import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { requestService } from '../services';

/**
 * DashboardLayout — the shell of every authenticated page:
 *
 *   | SIDEBAR |  TOP HEADER                 |
 *   |         |  page content (<Outlet />)  |
 *
 * It also owns the mobile drawer state and closes the drawer whenever the
 * route changes.
 */
const DashboardLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();

  // Close the mobile drawer after navigating
  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Sidebar badge with the number of pending join requests
  useEffect(() => {
    let active = true;
    const load = () =>
      requestService
        .incoming()
        .then((response) => active && setPendingCount(response.pendingCount || 0))
        .catch(() => {});
    load();
    const interval = setInterval(load, 30000); // refresh every 30 s
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <Sidebar
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pendingCount={pendingCount}
      />

      <div className="app-main">
        <Header onMenuClick={() => setDrawerOpen(true)} />
        <main className="app-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
