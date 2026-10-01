import { Link } from 'react-router-dom';
import { IconGraduation } from './Icons';

/**
 * Logo — the STUDYHUB brand mark (used in the sidebar, navbar and auth pages).
 */
const Logo = ({ to = '/', showTagline = true, size = 'md' }) => {
  const markSize = size === 'lg' ? 44 : 38;
  return (
    <Link to={to} className="row" style={{ gap: 11, color: 'inherit' }} aria-label="StudyHub home">
      <span className="brand-mark" style={{ width: markSize, height: markSize }}>
        <IconGraduation size={size === 'lg' ? 23 : 20} />
      </span>
      <span className="brand-text">
        <span className="brand-name" style={{ fontSize: size === 'lg' ? '1.3rem' : '1.06rem' }}>
          STUDY<span style={{ color: 'var(--brand-600)' }}>HUB</span>
        </span>
        {showTagline && <span className="brand-tag">Find. Connect. Learn.</span>}
      </span>
    </Link>
  );
};

export default Logo;
