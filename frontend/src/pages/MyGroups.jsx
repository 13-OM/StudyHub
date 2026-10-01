import { useState } from 'react';
import { Link } from 'react-router-dom';
import { groupService, sessionService } from '../services';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import GroupCard from '../components/GroupCard';
import SessionForm from '../components/SessionForm';
import {
  CardSkeletonGrid, EmptyState, LoadingSpinner, Modal, SectionTitle, StatusBadge, Tabs, Select, Field,
} from '../components/ui';
import {
  IconAlert, IconCalendarCheck, IconClock, IconLayers, IconPlus, IconUsers,
} from '../components/Icons';
import { formatDateShort, formatTime, relativeDay } from '../utils/format';

/**
 * My Groups — groups I created, groups I joined and the status of the
 * join requests I have sent. Owners can also schedule a session from here.
 */
const MyGroups = () => {
  const toast = useToast();
  const [tab, setTab] = useState('created');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, loading, error, reload } = useApi(() => groupService.myGroups(), []);

  const created = data?.data?.created || [];
  const joined = data?.data?.joined || [];
  const pending = data?.data?.pendingRequests || [];

  const handleCreateSession = async (values) => {
    if (!targetGroupId) {
      toast.warning('Please choose a group first.');
      return;
    }
    setSaving(true);
    try {
      const response = await sessionService.create(targetGroupId, values);
      toast.success(response.message || 'Study session scheduled successfully.');
      setScheduleOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message || 'Unable to schedule the session.');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'created', label: 'Groups I created', icon: <IconLayers size={15} />, count: created.length },
    { id: 'joined', label: 'Groups I joined', icon: <IconUsers size={15} />, count: joined.length },
    { id: 'pending', label: 'My requests', icon: <IconClock size={15} />, count: pending.length },
  ];

  const renderGroupList = (groups, emptyTitle, emptyMessage) => {
    if (groups.length === 0) {
      return (
        <div className="card">
          <EmptyState
            icon={<IconUsers size={24} />}
            title={emptyTitle}
            message={emptyMessage}
            action={
              <div className="row" style={{ gap: 10 }}>
                <Link to="/groups" className="btn btn-secondary">Browse groups</Link>
                <Link to="/groups/create" className="btn btn-primary">
                  <IconPlus size={15} /> Create group
                </Link>
              </div>
            }
          />
        </div>
      );
    }

    return (
      <div className="stack" style={{ gap: 14 }}>
        <div className="grid grid-auto">
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} showManage />
          ))}
        </div>

        {/* Upcoming session summary per group */}
        <section className="card card-pad">
          <h3 style={{ fontSize: '0.98rem', marginBottom: 14 }}>Next sessions</h3>
          <div className="stack" style={{ gap: 12 }}>
            {groups.map((group) => (
              <div className="list-item" key={`next-${group._id}`} style={{ padding: '12px 15px' }}>
                <span className="li-icon" style={{ width: 38, height: 38 }}>
                  <IconCalendarCheck size={18} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="li-title truncate">{group.name}</span>
                  <span className="li-sub">
                    {group.nextSession
                      ? `${group.nextSession.title} · ${relativeDay(group.nextSession.date)} at ${formatTime(group.nextSession.startTime)}`
                      : 'No upcoming session scheduled'}
                  </span>
                </span>
                {group.nextSession ? (
                  <span className="badge badge-brand">{formatDateShort(group.nextSession.date)}</span>
                ) : (
                  <span className="badge badge-neutral">Not scheduled</span>
                )}
                <Link to={`/groups/${group._id}?tab=sessions`} className="btn btn-ghost btn-sm">
                  Open group
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">My Groups</h1>
          <p className="page-subtitle">
            Manage the groups you own, open the groups you joined, and follow your join requests.
          </p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          {created.length > 0 && (
            <button type="button" className="btn btn-secondary" onClick={() => setScheduleOpen(true)}>
              <IconCalendarCheck size={16} /> Schedule session
            </button>
          )}
          <Link to="/groups/create" className="btn btn-primary">
            <IconPlus size={16} /> Create group
          </Link>
        </div>
      </div>

      {/* Quick counters */}
      <div className="grid grid-3" style={{ marginBottom: 22 }}>
        <div className="card card-pad">
          <div className="stat-label">Groups I own</div>
          <div className="stat-value" style={{ fontSize: '1.7rem' }}>{created.length}</div>
        </div>
        <div className="card card-pad">
          <div className="stat-label">Groups I joined</div>
          <div className="stat-value" style={{ fontSize: '1.7rem' }}>{joined.length}</div>
        </div>
        <div className="card card-pad">
          <div className="stat-label">Pending requests</div>
          <div className="stat-value" style={{ fontSize: '1.7rem' }}>{pending.length}</div>
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
            <LoadingSpinner label="Loading your groups…" />
            <CardSkeletonGrid count={3} height={300} />
          </>
        ) : tab === 'created' ? (
          renderGroupList(
            created,
            'You have not created any group yet.',
            'Create a group for a subject you are studying and invite your classmates.'
          )
        ) : tab === 'joined' ? (
          renderGroupList(
            joined,
            'You have not joined any group yet.',
            'Browse the open study groups and send a join request to the ones that match your subjects.'
          )
        ) : (
          <>
            <SectionTitle title="Join requests I sent" icon={<IconClock size={17} />} />
            {pending.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={<IconClock size={24} />}
                  title="No pending join requests."
                  message="When you request to join a group, you can follow its status here."
                  action={<Link to="/groups" className="btn btn-primary btn-sm">Find a study group</Link>}
                />
              </div>
            ) : (
              <div className="stack" style={{ gap: 12 }}>
                {pending.map((request) => (
                  <div className="list-item" key={request._id}>
                    <span className="li-icon"><IconUsers size={19} /></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="li-title truncate">{request.group?.name}</span>
                      <span className="li-sub">
                        {request.group?.subject} · {request.group?.topic} · sent on{' '}
                        {formatDateShort(request.createdAt)}
                      </span>
                    </span>
                    <StatusBadge status={request.status} />
                    <Link to={`/groups/${request.group?._id}`} className="btn btn-secondary btn-sm">
                      Open group
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Schedule session modal (choose one of my groups first) */}
      <Modal
        open={scheduleOpen}
        title="Schedule a study session"
        size="modal-lg"
        onClose={() => !saving && setScheduleOpen(false)}
      >
        <Field label="Study group you own" htmlFor="schedule-group" required hint="Sessions can only be scheduled by the group owner.">
          <Select
            id="schedule-group"
            value={targetGroupId}
            onChange={(event) => setTargetGroupId(event.target.value)}
          >
            <option value="">Choose a group…</option>
            {created.map((group) => (
              <option key={group._id} value={group._id}>{group.name}</option>
            ))}
          </Select>
        </Field>

        <div className="divider" />

        {targetGroupId ? (
          <SessionForm
            onSubmit={handleCreateSession}
            submitting={saving}
            submitLabel="Schedule session"
          />
        ) : (
          <p className="text-sm text-muted" style={{ margin: 0 }}>
            Select one of your groups to fill in the session details.
          </p>
        )}
      </Modal>
    </>
  );
};

export default MyGroups;
