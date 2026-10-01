import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { IconArrowRight, IconSearch } from '../components/Icons';

/** 404 page — shown for any unknown route. */
const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg)' }}>
      <section className="card card-pad" style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 18 }}>
          <Logo showTagline={false} />
        </div>

        <div className="badge badge-brand" style={{ marginBottom: 14 }}>
          <IconSearch size={12} /> Error 404
        </div>

        <h1 style={{ fontSize: '1.6rem' }}>Page not found</h1>
        <p className="text-muted">
          The page you are looking for does not exist or may have been moved. Check the address
          or head back to a page that definitely exists.
        </p>

        <div className="row" style={{ justifyContent: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            ← Go back
          </button>
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="btn btn-primary">
            {isAuthenticated ? 'Go to dashboard' : 'Go to homepage'} <IconArrowRight size={16} />
          </Link>
        </div>

        {isAuthenticated && (
          <div className="row-wrap" style={{ justifyContent: 'center', gap: 10, marginTop: 22 }}>
            <Link to="/groups" className="text-sm">Browse groups</Link>
            <Link to="/sessions" className="text-sm">Sessions</Link>
            <Link to="/resources" className="text-sm">Resources</Link>
            <Link to="/attendance" className="text-sm">Attendance</Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default NotFound;
