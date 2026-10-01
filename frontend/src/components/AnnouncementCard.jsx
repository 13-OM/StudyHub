import { Avatar } from './ui';
import { IconEdit, IconMegaphone, IconTrash } from './Icons';
import { timeAgo } from '../utils/format';

/**
 * AnnouncementCard — a notice posted by a group owner.
 */
const AnnouncementCard = ({ announcement, canManage = false, onEdit, onDelete, busy = '' }) => (
  <article className="card" style={{ padding: 20 }}>
    <header className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
      <span className="li-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
        <IconMegaphone size={19} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 3px' }}>{announcement.title}</h3>
        <div className="row-wrap text-xs text-muted" style={{ gap: 8 }}>
          {announcement.group?.name && <span className="badge badge-neutral">{announcement.group.name}</span>}
          <span>{timeAgo(announcement.createdAt)}</span>
        </div>
      </div>
    </header>

    <p className="text-sm text-soft" style={{ margin: '14px 0 14px', whiteSpace: 'pre-wrap' }}>
      {announcement.message}
    </p>

    <footer className="row-between" style={{ paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
      <span className="row text-xs text-muted" style={{ gap: 8 }}>
        <Avatar
          name={announcement.postedBy?.name || 'Owner'}
          color={announcement.postedBy?.avatarColor}
          size="sm"
        />
        Posted by {announcement.postedBy?.name || 'Group owner'}
      </span>
      {canManage && (
        <span className="row" style={{ gap: 4 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit?.(announcement)}>
            <IconEdit size={14} /> Edit
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--danger-600)' }}
            disabled={busy === `delete-${announcement._id}`}
            onClick={() => onDelete?.(announcement)}
          >
            {busy === `delete-${announcement._id}` ? <span className="btn-spinner" /> : <IconTrash size={14} />}
            Delete
          </button>
        </span>
      )}
    </footer>
  </article>
);

export default AnnouncementCard;
