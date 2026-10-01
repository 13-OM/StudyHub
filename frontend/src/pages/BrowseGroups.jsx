import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { groupService, requestService, statsService } from '../services';
import { useApi, useDebounce } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import GroupCard from '../components/GroupCard';
import FilterBar from '../components/FilterBar';
import { CardSkeletonGrid, EmptyState, Modal, Pagination, TextArea, Field } from '../components/ui';
import { IconAlert, IconPlus, IconSearch, IconUsers } from '../components/Icons';
import { SKILL_LEVELS, WEEK_DAYS } from '../utils/constants';

const EMPTY_FILTERS = {
  q: '',
  course: '',
  subject: '',
  topic: '',
  skillLevel: '',
  day: '',
  time: '',
  available: '',
  sort: 'newest',
  page: 1,
};

/** Browse Groups — search, filter, sort and send join requests. */
const BrowseGroups = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    q: searchParams.get('q') || '',
    course: searchParams.get('course') || '',
    skillLevel: searchParams.get('skillLevel') || '',
    day: searchParams.get('day') || '',
  });
  const [joinTarget, setJoinTarget] = useState(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [joining, setJoining] = useState(false);

  // Debounce the free-text search so we do not fire a request per keystroke
  const debouncedQuery = useDebounce(filters.q, 350);
  const debouncedTopic = useDebounce(filters.topic, 400);

  const query = useMemo(
    () => ({ ...filters, q: debouncedQuery, topic: debouncedTopic }),
    [filters, debouncedQuery, debouncedTopic]
  );

  const { data, loading, error, reload } = useApi(() => groupService.list(query), [
    query.q, query.course, query.subject, query.topic, query.skillLevel,
    query.day, query.time, query.available, query.sort, query.page,
  ]);

  const { data: subjectData } = useApi(() => statsService.subjects(), []);
  const subjects = subjectData?.data?.subjectsInUse || [];

  const groups = data?.data?.groups || [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  // Keep the URL in sync so the search is shareable / bookmarkable
  useEffect(() => {
    const next = {};
    if (filters.q) next.q = filters.q;
    if (filters.course) next.course = filters.course;
    if (filters.skillLevel) next.skillLevel = filters.skillLevel;
    if (filters.day) next.day = filters.day;
    setSearchParams(next, { replace: true });
  }, [filters.q, filters.course, filters.skillLevel, filters.day, setSearchParams]);

  const handleSendRequest = async () => {
    if (!joinTarget) return;
    setJoining(true);
    try {
      const response = await requestService.create(joinTarget._id, joinMessage.trim());
      toast.success(response.message || 'Join request sent successfully.');
      setJoinTarget(null);
      setJoinMessage('');
      reload();
    } catch (err) {
      toast.error(err.message || 'Unable to send the join request.');
    } finally {
      setJoining(false);
    }
  };

  const quickFilters = [
    { label: 'All groups', value: '', key: 'skillLevel' },
    ...SKILL_LEVELS.map((level) => ({ label: level, value: level, key: 'skillLevel' })),
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Find Your Study Group</h1>
          <p className="page-subtitle">
            Search {total} study group{total === 1 ? '' : 's'} by subject, topic, skill level or schedule.
          </p>
        </div>
        <Link to="/groups/create" className="btn btn-primary">
          <IconPlus size={16} /> Create group
        </Link>
      </div>

      <FilterBar
        filters={filters}
        subjects={subjects}
        onChange={setFilters}
        onReset={() => setFilters({ ...EMPTY_FILTERS })}
        resultCount={loading ? undefined : total}
      />

      {/* Quick chips for skill level */}
      <div className="row-wrap" style={{ gap: 8, margin: '16px 0 18px' }}>
        {quickFilters.map((chip) => (
          <button
            key={chip.label}
            type="button"
            className={`chip ${filters[chip.key] === chip.value ? 'active' : ''}`}
            onClick={() => setFilters((current) => ({ ...current, [chip.key]: chip.value, page: 1 }))}
          >
            {chip.label}
          </button>
        ))}
        {WEEK_DAYS.slice(0, 3).map((day) => (
          <button
            key={day}
            type="button"
            className={`chip ${filters.day === day ? 'active' : ''}`}
            onClick={() =>
              setFilters((current) => ({ ...current, day: current.day === day ? '' : day, page: 1 }))
            }
          >
            {day}s
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 18 }}>
          <IconAlert size={18} />
          <span>{error.message}</span>
        </div>
      )}

      {loading ? (
        <CardSkeletonGrid count={6} height={320} />
      ) : groups.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconSearch size={24} />}
            title="No study groups match your filters."
            message="Try changing the search text, removing a filter, or create your own group for this subject."
            action={
              <div className="row" style={{ gap: 10, marginTop: 6 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setFilters({ ...EMPTY_FILTERS })}>
                  Clear filters
                </button>
                <Link to="/groups/create" className="btn btn-primary">
                  <IconPlus size={16} /> Create a group
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-auto">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} onJoin={setJoinTarget} />
            ))}
          </div>
          <Pagination
            page={filters.page}
            pages={pages}
            onChange={(page) => {
              setFilters((current) => ({ ...current, page }));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}

      {/* Join request modal */}
      <Modal
        open={Boolean(joinTarget)}
        title="Send join request"
        onClose={() => !joining && setJoinTarget(null)}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setJoinTarget(null)} disabled={joining}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSendRequest} disabled={joining}>
              {joining && <span className="btn-spinner" />}
              {joining ? 'Sending…' : 'Send request'}
            </button>
          </>
        }
      >
        {joinTarget && (
          <>
            <div className="alert alert-info" style={{ marginBottom: 18 }}>
              <IconUsers size={18} />
              <span>
                You are requesting to join <strong>{joinTarget.name}</strong> ({joinTarget.subject} ·{' '}
                {joinTarget.topic}). The group owner will review your request.
              </span>
            </div>
            <Field
              label="Message to the group owner (optional)"
              htmlFor="join-message"
              hint={`${joinMessage.length}/200 characters`}
            >
              <TextArea
                id="join-message"
                rows={3}
                maxLength={200}
                value={joinMessage}
                onChange={(event) => setJoinMessage(event.target.value)}
                placeholder="Hi! I am in the same division and would like to prepare for this subject together."
              />
            </Field>
          </>
        )}
      </Modal>
    </>
  );
};

export default BrowseGroups;
