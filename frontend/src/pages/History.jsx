import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsService } from '../services';
import { useApi } from '../hooks/useApi';
import {
  EmptyState, LoadingSpinner, ProgressBar, SectionTitle, Select, StatusBadge, TextInput, Field,
} from '../components/ui';
import {
  IconAlert, IconCalendarCheck, IconCheck, IconClock, IconLayers, IconRefresh, IconX,
} from '../components/Icons';
import { formatDate, formatDuration, formatTime, percent } from '../utils/format';

/**
 * History — completed (and cancelled) session history with filters for
 * date range, group and subject.
 */
const History = () => {
  const [filters, setFilters] = useState({ from: '', to: '', groupId: '', subject: '' });

  const query = useMemo(
    () => ({
      from: filters.from,
      to: filters.to,
      groupId: filters.groupId,
      subject: filters.subject,
    }),
    [filters]
  );

  const { data, loading, error, reload } = useApi(
    () => statsService.history(query),
    [query.from, query.to, query.groupId, query.subject]
  );

  const history = data?.data?.history || [];
  const groups = data?.data?.groups || [];
  const subjects = data?.data?.subjects || [];

  const totals = history.reduce(
    (acc, item) => {
      acc.sessions += 1;
      acc.minutes += item.duration || 0;
      acc.present += item.presentCount || 0;
      acc.members += item.totalMembers || 0;
      return acc;
    },
    { sessions: 0, minutes: 0, present: 0, members: 0 }
  );

  const resetFilters = () => setFilters({ from: '', to: '', groupId: '', subject: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Session History</h1>
          <p className="page-subtitle">
            Every completed and cancelled session across your study groups.
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={resetFilters} disabled={!hasFilters}>
          <IconRefresh size={15} /> Reset filters
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <div className="card card-pad">
          <div className="stat-label">Sessions in history</div>
          <div className="stat-value" style={{ fontSize: '1.7rem' }}>{totals.sessions}</div>
        </div>
        <div className="card card-pad">
          <div className="stat-label">Total study time</div>
          <div className="stat-value" style={{ fontSize: '1.7rem' }}>
            {Math.round(totals.minutes / 60)}h
          </div>
          <p className="text-xs text-muted" style={{ margin: 0 }}>{totals.minutes} minutes</p>
        </div>
        <div className="card card-pad">
          <div className="stat-label">Attendance marks</div>
          <div className="stat-value" style={{ fontSize: '1.7rem' }}>{totals.present}</div>
          <p className="text-xs text-muted" style={{ margin: 0 }}>Present records in these sessions</p>
        </div>
        <div className="card card-pad">
          <div className="stat-label">Average attendance</div>
          <div className="stat-value" style={{ fontSize: '1.7rem' }}>
            {totals.members ? percent(totals.present, totals.members) : 0}%
          </div>
          <ProgressBar value={totals.members ? percent(totals.present, totals.members) : 0} variant="success" />
        </div>
      </div>

      {/* Filters */}
      <section className="card filter-bar" style={{ marginBottom: 20 }}>
        <div className="filter-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <Field label="From date" htmlFor="history-from">
            <TextInput
              id="history-from"
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
            />
          </Field>

          <Field label="To date" htmlFor="history-to">
            <TextInput
              id="history-to"
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
            />
          </Field>

          <Field label="Group" htmlFor="history-group">
            <Select
              id="history-group"
              value={filters.groupId}
              onChange={(event) => setFilters((current) => ({ ...current, groupId: event.target.value }))}
            >
              <option value="">All groups</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>{group.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Subject" htmlFor="history-subject">
            <Select
              id="history-subject"
              value={filters.subject}
              onChange={(event) => setFilters((current) => ({ ...current, subject: event.target.value }))}
            >
              <option value="">All subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="row-between" style={{ flexWrap: 'wrap', gap: 10 }}>
          <span className="text-sm text-muted font-semibold">
            {history.length} session{history.length === 1 ? '' : 's'} found
            {hasFilters ? ' (filtered)' : ''}
          </span>
          {hasFilters && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
              <IconRefresh size={14} /> Clear filters
            </button>
          )}
        </div>
      </section>

      {error ? (
        <div className="alert alert-danger">
          <IconAlert size={18} />
          <span>{error.message}</span>
        </div>
      ) : loading ? (
        <LoadingSpinner label="Loading session history…" />
      ) : history.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconLayers size={24} />}
            title="No completed sessions found."
            message={
              hasFilters
                ? 'No sessions match these filters. Try a wider date range or another group.'
                : 'Completed sessions will show up here after group owners finish their meetings.'
            }
            action={
              hasFilters ? (
                <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters}>
                  Clear filters
                </button>
              ) : (
                <Link to="/sessions" className="btn btn-secondary btn-sm">View upcoming sessions</Link>
              )
            }
          />
        </div>
      ) : (
        <>
          <SectionTitle title="Completed sessions" icon={<IconCalendarCheck size={17} />} />

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session name</th>
                  <th>Group</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Attendance</th>
                  <th>Topics covered</th>
                  <th>My status</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <Link to={`/sessions/${item._id}`} className="font-semibold">
                        {item.title}
                      </Link>
                      {item.learningObjective && (
                        <span className="text-xs text-muted" style={{ display: 'block', maxWidth: 260 }}>
                          {item.learningObjective}
                        </span>
                      )}
                    </td>
                    <td className="text-sm">
                      {item.group?.name}
                      <span className="text-xs text-muted" style={{ display: 'block' }}>
                        {item.group?.subject}
                      </span>
                    </td>
                    <td className="text-sm">
                      {formatDate(item.date)}
                      <span className="text-xs text-muted" style={{ display: 'block' }}>
                        {formatTime(item.startTime)}
                      </span>
                    </td>
                    <td className="text-sm">{formatDuration(item.duration)}</td>
                    <td>
                      <span className="badge badge-success">
                        {item.presentCount}/{item.totalMembers} attended
                      </span>
                    </td>
                    <td className="text-xs text-muted" style={{ maxWidth: 200 }}>
                      {item.topics?.length ? item.topics.join(', ') : '—'}
                    </td>
                    <td>
                      {item.myStatus ? (
                        <span className={`badge ${item.myStatus === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                          {item.myStatus === 'Present' ? <IconCheck size={12} /> : <IconX size={12} />}
                          {item.myStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-faint">Not marked</span>
                      )}
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="alert alert-info" style={{ marginTop: 18 }}>
            <IconClock size={17} />
            <span>
              This history is generated from completed sessions in the groups you belong to.
              Owners mark a session complete from the group&apos;s Sessions tab.
            </span>
          </div>
        </>
      )}
    </>
  );
};

export default History;
