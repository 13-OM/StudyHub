import { Link } from 'react-router-dom';
import { StatusBadge } from './ui';
import {
  IconCalendarCheck, IconCheck, IconClock, IconEdit, IconEye, IconTrash, IconVideo, IconX,
} from './Icons';
import { formatDateShort, formatDuration, formatTime, relativeDay } from '../utils/format';

/**
 * SessionCard — one study session.
 * Owners additionally see the Edit / Mark complete / Cancel / Delete actions.
 */
const SessionCard = ({ session, isOwner = false, onEdit, onDelete, onStatusChange, onAttend, busy = '' }) => {
  const date = new Date(session.date);
  const day = date.toLocaleDateString('en-GB', { day: '2-digit' });
  const month = date.toLocaleDateString('en-GB', { month: 'short' });

  return (
    <article className="card card-hover session-card">
      <header className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
        <div className="session-date-chip">
          <span className="d">{day}</span>
          <span className="m">{month}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="gc-title clamp-2" style={{ marginBottom: 4 }}>{session.title}</h3>
          {session.group?.name && (
            <p className="text-xs text-muted" style={{ margin: 0 }}>{session.group.name}</p>
          )}
          <div className="row-wrap" style={{ gap: 8, marginTop: 8 }}>
            <StatusBadge status={session.status} />
            <span className="text-xs text-muted">
              <IconClock size={13} /> {formatTime(session.startTime)} · {formatDuration(session.duration)}
            </span>
          </div>
        </div>
      </header>

      {session.learningObjective && (
        <p className="text-xs text-muted clamp-2" style={{ margin: 0 }}>
          <strong style={{ color: 'var(--text-soft)' }}>Objective: </strong>
          {session.learningObjective}
        </p>
      )}

      {session.agenda?.length > 0 && (
        <ol className="text-xs text-muted" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {session.agenda.slice(0, 3).map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
          {session.agenda.length > 3 && <li>+{session.agenda.length - 3} more agenda points</li>}
        </ol>
      )}

      <div className="row-wrap text-xs text-muted">
        <span>
          <IconCalendarCheck size={13} />{' '}
          {/* "Today"/"Tomorrow" when close, otherwise a short date */}
          {['Today', 'Tomorrow'].includes(relativeDay(session.date))
            ? relativeDay(session.date)
            : formatDateShort(session.date)}
        </span>
        {session.meetingLink && (
          <a href={session.meetingLink} target="_blank" rel="noreferrer" className="row" style={{ gap: 4 }}>
            <IconVideo size={13} /> Join link
          </a>
        )}
      </div>

      <div className="gc-foot" style={{ gap: 6, flexWrap: 'wrap' }}>
        <Link to={`/sessions/${session._id}`} className="btn btn-secondary btn-sm">
          <IconEye size={14} /> View
        </Link>

        {isOwner && (
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit?.(session)}>
              <IconEdit size={14} /> Edit
            </button>

            {session.status !== 'Completed' && session.status !== 'Cancelled' && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onAttend?.(session)}
                title="Mark attendance for this session"
              >
                <IconCheck size={14} /> Attendance
              </button>
            )}

            {session.status !== 'Completed' && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={busy === `complete-${session._id}`}
                onClick={() => onStatusChange?.(session, 'Completed')}
              >
                {busy === `complete-${session._id}` ? <span className="btn-spinner" /> : <IconCheck size={14} />}
                Mark complete
              </button>
            )}

            {session.status === 'Upcoming' && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={busy === `cancel-${session._id}`}
                onClick={() => onStatusChange?.(session, 'Cancelled')}
              >
                {busy === `cancel-${session._id}` ? <span className="btn-spinner" /> : <IconX size={14} />}
                Cancel
              </button>
            )}

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--danger-600)' }}
              disabled={busy === `delete-${session._id}`}
              onClick={() => onDelete?.(session)}
            >
              {busy === `delete-${session._id}` ? <span className="btn-spinner" /> : <IconTrash size={14} />}
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
};

export default SessionCard;
