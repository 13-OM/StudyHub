import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseGroups from './pages/BrowseGroups';
import CreateGroup from './pages/CreateGroup';
import GroupDetails from './pages/GroupDetails';
import MyGroups from './pages/MyGroups';
import Sessions from './pages/Sessions';
import SessionDetails from './pages/SessionDetails';
import Resources from './pages/Resources';
import Announcements from './pages/Announcements';
import Attendance from './pages/Attendance';
import History from './pages/History';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { LoadingSpinner } from './components/ui';

/** Blocks a page for visitors who are not logged in. */
const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner label="Preparing your dashboard…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
};

/** Keeps logged in users away from the login / register screens. */
const RedirectIfAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner label="Checking your session…" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => (
  <Routes>
    {/* ------------------------- Public routes ------------------------- */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Landing />} />
    </Route>

    <Route
      path="/login"
      element={
        <RedirectIfAuth>
          <Login />
        </RedirectIfAuth>
      }
    />
    <Route
      path="/register"
      element={
        <RedirectIfAuth>
          <Register />
        </RedirectIfAuth>
      }
    />

    {/* ----------------------- Protected routes ------------------------ */}
    <Route
      element={
        <RequireAuth>
          <DashboardLayout />
        </RequireAuth>
      }
    >
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/groups" element={<BrowseGroups />} />
      <Route path="/groups/create" element={<CreateGroup />} />
      <Route path="/groups/:id" element={<GroupDetails />} />
      <Route path="/my-groups" element={<MyGroups />} />
      <Route path="/sessions" element={<Sessions />} />
      <Route path="/sessions/:id" element={<SessionDetails />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/announcements" element={<Announcements />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/history" element={<History />} />
      <Route path="/profile" element={<Profile />} />
    </Route>

    {/* ----------------------------- 404 ------------------------------ */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
