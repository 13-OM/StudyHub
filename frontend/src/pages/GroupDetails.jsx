import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  announcementService, groupService, requestService, resourceService, sessionService,
} from '../services';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

import GroupForm from '../components/GroupForm';
import SessionForm, { sessionToForm } from '../components/SessionForm';
import ResourceForm from '../components/ResourceForm';
import AnnouncementForm from '../components/AnnouncementForm';
import AttendanceModal from '../components/AttendanceModal';
import SessionCard from '../components/SessionCard';
import ResourceCard from '../components/ResourceCard';
import AnnouncementCard from '../components/AnnouncementCard';
import {
  Avatar, ConfirmDialog, EmptyState, Field, InfoTile, LoadingSpinner, Modal,
  ProgressBar, RoleBadge, SectionTitle, SkillBadge, StatusBadge, Tabs, TextArea,
} from '../components/ui';
import {
  IconAlert, IconBook, IconCalendarCheck, IconCalendarCheck as IconSessions,
  IconCheck, IconCheckSquare, IconClock, IconEdit, IconInfo, IconLayers,
  IconMegaphone, IconPlus, IconTrash, IconUsers, IconX,
} from '../components/Icons';
import { formatDate, formatDateShort, formatDuration, percent } from '../utils/format';

/**
 * GroupDetails — the dashboard of a single study group with seven tabs:
 * Overview · Members · Sessions · Resources · Announcements · Attendance · History
 */
