import { IconFilter, IconRefresh } from './Icons';
import SearchBar from './SearchBar';
import { COURSES, SKILL_LEVELS, SORT_OPTIONS, TIME_SLOTS, WEEK_DAYS } from '../utils/constants';
import { Select } from './ui';

/**
 * FilterBar — the complete filter panel of the Browse Groups page.
 * Every filter updates the results live (the parent page debounces the search).
 */
const FilterBar = ({ filters, subjects = [], onChange, onReset, resultCount }) => {
  const set = (key) => (event) => onChange({ ...filters, [key]: event.target.value, page: 1 });
  const activeCount = ['course', 'subject', 'topic', 'skillLevel', 'day', 'time', 'available']
    .filter((key) => filters[key] && filters[key] !== 'all' && filters[key] !== 'false').length;

  return (
    <section className="card filter-bar" aria-label="Search and filters">
      <div className="row-wrap" style={{ gap: 12 }}>
        <div style={{ flex: '1 1 320px' }}>
          <SearchBar
            id="group-search"
            value={filters.q || ''}
            onChange={(value) => onChange({ ...filters, q: value, page: 1 })}
            placeholder="Search by subject, topic or group name…"
          />
        </div>
        <Select
          aria-label="Sort results"
          value={filters.sort || 'newest'}
          onChange={set('sort')}
          style={{ maxWidth: 210 }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
      </div>

      <div className="filter-row">
        <Select aria-label="Filter by course" value={filters.course || ''} onChange={set('course')}>
          <option value="">All courses</option>
          {COURSES.map((course) => (
            <option key={course} value={course}>{course}</option>
          ))}
        </Select>

        <Select aria-label="Filter by subject" value={filters.subject || ''} onChange={set('subject')}>
          <option value="">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject.name || subject} value={subject.name || subject}>
              {subject.name || subject}
              {subject.count !== undefined ? ` (${subject.count})` : ''}
            </option>
          ))}
        </Select>

        <input
          className="input"
          aria-label="Filter by topic"
          placeholder="Topic e.g. React"
          value={filters.topic || ''}
          onChange={set('topic')}
        />

        <Select aria-label="Filter by skill level" value={filters.skillLevel || ''} onChange={set('skillLevel')}>
          <option value="">Any skill level</option>
          {SKILL_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </Select>

        <Select aria-label="Filter by day" value={filters.day || ''} onChange={set('day')}>
          <option value="">Any day</option>
          {WEEK_DAYS.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </Select>

        <Select aria-label="Filter by time slot" value={filters.time || ''} onChange={set('time')}>
          <option value="">Any time</option>
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>{slot}</option>
          ))}
        </Select>
      </div>

      <div className="row-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="row-wrap" style={{ gap: 10 }}>
          <label className="checkbox-row" style={{ fontSize: '0.82rem' }}>
            <input
              type="checkbox"
              checked={filters.available === 'true'}
              onChange={(event) =>
                onChange({ ...filters, available: event.target.checked ? 'true' : '', page: 1 })
              }
            />
            Only groups with available seats
          </label>

          <span className="badge badge-brand">
            <IconFilter size={12} /> {activeCount} filter{activeCount === 1 ? '' : 's'} active
          </span>

          {resultCount !== undefined && (
            <span className="text-sm text-muted font-semibold">
              {resultCount} study group{resultCount === 1 ? '' : 's'} found
            </span>
          )}
        </div>

        <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
          <IconRefresh size={14} /> Clear filters
        </button>
      </div>
    </section>
  );
};

export default FilterBar;
