import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { statsService } from '../services';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GroupCard from '../components/GroupCard';
import {
  CardSkeletonGrid, EmptyState, ProgressRing, SectionTitle,
  StatCard, StatSkeleton, StatusBadge,
} from '../components/ui';
import { formatDateShort, formatTime, greeting, relativeDay, timeAgo } from '../utils/format';
import {
  IconAlert, IconBook, IconCalendarCheck, IconCheckSquare, IconClock, IconInbox,
  IconLayers, IconMegaphone, IconPlus, IconSparkles, IconTrendingUp, IconUsers, IconZap,
} from '../components/Icons';

/** Recent activity icon + colour per activity type. */
const ACTIVITY_STYLE = {
  session: { icon: <IconCalendarCheck size={16} />, bg: 'var(--brand-50)', color: 'var(--brand-600)' },
  request: { icon: <IconUsers size={16} />, bg: 'var(--warning-50)', color: 'var(--warning-600)' },
  resource: { icon: <IconBook size={16} />, bg: 'var(--success-50)', color: 'var(--success-600)' },
  announcement: { icon: <IconMegaphone size={16} />, bg: 'var(--violet-50)', color: 'var(--violet-600)' },
};

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const { data, loading, error } = useApi(() => statsService.dashboard(), []);

  // The API answers { success, data: { stats, upcomingSessions, ... } }
  const payload = data?.data || {};
  const stats = payload.stats || {};
  const upcomingSessions = payload.upcomingSessions || [];
  const recommended = payload.recommendedGroups || [];
  const activity = payload.recentActivity || [];

  const QUICK_ACTIONS = [
    {
      label: 'Create group',
      icon: <IconPlus size={18} />,
      bg: 'var(--brand-50)', color: 'var(--brand-600)',
      onClick: () => navigate('/groups/create'),
    },
    {
      label: 'Join group',
      icon: <IconUsers size={18} />,
      bg: 'var(--violet-50)', color: 'var(--violet-600)',
      onClick: () => navigate('/groups'),
    },
    {
      label: 'Schedule session',
      icon: <IconCalendarCheck size={18} />,
      bg: 'var(--success-50)', color: 'var(--success-600)',
      onClick: () => navigate('/my-groups'),
    },
    {
      label: 'Add resource',
      icon: <IconBook size={18} />,
      bg: 'var(--warning-50)', color: 'var(--warning-600)',
      onClick: () => navigate('/resources'),
    },
  ];

  if (error) {
    return (
      <EmptyState
        icon={<IconAlert size={24} />}
        title="We could not load your dashboard"
        message={error.message}
        action={
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Try again
          </button>
        }
      />
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">
            {greeting()} — here&apos;s what&apos;s happening with your study groups.
          </p>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <Link to="/groups" className="btn btn-secondary">
            <IconUsers size={16} /> Browse groups
          </Link>
          <Link to="/groups/create" className="btn btn-primary">
            <IconPlus size={16} /> Create group
          </Link>
        </div>
      </div>

      {/* ------------------------- Statistics cards ------------------------- */}
      {loading ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-4">
          <StatCard
            label="My groups"
            value={String(stats.myGroups ?? 0).padStart(2, '0')}
            icon={<IconLayers size={19} />}
            foot={
              <>
                <IconTrendingUp size={14} style={{ color: 'var(--success-600)' }} />
                +{stats.groupsThisMonth ?? 0} this month
              </>
            }
          />
          <StatCard
            label="Upcoming sessions"
            value={String(stats.upcomingSessions ?? 0).padStart(2, '0')}
            icon={<IconCalendarCheck size={19} />}
            accent="var(--violet-600)"
            accentSoft="var(--violet-50)"
            foot={<>{stats.completedSessions ?? 0} completed so far</>}
          />
          <StatCard
            label="Pending requests"
            value={String(stats.pendingRequests ?? 0).padStart(2, '0')}
            icon={<IconInbox size={19} />}
            accent="var(--warning-600)"
            accentSoft="var(--warning-50)"
            foot={<>{stats.pendingRequests > 0 ? 'Needs your approval' : 'Nothing waiting for you'}</>}
          />
          <StatCard
            label="Resources shared"
            value={String(stats.resourcesShared ?? 0).padStart(2, '0')}
            icon={<IconBook size={19} />}
            accent="var(--success-600)"
            accentSoft="var(--success-50)"
            foot={<>{stats.announcements ?? 0} announcements</>}
          />
        </div>
      )}

      {/* ---------------------- Attendance + quick actions ------------------- */}
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.25fr)', marginTop: 18 }}>
        <section className="card card-pad">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Your learning snapshot</h2>
              <p className="text-sm text-muted" style={{ margin: '3px 0 0' }}>
                Groups, sessions and attendance across StudyHub.
              </p>
            </div>
            <span className="badge badge-brand">
              <IconSparkles size={12} /> Live data
            </span>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
            <div className="info-tile">
              <div className="it-label">Groups created</div>
              <div className="it-value">{stats.groupsCreated ?? 0}</div>
            </div>
            <div className="info-tile">
              <div className="it-label">Groups joined</div>
              <div className="it-value">{stats.groupsJoined ?? 0}</div>
            </div>
            <div className="info-tile">
              <div className="it-label">Completed sessions</div>
              <div className="it-value">{stats.completedSessions ?? 0}</div>
            </div>
            <div className="info-tile">
              <div className="it-label">Total groups on StudyHub</div>
              <div className="it-value">{stats.totalGroups ?? 0}</div>
            </div>
          </div>

          <div className="divider" />

          <div className="row" style={{ gap: 22, flexWrap: 'wrap' }}>
            <ProgressRing value={stats.attendanceRate ?? 0} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 8 }}>Attendance rate</h3>
              <p className="text-sm text-muted" style={{ marginBottom: 14 }}>
                You attended <strong style={{ color: 'var(--text)' }}>{stats.sessionsAttended ?? 0}</strong> of
                your marked sessions. A rate above 75% is considered consistent.
              </p>
              <div className="row-wrap" style={{ gap: 8 }}>
                <span className="badge badge-success">Present: {stats.sessionsAttended ?? 0}</span>
                <span className="badge badge-neutral">Completed sessions: {stats.completedSessions ?? 0}</span>
                <Link to="/attendance" className="badge badge-brand">Full attendance report →</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="card card-pad">
          <h2 style={{ fontSize: '1.05rem', marginBottom: 4 }}>Quick actions</h2>
          <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
            Jump straight to the most common tasks.
          </p>
          <div className="stack" style={{ gap: 10 }}>
            {QUICK_ACTIONS.map((action) => (
              <button key={action.label} type="button" className="quick-action" onClick={action.onClick}>
                <span className="qa-icon" style={{ background: action.bg, color: action.color }}>
                  {action.icon}
                </span>
                {action.label}
                <span className="spacer" />
                <IconZap size={15} style={{ color: 'var(--text-faint)' }} />
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* -------------------------- Upcoming sessions ----------------------- */}
      <SectionTitle
        title="Upcoming sessions"
        icon={<IconCalendarCheck size={18} />}
        action={<Link to="/sessions" className="muted-link">View all sessions →</Link>}
      />

      {loading ? (
        <div className="stack" style={{ gap: 12 }}>
          {[1, 2, 3].map((key) => <div key={key} className="skeleton skeleton-row" />)}
        </div>
      ) : upcomingSessions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconCalendarCheck size={24} />}
            title="No upcoming sessions."
            message="Once a group you belong to schedules a session, it will appear here."
            action={
              <Link to="/my-groups" className="btn btn-primary btn-sm">
                <IconPlus size={15} /> Schedule a session
              </Link>
            }
          />
        </div>
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {upcomingSessions.map((session) => (
            <Link key={session._id} to={`/sessions/${session._id}`} className="list-item">
              <span className="li-icon"><IconCalendarCheck size={20} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="li-title truncate">{session.title}</span>
                <span className="li-sub">
                  {session.group?.name} · {relativeDay(session.date)} · {formatTime(session.startTime)} ·{' '}
                  {session.duration} min
                </span>
              </span>
              <StatusBadge status={session.status} />
            </Link>
          ))}
        </div>
      )}

      {/* ------------------------- Recommended groups ----------------------- */}
      <SectionTitle
        title="Recommended for you"
        icon={<IconSparkles size={18} />}
        action={<Link to="/groups" className="muted-link">Browse all groups →</Link>}
      />

      {loading ? (
        <CardSkeletonGrid count={4} height={280} />
      ) : recommended.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconUsers size={24} />}
            title="No recommendations right now."
            message="You have either joined every open group or all groups are full."
            action={<Link to="/groups" className="btn btn-secondary btn-sm">Browse study groups</Link>}
          />
        </div>
      ) : (
        <div className="grid grid-4">
          {recommended.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onJoin={() => {
                toast.info('Open the group to send a join request.');
                navigate(`/groups/${group._id}`);
              }}
            />
          ))}
        </div>
      )}

      {/* --------------------------- Recent activity ------------------------ */}
      <SectionTitle title="Recent activity" icon={<IconClock size={18} />} />

      <section className="card card-pad">
        {loading ? (
          <div className="stack" style={{ gap: 12 }}>
            {[1, 2, 3, 4].map((key) => <div key={key} className="skeleton skeleton-row" />)}
          </div>
        ) : activity.length === 0 ? (
          <EmptyState
            icon={<IconClock size={24} />}
            title="No activity yet."
            message="Create a group or join one to see updates here."
          />
        ) : (
          activity.map((item, index) => {
            const style = ACTIVITY_STYLE[item.type] || ACTIVITY_STYLE.session;
            return (
              <div className="activity-item" key={`${item.title}-${index}`}>
                <span className="activity-dot" style={{ background: style.bg, color: style.color }}>
                  {style.icon}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="li-title">{item.title}</span>
                  <span className="li-sub">{item.subtitle}</span>
                </span>
                <span className="text-xs text-faint" style={{ whiteSpace: 'nowrap' }}>
                  {timeAgo(item.date)}
                </span>
              </div>
            );
          })
        )}
      </section>

      {/* --------------------------- Pending request CTA -------------------- */}
      {!loading && stats.pendingRequests > 0 && (
        <div className="alert alert-warning" style={{ marginTop: 22 }}>
          <IconAlert size={18} />
          <span style={{ flex: 1 }}>
            You have <strong>{stats.pendingRequests}</strong> pending join request
            {stats.pendingRequests > 1 ? 's' : ''} waiting for approval.
          </span>
          <Link to="/my-groups" className="btn btn-sm btn-secondary">Review requests</Link>
        </div>
      )}

      {/* --------------------------- Attendance shortcut -------------------- */}
      <div className="grid grid-3" style={{ marginTop: 22 }}>
        <Link to="/attendance" className="card card-pad card-hover row" style={{ gap: 14 }}>
          <span className="li-icon"><IconCheckSquare size={20} /></span>
          <span>
            <span className="li-title">Attendance history</span>
            <span className="li-sub">See attended and missed sessions</span>
          </span>
        </Link>
        <Link to="/history" className="card card-pad card-hover row" style={{ gap: 14 }}>
          <span className="li-icon"><IconLayers size={20} /></span>
          <span>
            <span className="li-title">Completed sessions</span>
            <span className="li-sub">{stats.completedSessions ?? 0} sessions finished</span>
          </span>
        </Link>
        <Link to="/resources" className="card card-pad card-hover row" style={{ gap: 14 }}>
          <span className="li-icon"><IconBook size={20} /></span>
          <span>
            <span className="li-title">Shared resources</span>
            <span className="li-sub">{stats.resourcesShared ?? 0} materials available</span>
          </span>
        </Link>
      </div>

      {!loading && (
        <p className="text-xs text-faint text-center" style={{ marginTop: 30 }}>
          Last updated {formatDateShort(new Date())} · StudyHub v1.0
        </p>
      )}
    </>
  );
};

export default Dashboard;
