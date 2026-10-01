import { ResourceTypeBadge } from './ui';
import { IconEdit, IconExternal, IconFileText, IconGlobe, IconStickyNote, IconTrash, IconVideo } from './Icons';
import { timeAgo } from '../utils/format';

const ICONS = {
  PDF: <IconFileText size={19} />,
  Video: <IconVideo size={19} />,
  Article: <IconFileText size={19} />,
  Website: <IconGlobe size={19} />,
  Notes: <IconStickyNote size={19} />,
  Other: <IconFileText size={19} />,
};

/**
 * ResourceCard — a study material shared inside a group.
 */
const ResourceCard = ({ resource, canManage = false, onEdit, onDelete, busy = '' }) => (
  <article className="card card-hover" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 11, height: '100%' }}>
    <header className="row" style={{ alignItems: 'flex-start', gap: 11 }}>
      <span className="li-icon" style={{ width: 40, height: 40 }}>{ICONS[resource.type] || ICONS.Other}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: '0.96rem', margin: '0 0 4px' }} className="clamp-2">{resource.title}</h3>
        <div className="row-wrap" style={{ gap: 6 }}>
          <ResourceTypeBadge type={resource.type} />
          {resource.group?.name && <span className="badge badge-neutral">{resource.group.name}</span>}
        </div>
      </div>
    </header>

    {resource.description && (
      <p className="text-xs text-muted clamp-2" style={{ margin: 0 }}>{resource.description}</p>
    )}

    <p className="text-xs text-faint" style={{ margin: 0 }}>
      Shared by {resource.addedBy?.name || 'a member'} · {timeAgo(resource.createdAt)}
    </p>

    <div className="gc-foot" style={{ gap: 6, flexWrap: 'wrap' }}>
      <a
        href={resource.url}
        target="_blank"
        rel="noreferrer"
        className="btn btn-secondary btn-sm"
      >
        <IconExternal size={14} /> Open
      </a>
      {canManage && (
        <>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit?.(resource)}>
            <IconEdit size={14} /> Edit
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--danger-600)' }}
            disabled={busy === `delete-${resource._id}`}
            onClick={() => onDelete?.(resource)}
          >
            {busy === `delete-${resource._id}` ? <span className="btn-spinner" /> : <IconTrash size={14} />}
            Delete
          </button>
        </>
      )}
    </div>
  </article>
);

export default ResourceCard;
