import { useEffect } from 'react';
import { initialsOf } from '../utils/format';
import {
  IconAlert, IconCheck, IconChevronLeft, IconChevronRight, IconInbox, IconX,
} from './Icons';

/* ------------------------------------------------------------------ Avatar */
export const Avatar = ({ name = '', color = '#4f46e5', size = 'md', title }) => (
  <span
    className={`avatar avatar-${size}`}
    style={{ background: color }}
    title={title || name}
    aria-hidden={title ? undefined : 'true'}
  >
    {initialsOf(name)}
  </span>
);

export const AvatarStack = ({ users = [], max = 4, size = 'sm' }) => {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <span className="avatar-stack">
      {shown.map((user) => (
        <Avatar key={user._id || user} name={user.name} color={user.avatarColor} size={size} />
      ))}
      {extra > 0 && (
        <span className={`avatar avatar-${size}`} style={{ background: '#64748b' }}>
          +{extra}
        </span>
      )}
    </span>
  );
};

/* ------------------------------------------------------------------ Badges */
const SKILL_VARIANT = { Beginner: 'badge-info', Intermediate: 'badge-warning', Advanced: 'badge-violet' };
export const SkillBadge = ({ level }) => (
  <span className={`badge ${SKILL_VARIANT[level] || 'badge-neutral'}`}>{level}</span>
);

