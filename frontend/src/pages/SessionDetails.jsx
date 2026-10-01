import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { sessionService } from '../services';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AttendanceModal from '../components/AttendanceModal';
import {
  Avatar, EmptyState, InfoTile, LoadingSpinner, ProgressBar, RoleBadge, SectionTitle, StatusBadge,
} from '../components/ui';
import {
  IconAlert, IconCalendarCheck, IconCheck, IconCheckSquare, IconClock, IconEdit,
  IconInfo, IconTarget, IconUsers, IconVideo, IconX,
} from '../components/Icons';
import { formatDate, formatDuration, formatTime, relativeDay } from '../utils/format';

/**
 * SessionDetails — the full session plan (objective, agenda, topics,
 * expected outcome) plus the attendance table and owner actions.
 */
const SessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [busy, setBusy] = useState('');

  const { data, loading, error, reload } = useApi(() => sessionService.get(id), [id]);

  const session = data?.data?.session;
  const attendance = data?.data?.attendance || [];

  const isOwner = session?.group?.createdBy?.toString() === user?._id?.toString()
    || session?.group?.createdBy === user?._id;

  const handleStatus = async (status) => {
    setBusy(status);
    try {
      await sessionService.update(session._id, { status });
      toast.success(`Session marked as ${status.toLowerCase()}`);
      reload();
    } catch (err) {
      toast.error(err.message || 'Unable to update the session.');
    } finally {
      setBusy('');
    }
  };

  if (loading) return <LoadingSpinner label="Loading session…" />;

  if (error || !session) {
    return (
      <EmptyState
        icon={<IconAlert size={24} />}
        title={error?.status === 403 ? 'Access denied' : 'Session not found'}
        message={
          error?.status === 403
            ? 'You are not a member of this group, so this session is not visible to you.'
            : "This session may have been deleted by the group owner."
        }
        action={<Link to="/sessions" className="btn btn-primary">Back to sessions</Link>}
      />
    );
  }

  const presentRecords = attendance.filter((record) => record.status === 'Present');

  return (
    <>
      <nav className="text-sm text-muted" style={{ marginBottom: 12 }} aria-label="Breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span className="dot-sep" />
        <Link to="/sessions">Sessions</Link>
        <span className="dot-sep" />
        <span style={{ color: 'var(--text)' }}>{session.title}</span>
      </nav>

      <header className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="row-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ minWidth: 0, flex: '1 1 340px' }}>
            <div className="row-wrap" style={{ gap: 8, marginBottom: 10 }}>
              <StatusBadge status={session.status} />
              <span className="badge badge-neutral">
                <IconCalendarCheck size={12} /> {relativeDay(session.date)}
              </span>
              {session.attendanceMarked && (
                <span className="badge badge-success">
                  <IconCheckSquare size={12} /> Attendance marked
                </span>
              )}
            </div>

            <h1 className="page-title" style={{ marginBottom: 6 }}>{session.title}</h1>
            <p className="page-subtitle">
              {session.group?.name} · {formatDate(session.date)} at {formatTime(session.startTime)} ·{' '}
              {formatDuration(session.duration)}
            </p>
          </div>

          <div className="row-wrap" style={{ gap: 9 }}>
            {session.meetingLink && (
              <a href={session.meetingLink} target="_blank" rel="noreferrer" className="btn btn-secondary">
                <IconVideo size={16} /> Join meeting
              </a>
            )}
            {isOwner && session.status !== 'Completed' && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy === 'Completed'}
                onClick={() => handleStatus('Completed')}
              >
                {busy === 'Completed' ? <span className="btn-spinner" /> : <IconCheck size={16} />}
                Mark complete
              </button>
            )}
            {isOwner && session.status === 'Upcoming' && (
              <button
                type="button"
                className="btn btn-danger-soft"
                disabled={busy === 'Cancelled'}
                onClick={() => handleStatus('Cancelled')}
              >
                {busy === 'Cancelled' ? <span className="btn-spinner" /> : <IconX size={16} />}
                Cancel session
              </button>
            )}
            <Link to={`/groups/${session.group?._id}?tab=sessions`} className="btn btn-ghost">
              <IconEdit size={16} /> Manage in group
            </Link>
          </div>
        </div>
      </header>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}>
        {/* ------------------------- Session plan ------------------------- */}
        <section className="card card-pad">
          <h2 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconTarget size={18} /> Session plan
          </h2>

          {session.learningObjective && (
            <div style={{ marginBottom: 18 }}>
              <div className="it-label">Learning objective</div>
              <p className="text-soft" style={{ margin: 0 }}>{session.learningObjective}</p>
            </div>
          )}

          <div className="it-label">Agenda</div>
          {session.agenda?.length ? (
            <ol style={{ paddingLeft: 20, margin: '8px 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {session.agenda.map((item, index) => (
                <li key={`${item}-${index}`} className="text-soft">{item}</li>
              ))}
            </ol>
          ) : (
            <p className="text-muted text-sm" style={{ margin: '8px 0 18px' }}>
              No agenda has been added for this session.
            </p>
          )}

          <div className="it-label">Topics</div>
          <div className="row-wrap" style={{ gap: 7, margin: '8px 0 18px' }}>
            {session.topics?.length ? (
              session.topics.map((topic) => (
                <span key={topic} className="badge badge-brand">{topic}</span>
              ))
            ) : (
              <span className="text-sm text-muted">No topics listed</span>
            )}
          </div>

          {session.expectedOutcome && (
            <>
              <div className="it-label">Expected outcome</div>
              <p className="text-soft" style={{ margin: '8px 0 0' }}>{session.expectedOutcome}</p>
            </>
          )}

          {session.notes && (
            <>
              <div className="divider" />
              <div className="alert alert-info">
                <IconInfo size={17} />
                <span>{session.notes}</span>
              </div>
            </>
          )}
        </section>

        {/* ----------------------- Attendance & details ------------------- */}
        <aside className="stack" style={{ gap: 16 }}>
          <div className="card card-pad">
            <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>Details</h3>
            <div className="stack" style={{ gap: 10 }}>
              <InfoTile label="Date" value={formatDate(session.date)} />
              <InfoTile label="Start time" value={formatTime(session.startTime)} />
              <InfoTile label="Duration" value={formatDuration(session.duration)} />
              <InfoTile label="Group" value={session.group?.name || '—'} />
              <InfoTile label="Meeting link" value={session.meetingLink ? 'Available' : 'Not provided'} />
            </div>
          </div>

          <div className="card card-pad">
            <div className="row-between" style={{ marginBottom: 12 }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Attendance</h3>
              {isOwner && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAttendanceOpen(true)}>
                  <IconEdit size={14} /> {attendance.length ? 'Update' : 'Mark'}
                </button>
              )}
            </div>

            {attendance.length === 0 ? (
              <p className="text-sm text-muted" style={{ margin: 0 }}>
                Attendance has not been marked for this session yet.
              </p>
            ) : (
              <>
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <span className="text-sm text-muted">
                    {presentRecords.length}/{attendance.length} present
                  </span>
                  <span className="badge badge-success">
                    {Math.round((presentRecords.length / attendance.length) * 100)}%
                  </span>
                </div>
                <ProgressBar value={(presentRecords.length / attendance.length) * 100} variant="success" />

                <div className="stack" style={{ gap: 10, marginTop: 14 }}>
                  {attendance.map((record) => (
                    <div className="row" key={record._id} style={{ gap: 10 }}>
                      <Avatar name={record.user?.name} color={record.user?.avatarColor} size="sm" />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="li-title truncate" style={{ fontSize: '0.84rem' }}>
                          {record.user?.name}
                        </span>
                      </span>
                      <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Members involved</h3>
            <SectionTitle title="" />
            <div className="row-wrap" style={{ gap: 8 }}>
              <span className="badge badge-neutral">
                <IconUsers size={12} /> {session.group?.members?.length || 0} members
              </span>
              <span className="badge badge-neutral">
                <IconClock size={12} /> {session.updatedAt ? 'Updated recently' : 'New'}
              </span>
              <RoleBadge role={isOwner ? 'Owner' : 'Member'} />
            </div>
          </div>
        </aside>
      </div>

      <AttendanceModal
        open={attendanceOpen}
        session={session}
        onClose={() => setAttendanceOpen(false)}
        onSaved={reload}
      />

      <div className="row" style={{ marginTop: 22, gap: 10 }}>
        <Link to="/sessions" className="btn btn-secondary">← Back to all sessions</Link>
        <Link to={`/groups/${session.group?._id}?tab=sessions`} className="btn btn-ghost">
          View all sessions of {session.group?.name}
        </Link>
      </div>
    </>
  );
};

export default SessionDetails;