const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState(searchParams.get('tab') || 'overview');
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Tab data
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [resources, setResources] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);

  // UI state
  const [busy, setBusy] = useState('');
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [sessionModal, setSessionModal] = useState({ open: false, session: null });
  const [resourceModal, setResourceModal] = useState({ open: false, resource: null });
  const [announcementModal, setAnnouncementModal] = useState({ open: false, item: null });
  const [attendanceSession, setAttendanceSession] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, type: '', payload: null, message: '' });
  const [saving, setSaving] = useState(false);

  const isOwner = group?.viewer?.isOwner;
  const isMember = group?.viewer?.isMember || isOwner;

  /* ------------------------------- loaders ------------------------------- */
  const loadGroup = useCallback(async () => {
    try {
      const response = await groupService.get(id);
      const found = response.data?.group;
      // Guard against a payload without a group (e.g. an id that matches
      // another API route) so the page shows "not found" instead of crashing.
      if (!found) {
        setPageError({ status: 404, message: 'Study group not found' });
        return;
      }
      setGroup(found);
      setPageError(null);
    } catch (error) {
      setPageError(error);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    loadGroup().finally(() => setLoading(false));
  }, [loadGroup]);

  // Load the data of the active tab on demand
  useEffect(() => {
    if (!group) return undefined;
    let active = true;
    setTabLoading(true);

    const loaders = {
      members: async () => {
        const [memberRes] = await Promise.all([
          groupService.members(id),
        ]);
        if (!active) return;
        setMembers(memberRes.data.members);
        if (group.viewer.isOwner) {
          const reqRes = await requestService.forGroup(id);
          if (active) setRequests(reqRes.data.requests);
        }
      },
      sessions: async () => {
        const response = await sessionService.forGroup(id);
        if (active) setSessions(response.data.sessions);
      },
      history: async () => {
        const response = await sessionService.forGroup(id);
        if (active) setSessions(response.data.sessions);
      },
      resources: async () => {
        const response = await resourceService.forGroup(id);
        if (active) setResources(response.data.resources);
      },
      announcements: async () => {
        const response = await announcementService.forGroup(id);
        if (active) setAnnouncements(response.data.announcements);
      },
      attendance: async () => {
        const response = await groupService.attendance(id);
        if (active) setAttendance(response.data);
      },
    };

    const run = loaders[tab];
    if (!run || !isMember) {
      setTabLoading(false);
      return undefined;
    }

    run()
      .catch((error) => {
        if (active) toast.error(error.message || 'Unable to load this section.');
      })
      .finally(() => active && setTabLoading(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, group?._id, isMember, id]);

  useEffect(() => {
    setSearchParams(tab === 'overview' ? {} : { tab }, { replace: true });
  }, [tab, setSearchParams]);

  /* ------------------------------ join flow ------------------------------ */
  const handleJoin = async () => {
    setBusy('join');
    try {
      const response = await requestService.create(group._id, joinMessage.trim());
      toast.success(response.message || 'Join request sent successfully.');
      setJoinOpen(false);
      setJoinMessage('');
      await loadGroup();
    } catch (error) {
      toast.error(error.message || 'Unable to send the join request.');
    } finally {
      setBusy('');
    }
  };

  /* --------------------------- owner operations --------------------------- */
  const handleSaveGroup = async (values) => {
    setSaving(true);
    try {
      const response = await groupService.update(group._id, values);
      setGroup(response.data.group);
      toast.success('Group updated successfully');
      setEditOpen(false);
    } catch (error) {
      toast.error(error.message || 'Unable to update the group.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    setSaving(true);
    try {
      const response = await groupService.remove(group._id);
      toast.success(response.message || 'Study group deleted successfully');
      navigate('/my-groups');
    } catch (error) {
      toast.error(error.message || 'Unable to delete the group.');
      setSaving(false);
    }
  };

  const handleRequest = async (requestId, action) => {
    setBusy(`${action}-${requestId}`);
    try {
      const response = action === 'approve'
        ? await requestService.approve(requestId)
        : await requestService.reject(requestId);
      toast.success(response.message || 'Request updated');
      const [reqRes, groupRes] = await Promise.all([
        requestService.forGroup(id),
        groupService.get(id),
      ]);
      setRequests(reqRes.data.requests);
      setGroup(groupRes.data.group);
      if (tab === 'members') {
        const memberRes = await groupService.members(id);
        setMembers(memberRes.data.members);
      }
    } catch (error) {
      toast.error(error.message || 'Unable to update the request.');
    } finally {
      setBusy('');
    }
  };

  const handleRemoveMember = async () => {
    const userId = confirm.payload;
    setSaving(true);
    try {
      const response = await groupService.removeMember(group._id, userId);
      toast.success(response.message || 'Member removed from the group');
      setMembers((current) => current.filter((member) => member.user._id !== userId));
      await loadGroup();
    } catch (error) {
      toast.error(error.message || 'Unable to remove this member.');
    } finally {
      setSaving(false);
      setConfirm({ open: false, type: '', payload: null, message: '' });
    }
  };

  /* ------------------------------- sessions ------------------------------ */
  const handleSaveSession = async (values) => {
    setSaving(true);
    try {
      if (sessionModal.session) {
        const response = await sessionService.update(sessionModal.session._id, values);
        setSessions((current) =>
          current.map((item) => (item._id === response.data.session._id ? response.data.session : item))
        );
        toast.success('Session updated successfully');
      } else {
        const response = await sessionService.create(group._id, values);
        setSessions((current) => [response.data.session, ...current]);
        toast.success('Study session scheduled successfully.');
      }
      setSessionModal({ open: false, session: null });
    } catch (error) {
      toast.error(error.message || 'Unable to save the session.');
    } finally {
      setSaving(false);
    }
  };

  const handleSessionStatus = async (session, status) => {
    setBusy(`${status === 'Completed' ? 'complete' : 'cancel'}-${session._id}`);
    try {
      const response = await sessionService.update(session._id, { status });
      setSessions((current) =>
        current.map((item) => (item._id === session._id ? response.data.session : item))
      );
      toast.success(`Session marked as ${status.toLowerCase()}`);
    } catch (error) {
      toast.error(error.message || 'Unable to update the session.');
    } finally {
      setBusy('');
    }
  };

  const handleDeleteSession = async () => {
    const session = confirm.payload;
    setSaving(true);
    try {
      const response = await sessionService.remove(session._id);
      setSessions((current) => current.filter((item) => item._id !== session._id));
      toast.success(response.message || 'Session deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Unable to delete the session.');
    } finally {
      setSaving(false);
      setConfirm({ open: false, type: '', payload: null, message: '' });
    }
  };

  /* ------------------------------- resources ----------------------------- */
  const handleSaveResource = async (values) => {
    setSaving(true);
    try {
      if (resourceModal.resource) {
        const response = await resourceService.update(resourceModal.resource._id, values);
        setResources((current) =>
          current.map((item) =>
            item._id === response.data.resource._id ? response.data.resource : item)
        );
        toast.success('Resource updated successfully');
      } else {
        const response = await resourceService.create(group._id, values);
        setResources((current) => [response.data.resource, ...current]);
        toast.success('Resource shared successfully.');
      }
      setResourceModal({ open: false, resource: null });
    } catch (error) {
      toast.error(error.message || 'Unable to save the resource.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResource = async () => {
    const resource = confirm.payload;
    setBusy(`delete-${resource._id}`);
    try {
      await resourceService.remove(resource._id);
      setResources((current) => current.filter((item) => item._id !== resource._id));
      toast.success('Resource deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Unable to delete the resource.');
    } finally {
      setBusy('');
      setConfirm({ open: false, type: '', payload: null, message: '' });
    }
  };

  /* ----------------------------- announcements --------------------------- */
  const handleSaveAnnouncement = async (values) => {
    setSaving(true);
    try {
      if (announcementModal.item) {
        const response = await announcementService.update(announcementModal.item._id, values);
        setAnnouncements((current) =>
          current.map((item) =>
            item._id === response.data.announcement._id ? response.data.announcement : item)
          );
        toast.success('Announcement updated successfully');
      } else {
        const response = await announcementService.create(group._id, values);
        setAnnouncements((current) => [response.data.announcement, ...current]);
        toast.success('Announcement posted successfully.');
      }
      setAnnouncementModal({ open: false, item: null });
    } catch (error) {
      toast.error(error.message || 'Unable to save the announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    const announcement = confirm.payload;
    setBusy(`delete-${announcement._id}`);
    try {
      await announcementService.remove(announcement._id);
      setAnnouncements((current) => current.filter((item) => item._id !== announcement._id));
      toast.success('Announcement deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Unable to delete the announcement.');
    } finally {
      setBusy('');
      setConfirm({ open: false, type: '', payload: null, message: '' });
    }
  };

  /* -------------------------------- render ------------------------------- */
  const pendingRequests = useMemo(() => requests.filter((r) => r.status === 'Pending'), [requests]);
  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === 'Completed' || s.status === 'Cancelled'),
    [sessions]
  );
  const activeSessions = useMemo(
    () => sessions.filter((s) => s.status === 'Upcoming' || s.status === 'In Progress'),
    [sessions]
  );

  if (loading) return <LoadingSpinner label="Loading study group…" />;

  if (pageError || !group) {
    return (
      <EmptyState
        icon={<IconAlert size={24} />}
        title={pageError?.status === 404 || !group ? 'Study group not found' : 'Something went wrong'}
        message={
          pageError?.status === 404 || !group
            ? 'This group may have been deleted by its owner, or the link is not valid.'
            : pageError?.message
        }
        action={<Link to="/groups" className="btn btn-primary">Back to browse groups</Link>}
      />
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <IconInfo size={15} /> },
    { id: 'members', label: 'Members', icon: <IconUsers size={15} />, count: group.memberCount },
    { id: 'sessions', label: 'Sessions', icon: <IconSessions size={15} /> },
    { id: 'resources', label: 'Resources', icon: <IconBook size={15} /> },
    { id: 'announcements', label: 'Announcements', icon: <IconMegaphone size={15} /> },
    { id: 'attendance', label: 'Attendance', icon: <IconCheckSquare size={15} /> },
    { id: 'history', label: 'History', icon: <IconLayers size={15} /> },
  ];

  return (
    <>
      {/* ------------------------------- header ------------------------------ */}
      <nav className="text-sm text-muted" style={{ marginBottom: 12 }} aria-label="Breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span className="dot-sep" />
        <Link to="/groups">Study groups</Link>
        <span className="dot-sep" />
        <span style={{ color: 'var(--text)' }}>{group.name}</span>
      </nav>

      <header className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div className="row-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ minWidth: 0, flex: '1 1 380px' }}>
            <div className="row-wrap" style={{ gap: 9, marginBottom: 9 }}>
              <StatusBadge status={group.status || 'Active'} />
              <SkillBadge level={group.skillLevel} />
              <span className="badge badge-neutral">{group.course}</span>
              {group.isFull && <span className="badge badge-danger">Group full</span>}
            </div>

            <h1 className="page-title" style={{ marginBottom: 6 }}>{group.name}</h1>
            <p className="page-subtitle" style={{ marginBottom: 12 }}>
              {group.subject} · {group.topic}
            </p>

            <div className="row-wrap" style={{ gap: 16, fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              <span className="row" style={{ gap: 6 }}>
                <IconClock size={14} /> Every {group.schedule?.day}, {group.schedule?.time}
              </span>
              <span className="row" style={{ gap: 6 }}>
                <IconUsers size={14} /> {group.memberCount}/{group.maxCapacity} members
              </span>
              <span className="row" style={{ gap: 6 }}>
                <Avatar name={group.createdBy?.name} color={group.createdBy?.avatarColor} size="sm" />
                Created by {group.createdBy?.name}
              </span>
            </div>
          </div>

          <div className="row-wrap" style={{ gap: 9 }}>
            {isOwner && (
              <>
                <button type="button" className="btn btn-secondary" onClick={() => setEditOpen(true)}>
                  <IconEdit size={15} /> Edit group
                </button>
                <button
                  type="button"
                  className="btn btn-danger-soft"
                  onClick={() =>
                    setConfirm({
                      open: true,
                      type: 'delete-group',
                      payload: group,
                      message:
                        'Deleting this group also removes its sessions, resources, announcements and attendance records. This cannot be undone.',
                    })
                  }
                >
                  <IconTrash size={15} /> Delete
                </button>
              </>
            )}

            {!isMember && !group.viewer.requestStatus && !group.isFull && (
              <button type="button" className="btn btn-primary" onClick={() => setJoinOpen(true)}>
                <IconPlus size={16} /> Request to join
              </button>
            )}
            {!isMember && group.viewer.requestStatus === 'Pending' && (
              <button type="button" className="btn btn-secondary" disabled>
                <IconClock size={15} /> Request pending
              </button>
            )}
            {!isMember && group.isFull && !group.viewer.requestStatus && (
              <button type="button" className="btn btn-secondary" disabled>
                Group full ({group.memberCount}/{group.maxCapacity})
              </button>
            )}
            {group.viewer.requestStatus === 'Rejected' && !isMember && (
              <button type="button" className="btn btn-secondary" onClick={() => setJoinOpen(true)}>
                Request again
              </button>
            )}
          </div>
        </div>

        {!isMember && group.viewer.requestStatus === 'Pending' && (
          <div className="alert alert-warning" style={{ marginTop: 18 }}>
            <IconClock size={17} />
            <span>
              Your join request is pending. The group owner ({group.createdBy?.name}) has to approve
              it before you can see sessions, resources and announcements.
            </span>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <div className="row-between" style={{ marginBottom: 6 }}>
            <span className="text-xs text-muted">Group capacity</span>
            <span className="text-xs font-semibold">
              {group.seatsLeft} seat(s) available of {group.maxCapacity}
            </span>
          </div>
          <ProgressBar
            value={percent(group.memberCount, group.maxCapacity)}
            variant={group.isFull ? 'danger' : 'success'}
          />
        </div>
      </header>

      {/* -------------------------------- tabs ------------------------------- */}
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ marginTop: 22 }}>
        {/* ------------------------------ OVERVIEW ---------------------------- */}
        {tab === 'overview' && (
          <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}>
            <section className="card card-pad">
              <h2 style={{ fontSize: '1.05rem' }}>About this group</h2>
              <p className="text-soft" style={{ whiteSpace: 'pre-wrap' }}>{group.description}</p>

              <div className="divider" />

              <h3 style={{ fontSize: '0.95rem' }}>Weekly schedule</h3>
              <div className="row-wrap" style={{ gap: 10 }}>
                <span className="badge badge-brand">
                  <IconClock size={12} /> {group.schedule?.day}s · {group.schedule?.time}
                </span>
                <span className="text-sm text-muted">Regular weekly study session</span>
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 20 }}>
                <InfoTile label="Subject" value={group.subject} />
                <InfoTile label="Topic" value={group.topic} />
                <InfoTile label="Course" value={group.course} />
                <InfoTile label="Skill level" value={group.skillLevel} />
                <InfoTile label="Capacity" value={`${group.memberCount} / ${group.maxCapacity}`} />
                <InfoTile label="Created on" value={formatDate(group.createdAt)} />
              </div>
            </section>

            <aside className="stack" style={{ gap: 16 }}>
              <div className="card card-pad">
                <h3 style={{ fontSize: '0.98rem', marginBottom: 12 }}>Members ({group.memberCount})</h3>
                <div className="stack" style={{ gap: 10 }}>
                  {group.members.slice(0, 5).map((member) => (
                    <div className="row" key={member.user?._id} style={{ gap: 10 }}>
                      <Avatar name={member.user?.name} color={member.user?.avatarColor} size="md" />
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span className="li-title truncate">{member.user?.name}</span>
                        <span className="li-sub">{member.user?.course}</span>
                      </span>
                      <RoleBadge role={member.role} />
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-secondary btn-block btn-sm" style={{ marginTop: 14 }} onClick={() => setTab('members')}>
                  View all members
                </button>
              </div>

              <div className="card card-pad">
                <h3 style={{ fontSize: '0.98rem', marginBottom: 12 }}>Quick facts</h3>
                <div className="stack" style={{ gap: 10 }}>
                  <div className="row-between">
                    <span className="text-sm text-muted">Seats left</span>
                    <strong>{group.seatsLeft}</strong>
                  </div>
                  <div className="row-between">
                    <span className="text-sm text-muted">Group status</span>
                    <StatusBadge status={group.status || 'Active'} />
                  </div>
                  <div className="row-between">
                    <span className="text-sm text-muted">Your role</span>
                    <RoleBadge role={isOwner ? 'Owner' : isMember ? 'Member' : 'Visitor'} />
                  </div>
                </div>
              </div>

              {isMember && (
                <div className="alert alert-info">
                  <IconInfo size={17} />
                  <span>
                    Use the <strong>Sessions</strong> tab to see the agenda of every meeting, and{' '}
                    <strong>Resources</strong> to share study material with the group.
                  </span>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ------------------------------ MEMBERS ----------------------------- */}
        {tab === 'members' && (
          <>
            {!isMember ? (
              <div className="card">
                <EmptyState
                  icon={<IconUsers size={24} />}
                  title="Members are visible to group members only"
                  message="Send a join request to see the member list of this group."
                />
              </div>
            ) : tabLoading ? (
              <LoadingSpinner label="Loading members…" />
            ) : (
              <>
                {isOwner && (
                  <>
                    <SectionTitle
                      title={`Join requests (${pendingRequests.length} pending)`}
                      icon={<IconPlus size={17} />}
                    />
                    {requests.length === 0 ? (
                      <div className="card">
                        <EmptyState
                          icon={<IconUsers size={22} />}
                          title="No join requests yet."
                          message="When a student asks to join, the request will appear here for approval."
                        />
                      </div>
                    ) : (
                      <div className="stack" style={{ gap: 12, marginBottom: 10 }}>
                        {requests.map((request) => (
                          <div className="list-item" key={request._id} style={{ flexWrap: 'wrap' }}>
                            <Avatar name={request.user?.name} color={request.user?.avatarColor} size="lg" />
                            <span style={{ flex: 1, minWidth: 200 }}>
                              <span className="li-title">{request.user?.name}</span>
                              <span className="li-sub">
                                {request.user?.course} · {request.user?.skillLevel} · requested{' '}
                                {formatDateShort(request.createdAt)}
                              </span>
                              {request.message && (
                                <span className="text-xs text-muted" style={{ display: 'block', marginTop: 6, fontStyle: 'italic' }}>
                                  &ldquo;{request.message}&rdquo;
                                </span>
                              )}
                            </span>
                            <StatusBadge status={request.status} />
                            {request.status === 'Pending' && (
                              <span className="row" style={{ gap: 8 }}>
                                <button
                                  type="button"
                                  className="btn btn-success btn-sm"
                                  disabled={busy === `approve-${request._id}`}
                                  onClick={() => handleRequest(request._id, 'approve')}
                                >
                                  {busy === `approve-${request._id}` ? <span className="btn-spinner" /> : <IconCheck size={14} />}
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger-soft btn-sm"
                                  disabled={busy === `reject-${request._id}`}
                                  onClick={() => handleRequest(request._id, 'reject')}
                                >
                                  {busy === `reject-${request._id}` ? <span className="btn-spinner" /> : <IconX size={14} />}
                                  Reject
                                </button>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ height: 20 }} />
                  </>
                )}

                <SectionTitle title={`Group members (${members.length})`} icon={<IconUsers size={17} />} />

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Skill level</th>
                        <th>Role</th>
                        <th>Joined</th>
                        {isOwner && <th style={{ textAlign: 'right' }}>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.user?._id}>
                          <td>
                            <span className="row" style={{ gap: 10 }}>
                              <Avatar name={member.user?.name} color={member.user?.avatarColor} size="md" />
                              <span>
                                <span className="font-semibold" style={{ display: 'block' }}>
                                  {member.user?.name}
                                  {member.user?._id === user?._id && (
                                    <span className="text-xs text-faint"> (you)</span>
                                  )}
                                </span>
                                <span className="text-xs text-muted">{member.user?.email}</span>
                              </span>
                            </span>
                          </td>
                          <td className="text-sm">{member.user?.course}</td>
                          <td><SkillBadge level={member.user?.skillLevel} /></td>
                          <td><RoleBadge role={member.role} /></td>
                          <td className="text-sm text-muted">{formatDate(member.joinedAt)}</td>
                          {isOwner && (
                            <td style={{ textAlign: 'right' }}>
                              {member.role === 'Owner' ? (
                                <span className="text-xs text-faint">Owner cannot be removed</span>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-danger-soft btn-sm"
                                  onClick={() =>
                                    setConfirm({
                                      open: true,
                                      type: 'remove-member',
                                      payload: member.user._id,
                                      message: `Are you sure you want to remove ${member.user?.name} from "${group.name}"? They can request to join again later.`,
                                    })
                                  }
                                >
                                  <IconTrash size={14} /> Remove
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {/* ------------------------------ SESSIONS ---------------------------- */}
        {tab === 'sessions' && (
          <>
            {!isMember ? (
              <div className="card">
                <EmptyState
                  icon={<IconCalendarCheck size={24} />}
                  title="Sessions are visible to group members only"
                  message="Join this group to see upcoming sessions, agendas and attendance."
                />
              </div>
            ) : (
              <>
                <SectionTitle
                  title={`Scheduled sessions (${activeSessions.length})`}
                  icon={<IconCalendarCheck size={17} />}
                  action={
                    isOwner ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setSessionModal({ open: true, session: null })}
                      >
                        <IconPlus size={15} /> Schedule session
                      </button>
                    ) : null
                  }
                />

                {tabLoading ? (
                  <LoadingSpinner label="Loading sessions…" />
                ) : activeSessions.length === 0 ? (
                  <div className="card">
                    <EmptyState
                      icon={<IconCalendarCheck size={24} />}
                      title="No upcoming sessions."
                      message={
                        isOwner
                          ? 'Schedule your first session with an agenda so members know what to prepare.'
                          : 'The group owner has not scheduled a session yet.'
                      }
                      action={
                        isOwner ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setSessionModal({ open: true, session: null })}
                          >
                            <IconPlus size={15} /> Schedule session
                          </button>
                        ) : null
                      }
                    />
                  </div>
                ) : (
                  <div className="grid grid-3">
                    {activeSessions.map((session) => (
                      <SessionCard
                        key={session._id}
                        session={{ ...session, group: { name: group.name } }}
                        isOwner={isOwner}
                        busy={busy}
                        onEdit={(item) => setSessionModal({ open: true, session: item })}
                        onStatusChange={handleSessionStatus}
                        onAttend={setAttendanceSession}
                        onDelete={(item) =>
                          setConfirm({
                            open: true,
                            type: 'delete-session',
                            payload: item,
                            message: `Delete the session "${item.title}"? Its attendance records will also be removed.`,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ------------------------------ RESOURCES --------------------------- */}
        {tab === 'resources' && (
          <>
            {!isMember ? (
              <div className="card">
                <EmptyState
                  icon={<IconBook size={24} />}
                  title="Resources are visible to group members only"
                  message="Request to join the group to access the shared study material."
                />
              </div>
            ) : (
              <>
                <SectionTitle
                  title={`Shared resources (${resources.length})`}
                  icon={<IconBook size={17} />}
                  action={
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setResourceModal({ open: true, resource: null })}
                    >
                      <IconPlus size={15} /> Add resource
                    </button>
                  }
                />

                {tabLoading ? (
                  <LoadingSpinner label="Loading resources…" />
                ) : resources.length === 0 ? (
                  <div className="card">
                    <EmptyState
                      icon={<IconBook size={24} />}
                      title="No resources have been shared yet."
                      message="Share notes, videos or useful links so the whole group can study from the same material."
                      action={
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setResourceModal({ open: true, resource: null })}
                        >
                          <IconPlus size={15} /> Share the first resource
                        </button>
                      }
                    />
                  </div>
                ) : (
                  <div className="grid grid-3">
                    {resources.map((resource) => (
                      <ResourceCard
                        key={resource._id}
                        resource={resource}
                        canManage={isOwner || resource.addedBy?._id === user?._id}
                        busy={busy}
                        onEdit={(item) => setResourceModal({ open: true, resource: item })}
                        onDelete={(item) =>
                          setConfirm({
                            open: true,
                            type: 'delete-resource',
                            payload: item,
                            message: `Delete "${item.title}" from the shared resources?`,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ---------------------------- ANNOUNCEMENTS ------------------------- */}
        {tab === 'announcements' && (
          <>
            {!isMember ? (
              <div className="card">
                <EmptyState
                  icon={<IconMegaphone size={24} />}
                  title="Announcements are visible to group members only"
                  message="Join the group to read the announcements posted by the owner."
                />
              </div>
            ) : (
              <>
                <SectionTitle
                  title={`Announcements (${announcements.length})`}
                  icon={<IconMegaphone size={17} />}
                  action={
                    isOwner ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setAnnouncementModal({ open: true, item: null })}
                      >
                        <IconPlus size={15} /> Post announcement
                      </button>
                    ) : null
                  }
                />

                {tabLoading ? (
                  <LoadingSpinner label="Loading announcements…" />
                ) : announcements.length === 0 ? (
                  <div className="card">
                    <EmptyState
                      icon={<IconMegaphone size={24} />}
                      title="No announcements yet."
                      message={
                        isOwner
                          ? 'Post an announcement to inform members about schedule changes or important updates.'
                          : 'The group owner has not posted any announcement yet.'
                      }
                      action={
                        isOwner ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => setAnnouncementModal({ open: true, item: null })}
                          >
                            <IconPlus size={15} /> Post announcement
                          </button>
                        ) : null
                      }
                    />
                  </div>
                ) : (
                  <div className="stack" style={{ gap: 14 }}>
                    {announcements.map((announcement) => (
                      <AnnouncementCard
                        key={announcement._id}
                        announcement={announcement}
                        canManage={isOwner}
                        busy={busy}
                        onEdit={(item) => setAnnouncementModal({ open: true, item })}
                        onDelete={(item) =>
                          setConfirm({
                            open: true,
                            type: 'delete-announcement',
                            payload: item,
                            message: `Delete the announcement "${item.title}"?`,
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ----------------------------- ATTENDANCE --------------------------- */}
        {tab === 'attendance' && (
          <>
            {!isMember ? (
              <div className="card">
                <EmptyState
                  icon={<IconCheckSquare size={24} />}
                  title="Attendance is visible to group members only"
                  message="Join the group to view your attendance record."
                />
              </div>
            ) : tabLoading ? (
              <LoadingSpinner label="Calculating attendance…" />
            ) : !attendance || attendance.members.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={<IconCheckSquare size={24} />}
                  title="No attendance records yet."
                  message="Attendance appears once the owner marks a session."
                />
              </div>
            ) : (
              <>
                <div className="grid grid-3" style={{ marginBottom: 20 }}>
                  <div className="card card-pad">
                    <div className="stat-label">Group attendance rate</div>
                    <div className="stat-value" style={{ fontSize: '1.6rem' }}>
                      {attendance.overall.attendanceRate}%
                    </div>
                    <ProgressBar
                      value={attendance.overall.attendanceRate}
                      variant={attendance.overall.attendanceRate >= 75 ? 'success' : 'warning'}
                    />
                  </div>
                  <div className="card card-pad">
                    <div className="stat-label">Completed sessions</div>
                    <div className="stat-value" style={{ fontSize: '1.6rem' }}>
                      {attendance.overall.completedSessions}
                    </div>
                    <p className="text-xs text-muted" style={{ margin: 0 }}>
                      Sessions that have been finished by this group
                    </p>
                  </div>
                  <div className="card card-pad">
                    <div className="stat-label">Records marked</div>
                    <div className="stat-value" style={{ fontSize: '1.6rem' }}>
                      {attendance.overall.markedRecords}
                    </div>
                    <p className="text-xs text-muted" style={{ margin: 0 }}>
                      {attendance.overall.presentRecords} present entries
                    </p>
                  </div>
                </div>

                <SectionTitle title="Member attendance" icon={<IconUsers size={17} />} />

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Role</th>
                        <th>Attended</th>
                        <th>Missed</th>
                        <th style={{ minWidth: 180 }}>Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.members.map((row) => (
                        <tr key={row.user?._id}>
                          <td>
                            <span className="row" style={{ gap: 10 }}>
                              <Avatar name={row.user?.name} color={row.user?.avatarColor} size="md" />
                              <span>
                                <span className="font-semibold" style={{ display: 'block' }}>
                                  {row.user?.name}
                                  {row.user?._id === user?._id && (
                                    <span className="text-xs text-faint"> (you)</span>
                                  )}
                                </span>
                                <span className="text-xs text-muted">{row.user?.course}</span>
                              </span>
                            </span>
                          </td>
                          <td><RoleBadge role={row.role} /></td>
                          <td className="font-semibold">{row.sessionsAttended}</td>
                          <td>{row.sessionsMissed}</td>
                          <td>
                            <div className="row" style={{ gap: 10 }}>
                              <ProgressBar
                                value={row.attendanceRate}
                                variant={row.attendanceRate >= 75 ? 'success' : row.attendanceRate >= 50 ? 'warning' : 'danger'}
                              />
                              <span className="text-sm font-semibold mono">{row.attendanceRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {/* ------------------------------- HISTORY ---------------------------- */}
        {tab === 'history' && (
          <>
            {!isMember ? (
              <div className="card">
                <EmptyState
                  icon={<IconLayers size={24} />}
                  title="Session history is visible to group members only"
                />
              </div>
            ) : tabLoading ? (
              <LoadingSpinner label="Loading session history…" />
            ) : completedSessions.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={<IconLayers size={24} />}
                  title="No completed sessions yet."
                  message="Once a session is marked complete, it will appear in this history."
                />
              </div>
            ) : (
              <>
                <SectionTitle
                  title={`Completed sessions (${completedSessions.length})`}
                  icon={<IconLayers size={17} />}
                />

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Session</th>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Attendance</th>
                        <th>Topics covered</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedSessions.map((session) => (
                        <tr key={session._id}>
                          <td>
                            <Link to={`/sessions/${session._id}`} className="font-semibold">
                              {session.title}
                            </Link>
                            {session.learningObjective && (
                              <span className="text-xs text-muted" style={{ display: 'block' }}>
                                {session.learningObjective}
                              </span>
                            )}
                          </td>
                          <td className="text-sm">{formatDate(session.date)}</td>
                          <td className="text-sm">{formatDuration(session.duration)}</td>
                          <td className="text-sm">
                            <span className="badge badge-success">
                              {session.presentCount ?? 0}/{group.memberCount} attended
                            </span>
                          </td>
                          <td className="text-xs text-muted">
                            {session.topics?.length ? session.topics.join(', ') : '—'}
                          </td>
                          <td><StatusBadge status={session.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* -------------------------------- modals ----------------------------- */}
      <Modal
        open={joinOpen}
        title="Send join request"
        onClose={() => !busy && setJoinOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setJoinOpen(false)} disabled={busy === 'join'}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleJoin} disabled={busy === 'join'}>
              {busy === 'join' && <span className="btn-spinner" />}
              {busy === 'join' ? 'Sending…' : 'Send request'}
            </button>
          </>
        }
      >
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          <IconInfo size={17} />
          <span>
            The owner <strong>{group.createdBy?.name}</strong> will review your request for{' '}
            <strong>{group.name}</strong>.
          </span>
        </div>
        <Field label="Message to the owner (optional)" htmlFor="group-join-message" hint={`${joinMessage.length}/200 characters`}>
          <TextArea
            id="group-join-message"
            rows={3}
            maxLength={200}
            value={joinMessage}
            onChange={(event) => setJoinMessage(event.target.value)}
            placeholder="Hi! I would like to join because we are preparing for the same subject."
          />
        </Field>
      </Modal>

      <Modal open={editOpen} title={`Edit "${group.name}"`} size="modal-lg" onClose={() => !saving && setEditOpen(false)}>
        <GroupForm
          initialValues={{
            name: group.name,
            subject: group.subject,
            topic: group.topic,
            course: group.course,
            skillLevel: group.skillLevel,
            maxCapacity: group.maxCapacity,
            day: group.schedule?.day,
            time: group.schedule?.time,
            description: group.description,
          }}
          onSubmit={handleSaveGroup}
          submitting={saving}
          submitLabel="Save changes"
        />
      </Modal>

      <Modal
        open={sessionModal.open}
        title={sessionModal.session ? 'Edit session' : 'Schedule a new session'}
        size="modal-lg"
        onClose={() => !saving && setSessionModal({ open: false, session: null })}
      >
        <SessionForm
          initialValues={sessionModal.session ? sessionToForm(sessionModal.session) : undefined}
          onSubmit={handleSaveSession}
          submitting={saving}
          showStatus={Boolean(sessionModal.session)}
          submitLabel={sessionModal.session ? 'Save changes' : 'Schedule session'}
        />
      </Modal>

      <Modal
        open={resourceModal.open}
        title={resourceModal.resource ? 'Edit resource' : 'Share a resource'}
        onClose={() => !saving && setResourceModal({ open: false, resource: null })}
      >
        <ResourceForm
          initialValues={
            resourceModal.resource
              ? {
                title: resourceModal.resource.title,
                type: resourceModal.resource.type,
                url: resourceModal.resource.url,
                description: resourceModal.resource.description,
              }
              : undefined
          }
          onSubmit={handleSaveResource}
          submitting={saving}
          submitLabel={resourceModal.resource ? 'Save changes' : 'Share resource'}
        />
      </Modal>

      <Modal
        open={announcementModal.open}
        title={announcementModal.item ? 'Edit announcement' : 'Post an announcement'}
        onClose={() => !saving && setAnnouncementModal({ open: false, item: null })}
      >
        <AnnouncementForm
          initialValues={
            announcementModal.item
              ? { title: announcementModal.item.title, message: announcementModal.item.message }
              : undefined
          }
          onSubmit={handleSaveAnnouncement}
          submitting={saving}
          submitLabel={announcementModal.item ? 'Save changes' : 'Post announcement'}
        />
      </Modal>

      <AttendanceModal
        open={Boolean(attendanceSession)}
        session={attendanceSession}
        onClose={() => setAttendanceSession(null)}
        onSaved={() => {
          if (tab === 'sessions' || tab === 'history') {
            sessionService
              .forGroup(id)
              .then((response) => setSessions(response.data.sessions))
              .catch(() => {});
          }
          if (tab === 'attendance') {
            groupService.attendance(id).then((response) => setAttendance(response.data)).catch(() => {});
          }
          loadGroup();
        }}
      />

      <ConfirmDialog
        open={confirm.open}
        message={confirm.message}
        title={
          confirm.type === 'remove-member'
            ? 'Remove member'
            : confirm.type === 'delete-group'
              ? 'Delete study group'
              : 'Confirm action'
        }
        confirmLabel={confirm.type === 'remove-member' ? 'Remove member' : 'Delete'}
        onCancel={() => setConfirm({ open: false, type: '', payload: null, message: '' })}
        onConfirm={
          confirm.type === 'remove-member'
            ? handleRemoveMember
            : confirm.type === 'delete-session'
              ? handleDeleteSession
              : confirm.type === 'delete-resource'
                ? handleDeleteResource
                : confirm.type === 'delete-announcement'
                  ? handleDeleteAnnouncement
                  : handleDeleteGroup
        }
        loading={saving}
      />
    </>
  );
};

export default GroupDetails;