const STATUS_VARIANT = {
  Upcoming: 'badge-brand',
  'In Progress': 'badge-warning',
  Completed: 'badge-success',
  Cancelled: 'badge-danger',
  Pending: 'badge-warning',
  Approved: 'badge-success',
  Rejected: 'badge-danger',
  Active: 'badge-success',
  Archived: 'badge-neutral',
};
export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_VARIANT[status] || 'badge-neutral'}`}>{status}</span>
);

export const RoleBadge = ({ role }) =>
  role === 'Owner' ? (
    <span className="badge badge-violet">
      <IconCheck size={12} strokeWidth={3} /> Owner
    </span>
  ) : (
    <span className="badge badge-neutral">Member</span>
  );

export const ResourceTypeBadge = ({ type }) => {
  const variant = {
    PDF: 'badge-danger', Video: 'badge-violet', Article: 'badge-info',
    Website: 'badge-brand', Notes: 'badge-warning', Other: 'badge-neutral',
  }[type] || 'badge-neutral';
  return <span className={`badge ${variant}`}>{type}</span>;
};

/* ----------------------------------------------------------------- Progress */
export const ProgressBar = ({ value = 0, variant = '' }) => (
  <div
    className={`progress ${variant}`}
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <span style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
  </div>
);

/** Circular progress used on the dashboard for the attendance rate. */
export const ProgressRing = ({ value = 0, size = 118, label = 'Attendance' }) => {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  const color = value >= 75 ? 'var(--success-500)' : value >= 50 ? 'var(--warning-500)' : 'var(--danger-500)';

  return (
    <figure className="ring" style={{ width: size, height: size, margin: 0 }}>
      <svg width={size} height={size} role="img" aria-label={`${label}: ${value}%`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-soft)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </svg>
      <div className="ring-value" style={{ color }}>{value}%</div>
    </figure>
  );
};

/* ------------------------------------------------------------------- Loaders */
export const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="loading-block">
    <span className="spinner" />
    <span>{label}</span>
  </div>
);

export const CardSkeletonGrid = ({ count = 6, height = 196 }) => (
  <div className="grid grid-auto">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton" style={{ height }} />
    ))}
  </div>
);

export const RowSkeletonList = ({ count = 4 }) => (
  <div className="stack" style={{ gap: 12 }}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton skeleton-row" />
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="grid grid-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="skeleton" style={{ height: 116 }} />
    ))}
  </div>
);

/* --------------------------------------------------------------- Empty state */
export const EmptyState = ({ icon, title, message, action }) => (
  <div className="empty-state">
    <div className="es-icon">{icon || <IconInbox size={26} />}</div>
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    {action}
  </div>
);

/* --------------------------------------------------------------------- Modal */
export const Modal = ({ open, title, onClose, children, footer, size = '' }) => {
  // Close on Escape + lock background scrolling while open
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <IconX size={17} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------ Confirm dialog */
export const ConfirmDialog = ({
  open, title = 'Are you sure?', message, confirmLabel = 'Confirm',
  cancelLabel = 'Cancel', onConfirm, onCancel, loading = false, danger = true,
}) => (
  <Modal
    open={open}
    title={title}
    onClose={onCancel}
    size="modal-sm"
    footer={
      <>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <span className="btn-spinner" />}
          {loading ? 'Please wait…' : confirmLabel}
        </button>
      </>
    }
  >
    <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
      {danger && (
        <span className="badge badge-danger" style={{ padding: 9, borderRadius: 10 }}>
          <IconAlert size={18} />
        </span>
      )}
      <p style={{ margin: 0, color: 'var(--text-soft)' }}>{message}</p>
    </div>
  </Modal>
);

/* ------------------------------------------------------------------ Form bits */
export const Field = ({ label, htmlFor, error, hint, children, required }) => (
  <div className="field">
    {label && (
      <label htmlFor={htmlFor}>
        {label} {required && <span style={{ color: 'var(--danger-500)' }}>*</span>}
      </label>
    )}
    {children}
    {error && <span className="err">{error}</span>}
    {!error && hint && <span className="hint">{hint}</span>}
  </div>
);

export const TextInput = ({ id, error, ...props }) => (
  <input id={id} className={`input ${error ? 'invalid' : ''}`} aria-invalid={Boolean(error)} {...props} />
);

export const Select = ({ id, error, children, ...props }) => (
  <select id={id} className={`select ${error ? 'invalid' : ''}`} aria-invalid={Boolean(error)} {...props}>
    {children}
  </select>
);

export const TextArea = ({ id, error, ...props }) => (
  <textarea id={id} className={`textarea ${error ? 'invalid' : ''}`} aria-invalid={Boolean(error)} {...props} />
);

/* ------------------------------------------------------------------ StatCard */
export const StatCard = ({ label, value, icon, accent = 'var(--brand-600)', accentSoft = 'var(--brand-50)', foot, featured = false }) => (
  <article className={`stat-card ${featured ? 'featured' : ''}`} style={featured ? undefined : { '--accent': accent, '--accent-soft': accentSoft }}>
    <div className="stat-top">
      <span className="stat-label">{label}</span>
      {icon && <span className="stat-icon">{icon}</span>}
    </div>
    <div className="stat-value">{value}</div>
    {foot && <div className="stat-foot">{foot}</div>}
  </article>
);

/* ------------------------------------------------------------------ InfoTile */
export const InfoTile = ({ label, value }) => (
  <div className="info-tile">
    <div className="it-label">{label}</div>
    <div className="it-value">{value}</div>
  </div>
);

/* ------------------------------------------------------------------ Tabs */
export const Tabs = ({ tabs, active, onChange }) => (
  <div className="tabs" role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={active === tab.id}
        className={`tab ${active === tab.id ? 'active' : ''}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.icon}
        {tab.label}
        {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
      </button>
    ))}
  </div>
);

/* -------------------------------------------------------------- Pagination */
export const Pagination = ({ page, pages, onChange }) => {
  if (!pages || pages <= 1) return null;
  return (
    <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 22 }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <IconChevronLeft size={15} /> Previous
      </button>
      <span className="text-sm text-muted" style={{ padding: '0 10px' }}>
        Page {page} of {pages}
      </span>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
      >
        Next <IconChevronRight size={15} />
      </button>
    </div>
  );
};

/* ------------------------------------------------------------- Section header */
export const SectionTitle = ({ title, icon, action }) => (
  <div className="section-title">
    <h2>
      {icon}
      {title}
    </h2>
    {action}
  </div>
);
