import { useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceService, groupService } from '../services';
import { useApi } from '../hooks/useApi';
import {
  EmptyState, LoadingSpinner, ProgressBar, ProgressRing, SectionTitle, Select, StatusBadge, Tabs,
} from '../components/ui';
import {
  IconAlert, IconCalendarCheck, IconCheck, IconCheckSquare, IconLayers, IconX,
} from '../components/Icons';
import { formatDate, formatDuration, formatTime, relativeDay } from '../utils/format';

/**
 * Attendance — the personal attendance report:
 * overall rate, per-session record and a group-wise breakdown.
 */
const Attendance = () => {
  const [tab, setTab] = useState('overview');
  const [groupId, setGroupId] = useState('');

  const { data, loading, error } = useApi(() => attendanceService.mine(), []);
  const { data: groupAttendance, loading: groupLoading } = useApi(
    () => (groupId ? groupService.attendance(groupId) : Promise.resolve(null)),
    [groupId]
  );
  const { data: myGroupData } = useApi(() => groupService.myGroups(), []);

  const records = data?.data?.records || [];
  const history = data?.data?.history || [];
  const summary = data?.data?.summary || {
    sessionsAttended: 0, sessionsMissed: 0, totalMarked: 0, attendanceRate: 0,
  };

  const myGroups = [
    ...(myGroupData?.data?.created || []),
    ...(myGroupData?.data?.joined || []),
  ];

  const presentList = records.filter((record) => record.status === 'Present');
  const absentList = records.filter((record) => record.status === 'Absent');

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <IconCheckSquare size={15} /> },
    { id: 'records', label: 'My attendance records', icon: <IconCalendarCheck size={15} />, count: records.length },
    { id: 'groups', label: 'Group breakdown', icon: <IconLayers size={15} /> },
  ];

  if (loading) return <LoadingSpinner label="Loading your attendance…" />;

  if (error) {
    return (
      <EmptyState
        icon={<IconAlert size={24} />}
        title="Could not load attendance"
        message={error.message}
      />
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">
            Your presence record across every study session you were part of.
          </p>
        </div>
        <Link to="/history" className="btn btn-secondary">
          <IconLayers size={16} /> Session history
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <div className="card card-pad">
          <div className="stat-label">Attendance rate</div>
          <div className="stat-value" style={{ fontSize: '1.8rem' }}>{summary.attendanceRate}%</div>
          <ProgressBar
            value={summary.attendanceRate}
            variant={summary.attendanceRate >= 75 ? 'success' : summary.attendanceRate >= 50 ? 'warning' : 'danger'}
          />
        </div>
        <div className="card card-pad">
          <div className="stat-label">Sessions attended</div>
          <div className="stat-value" style={{ fontSize: '1.8rem' }}>{summary.sessionsAttended}</div>
          <p className="text-xs text-muted" style={{ margin: 0 }}>Marked present by the owner</p>
        </div>
        <div className="card card-pad">
          <div className="stat-label">Sessions missed</div>
          <div className="stat-value" style={{ fontSize: '1.8rem' }}>{summary.sessionsMissed}</div>
          <p className="text-xs text-muted" style={{ margin: 0 }}>Marked absent</p>
        </div>
        <div className="card card-pad">
          <div className="stat-label">Records marked</div>
          <div className="stat-value" style={{ fontSize: '1.8rem' }}>{summary.totalMarked}</div>
          <p className="text-xs text-muted" style={{ margin: 0 }}>Total attendance entries</p>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ marginTop: 22 }}>
        {/* ------------------------------ Overview ---------------------------- */}
        {tab === 'overview' && (
          records.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<IconCheckSquare size={24} />}
                title="No attendance records yet."
                message="Once a group owner marks attendance for a session you took part in, your record will appear here."
                action={<Link to="/sessions" className="btn btn-secondary btn-sm">View sessions</Link>}
              />
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)' }}>
              <section className="card card-pad text-center">
                <h2 style={{ fontSize: '1rem' }}>Overall attendance</h2>
                <div style={{ display: 'grid', placeItems: 'center', margin: '18px 0' }}>
                  <ProgressRing value={summary.attendanceRate} size={150} label="Attendance rate" />
                </div>
                <p className="text-sm text-muted">
                  You attended <strong style={{ color: 'var(--text)' }}>{summary.sessionsAttended}</strong> of{' '}
                  <strong style={{ color: 'var(--text)' }}>{summary.totalMarked}</strong> marked sessions.
                </p>
                <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
                  <span className="badge badge-success">
                    <IconCheck size={12} /> Present {summary.sessionsAttended}
                  </span>
                  <span className="badge badge-danger">
                    <IconX size={12} /> Absent {summary.sessionsMissed}
                  </span>
                </div>
              </section>

              <section className="card card-pad">
                <h2 style={{ fontSize: '1rem', marginBottom: 14 }}>Recent sessions attended</h2>
                <div className="stack" style={{ gap: 11 }}>
                  {presentList.slice(0, 6).map((record) => (
                    <div className="list-item" key={record._id} style={{ padding: '11px 14px' }}>
                      <span className="li-icon" style={{ width: 36, height: 36 }}>
                        <IconCalendarCheck size={17} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="li-title truncate">{record.session?.title}</span>
                        <span className="li-sub">
                          {record.group?.name} · {relativeDay(record.session?.date)} ·{' '}
                          {formatDuration(record.session?.duration)}
                        </span>
                      </span>
                      <span className="badge badge-success">Present</span>
                    </div>
                  ))}
                  {presentList.length === 0 && (
                    <p className="text-sm text-muted" style={{ margin: 0 }}>
                      You have not been marked present in any session yet.
                    </p>
                  )}
                </div>

                {absentList.length > 0 && (
                  <>
                    <div className="divider" />
                    <h3 style={{ fontSize: '0.95rem' }}>Sessions you missed</h3>
                    <div className="stack" style={{ gap: 11 }}>
                      {absentList.slice(0, 4).map((record) => (
                        <div className="list-item" key={record._id} style={{ padding: '11px 14px' }}>
                          <span className="li-icon" style={{ width: 36, height: 36, background: 'var(--danger-50)', color: 'var(--danger-600)' }}>
                            <IconX size={17} />
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="li-title truncate">{record.session?.title}</span>
                            <span className="li-sub">
                              {record.group?.name} · {formatDate(record.session?.date)}
                            </span>
                          </span>
                          <span className="badge badge-danger">Absent</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            </div>
          )
        )}

        {/* ------------------------------ Records ----------------------------- */}
        {tab === 'records' && (
          records.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<IconCheckSquare size={24} />}
                title="No attendance records yet."
                message="Attendance records appear once a group owner marks a session."
              />
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Group</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>My status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id}>
                      <td>
                        <Link to={`/sessions/${record.session?._id}`} className="font-semibold">
                          {record.session?.title}
                        </Link>
                        {record.session?.topics?.length > 0 && (
                          <span className="text-xs text-muted" style={{ display: 'block' }}>
                            {record.session.topics.join(', ')}
                          </span>
                        )}
                      </td>
                      <td className="text-sm">{record.group?.name}</td>
                      <td className="text-sm">{formatDate(record.session?.date)}</td>
                      <td className="text-sm">{formatTime(record.session?.startTime)}</td>
                      <td className="text-sm">{formatDuration(record.session?.duration)}</td>
                      <td>
                        <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* --------------------------- Group breakdown ------------------------ */}
        {tab === 'groups' && (
          <>
            <section className="card filter-bar" style={{ marginBottom: 20 }}>
              <div className="row-wrap" style={{ gap: 12 }}>
                <Select
                  aria-label="Select a group"
                  value={groupId}
                  onChange={(event) => setGroupId(event.target.value)}
                  style={{ maxWidth: 340 }}
                >
                  <option value="">Select one of your study groups…</option>
                  {myGroups.map((group) => (
                    <option key={group._id} value={group._id}>{group.name}</option>
                  ))}
                </Select>
                <span className="text-sm text-muted">
                  See how every member of a group is performing.
                </span>
              </div>
            </section>

            {groupId && groupLoading && <LoadingSpinner label="Loading group attendance…" />}

            {groupId && !groupLoading && groupAttendance?.data && (
              <>
                <div className="grid grid-3" style={{ marginBottom: 20 }}>
                  <div className="card card-pad">
                    <div className="stat-label">Group attendance rate</div>
                    <div className="stat-value" style={{ fontSize: '1.7rem' }}>
                      {groupAttendance.data.overall.attendanceRate}%
                    </div>
                    <ProgressBar value={groupAttendance.data.overall.attendanceRate} variant="success" />
                  </div>
                  <div className="card card-pad">
                    <div className="stat-label">Completed sessions</div>
                    <div className="stat-value" style={{ fontSize: '1.7rem' }}>
                      {groupAttendance.data.overall.completedSessions}
                    </div>
                  </div>
                  <div className="card card-pad">
                    <div className="stat-label">Attendance entries</div>
                    <div className="stat-value" style={{ fontSize: '1.7rem' }}>
                      {groupAttendance.data.overall.markedRecords}
                    </div>
                  </div>
                </div>

                <SectionTitle title="Member attendance" icon={<IconCheckSquare size={17} />} />

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Attended</th>
                        <th>Missed</th>
                        <th style={{ minWidth: 180 }}>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupAttendance.data.members.map((row) => (
                        <tr key={row.user?._id}>
                          <td>
                            <span className="font-semibold">{row.user?.name}</span>
                            <span className="text-xs text-muted" style={{ display: 'block' }}>
                              {row.user?.course}
                            </span>
                          </td>
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

            {!groupId && (
              <div className="card">
                <EmptyState
                  icon={<IconLayers size={24} />}
                  title="Choose a study group"
                  message="Select one of your groups above to see the attendance of every member."
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Completed session history preview */}
      {history.length > 0 && tab === 'overview' && (
        <>
          <SectionTitle
            title="Completed session history"
            icon={<IconLayers size={17} />}
            action={<Link to="/history" className="muted-link">Open full history →</Link>}
          />
          <div className="stack" style={{ gap: 11 }}>
            {history.slice(0, 5).map((item) => (
              <div className="list-item" key={item._id}>
                <span className="li-icon"><IconCalendarCheck size={18} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="li-title truncate">{item.title}</span>
                  <span className="li-sub">
                    {item.group?.name} · {formatDate(item.date)} · {formatDuration(item.duration)}
                  </span>
                </span>
                <span className="badge badge-brand">
                  {item.presentCount}/{item.totalMembers} attended
                </span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default Attendance;
