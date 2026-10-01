import { Link, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { IconMoon, IconSun } from '../components/Icons';

/**
 * PublicLayout — navbar + page + footer for the landing page.
 */
const PublicLayout = () => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <nav className="public-nav">
        <div className="public-nav-inner">
          <Logo />

          <div className="public-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#subjects">Subjects</a>
          </div>

          <div className="row" style={{ marginLeft: 'auto', gap: 10 }}>
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <IconSun /> : <IconMoon />}
            </button>

            {isAuthenticated ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm desktop-only">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Create Account</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <Outlet />

      <footer className="footer">
        <div className="footer-inner">
          <div>
            <Logo />
            <p className="text-sm text-muted" style={{ marginTop: 14, maxWidth: 300 }}>
              StudyHub helps college students form focused study groups, schedule
              collaborative sessions, share resources and track their learning progress.
            </p>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <span className="badge badge-brand">Web Application Development</span>
              <span className="badge badge-violet">Mini Project</span>
            </div>
          </div>

          <div>
            <h4>Platform</h4>
            <ul>
              <li><Link to="/register">Create account</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#subjects">Subjects</a></li>
            </ul>
          </div>

          <div>
            <h4>For students</h4>
            <ul>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#features">Study sessions</a></li>
              <li><a href="#features">Attendance tracking</a></li>
              <li><a href="#features">Shared resources</a></li>
            </ul>
          </div>

          <div>
            <h4>Demo accounts</h4>
            <ul className="text-xs">
              <li className="text-muted">om@studyhub.com</li>
              <li className="text-muted">rahul@studyhub.com</li>
              <li className="text-muted">priya@studyhub.com</li>
              <li className="text-muted">Password: studyhub123</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} StudyHub — Find. Connect. Learn. Together.</span>
          <span>Built with React, Node.js, Express &amp; MongoDB</span>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
