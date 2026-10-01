import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { groupService, sessionService } from '../services';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import SessionCard from '../components/SessionCard';
import AttendanceModal from '../components/AttendanceModal';
import {
  CardSkeletonGrid, ConfirmDialog, EmptyState, LoadingSpinner, Tabs,
} from '../components/ui';
import { IconAlert, IconCalendarCheck, IconCheck, IconLayers, IconPlus, IconX } from '../components/Icons';

/**
 * Sessions — every session across all the groups the student belongs to,
 * grouped by status. Owners can manage their sessions directly from here.
 */
const Sessions = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [busy, setBusy] = useState('');
  const [attendanceSession, setAttendanceSession] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, session: null });
  const [saving, setSaving] = useState(false);

  const { data, loading, error, reload } = useApi(() => sessionService.mine(), []);
  const { data: myGroupData } = useApi(() => groupService.myGroups(), []);

  const all = data?.data?.sessions || [];
  const upcoming = data?.data?.upcoming || [];
  const completed = data?.data?.completed || [];
  const cancelled = data?.data?.cancelled || [];

  // Set of group ids the logged in user owns -> decides whether owner actions are shown
  const ownedGroupIds = useMemo(
    () => new Set((myGroupData?.data?.created || []).map((group) => group._id)),
    [myGroupData]
  );

  const handleStatus = async (session, status) => {
    setBusy(`${status === 'Completed' ? 'complete' : 'cancel'}-${session._id}`);
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

  const handleDelete = async () => {
    setSaving(true);
    try {
      const response = await sessionService.remove(confirm.session._id);
      toast.success(response.message || 'Session deleted successfully');
      setConfirm({ open: false, session: null });
      reload();
    } catch (err) {
      toast.error(err.message || 'Unable to delete the session.');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'upcoming', label: 'Upcoming', icon: <IconCalendarCheck size={15} />, count: upcoming.length },
    { id: 'completed', label: 'Completed', icon: <IconCheck size={15} />, count: completed.length },
    { id: 'cancelled', label: 'Cancelled', icon: <IconX size={15} />, count: cancelled.length },
    { id: 'all', label: 'All sessions', icon: <IconLayers size={15} />, count: all.length },
  ];

  const renderList = (sessions, emptyTitle, emptyMessage) => {
    if (sessions.length === 0) {
      return (
        <div className="card">
          <EmptyState
            icon={<IconCalendarCheck size={24} />}
            title={emptyTitle}
            message={emptyMessage}
            action={<Link to="/my-groups" className="btn btn-secondary btn-sm">Go to my groups</Link>}
          />
        </div>
      );
    }
    return (
      <div className="grid grid-3">
        {sessions.map((session) => (
          <SessionCard
            key={session._id}
            session={session}
            isOwner={ownedGroupIds.has(session.group?._id)}
            busy={busy}
            onEdit={() => navigate(`/groups/${session.group?._id}?tab=sessions`)}
            onStatusChange={handleStatus}
            onAttend={setAttendanceSession}
            onDelete={(item) => setConfirm({ open: true, session: item })}
          />
        ))}
      </div>
    );
  };

  const list = tab === 'upcoming'
    ? upcoming
    : tab === 'completed'
      ? completed
      : tab === 'cancelled'
        ? cancelled
        : all;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Study Sessions</h1>
          <p className="page-subtitle">
            {upcoming.length} upcoming · {completed.length} completed · {cancelled.length} cancelled
          </p>
        </div>
        <Link to="/my-groups" className="btn btn-primary">
          <IconPlus size={16} /> Schedule session
        </Link>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 22 }}>
        <div className="card card-pad">
          <div className="stat-label">Upcoming sessions</div>
          <div className="stat-value" style={{ fontSize: '1.7rem' }}>{upcoming.length}</div>
          <p className="text-xs text-muted" style={{ margin: 0 }}>Planned or in progress</p>
        </div>
        <div className="card card-pad">
          <div className="stat-label">Completed sessions</div>
          <div className="stat-value" style={{ fontSize: '1.7rem' }}>{completed.length}</div>
          <p className="text-xs text-muted" style={{ margin: 0 }}>Sessions you took part in</p>
        </div>
        <div className="card card-pad">
          <div className="stat-label">Total sessions</div>
          <div className="stat-value" style={{ fontSize: '1.7rem' }}>{all.length}</div>
          <p className="text-xs text-muted" style={{ margin: 0 }}>Across all your groups</p>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ marginTop: 22 }}>
        {error ? (
          <div className="alert alert-danger">
            <IconAlert size={18} />
            <span>{error.message}</span>
          </div>
        ) : loading ? (
          <>
            <LoadingSpinner label="Loading sessions…" />
            <CardSkeletonGrid count={3} height={280} />
          </>
        ) : tab === 'upcoming' ? (
          renderList(
            list,
            'No upcoming sessions.',
            'When a group you belong to schedules a session, it will appear here. Group owners can schedule one from My Groups.'
          )
        ) : tab === 'completed' ? (
          renderList(
            list,
            'No completed sessions yet.',
            'Sessions appear here once the group owner marks them as complete.'
          )
        ) : tab === 'cancelled' ? (
          renderList(list, 'No cancelled sessions.', 'Good news — none of your sessions were cancelled.')
        ) : (
          renderList(list, 'No sessions yet.', 'Join a study group to take part in study sessions.')
        )}
      </div>

      <AttendanceModal
        open={Boolean(attendanceSession)}
        session={attendanceSession}
        onClose={() => setAttendanceSession(null)}
        onSaved={reload}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Delete session"
        message={`Delete "${confirm.session?.title}"? Attendance records of this session will also be removed.`}
        confirmLabel="Delete session"
        loading={saving}
        onCancel={() => setConfirm({ open: false, session: null })}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default Sessions;
