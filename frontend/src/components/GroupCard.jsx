import { Link } from 'react-router-dom';
import { AvatarStack, ProgressBar, SkillBadge, StatusBadge } from './ui';
import { IconBook, IconCalendar, IconClock, IconPlus, IconUsersRound } from './Icons';
import { percent } from '../utils/format';

/**
 * GroupCard — used on Browse Groups, Dashboard recommendations and My Groups.
 * The action button changes automatically based on `group.viewer`:
 *   Member | Owner | Pending | Group Full | Request to Join
 */
const GroupCard = ({ group, onJoin, joining = false, showManage = false }) => {
  const { viewer = {} } = group;
  const fillPercent = percent(group.memberCount, group.maxCapacity);

  const renderAction = () => {
    if (viewer.isOwner) {
      return (
        <Link to={`/groups/${group._id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
          Manage group
        </Link>
      );
    }
    if (viewer.isMember) {
      return (
        <Link to={`/groups/${group._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
          Open group
        </Link>
      );
    }
    if (viewer.requestStatus === 'Pending') {
      return (
        <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }} disabled>
          <IconClock size={14} /> Request pending
        </button>
      );
    }
    if (group.isFull) {
      return (
        <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }} disabled>
          Group full
        </button>
      );
    }
    return (
      <button
        type="button"
        className="btn btn-primary btn-sm"
        style={{ flex: 1 }}
        onClick={() => onJoin?.(group)}
        disabled={joining}
      >
        {joining ? <span className="btn-spinner" /> : <IconPlus size={15} />}
        {joining ? 'Sending…' : 'Request to join'}
      </button>
    );
  };

  return (
    <article className="card card-hover group-card">
      <header className="row-between" style={{ alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <h3 className="gc-title truncate">{group.name}</h3>
          <p className="text-xs text-muted" style={{ margin: '3px 0 0' }}>
            {group.subject} <span className="dot-sep" /> {group.topic}
          </p>
        </div>
        <StatusBadge status={group.status || 'Active'} />
      </header>

      <p className="gc-desc clamp-2" style={{ margin: 0 }}>{group.description}</p>

      <div className="row-wrap" style={{ gap: 6 }}>
        <SkillBadge level={group.skillLevel} />
        <span className="badge badge-neutral">
          <IconBook size={12} /> {group.course}
        </span>
      </div>

      <div className="gc-meta">
        <span>
          <IconCalendar size={14} /> {group.schedule?.day}s · {group.schedule?.time}
        </span>
        <span>
          <IconUsersRound size={14} /> {group.memberCount}/{group.maxCapacity} members
        </span>
      </div>

      <div>
        <div className="row-between" style={{ marginBottom: 6 }}>
          <span className="text-xs text-muted">Capacity</span>
          <span className="text-xs font-semibold">{group.seatsLeft} seat(s) left</span>
        </div>
        <ProgressBar
          value={fillPercent}
          variant={group.isFull ? 'danger' : fillPercent > 70 ? 'warning' : 'success'}
        />
      </div>

      <div className="gc-foot">
        <div className="row" style={{ minWidth: 0, gap: 8, flex: 1 }}>
          <AvatarStack users={group.members?.map((m) => m.user).filter(Boolean) || []} max={3} />
          <span className="text-xs text-muted truncate">
            by {group.createdBy?.name || 'Unknown'}
          </span>
        </div>
        {/* Members and owners already have a primary action button below,
            so the extra link is only useful for visitors. */}
        {!viewer.isMember && !viewer.isOwner && (
          <Link to={`/groups/${group._id}`} className="text-xs font-semibold" style={{ whiteSpace: 'nowrap' }}>
            View details
          </Link>
        )}
      </div>

      <div className="row" style={{ gap: 8 }}>{renderAction()}</div>
    </article>
  );
};

export default GroupCard;
