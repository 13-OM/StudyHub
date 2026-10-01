import { IconSearch, IconX } from './Icons';

/**
 * SearchBar — controlled search input with a clear button.
 */
const SearchBar = ({ value, onChange, placeholder = 'Search…', onSubmit, id = 'search' }) => (
  <form
    className="input-icon"
    role="search"
    style={{ width: '100%' }}
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit?.();
    }}
  >
    <IconSearch size={17} />
    <label htmlFor={id} className="sr-only" style={{ position: 'absolute', left: -9999 }}>
      {placeholder}
    </label>
    <input
      id={id}
      type="search"
      className="input"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      autoComplete="off"
      style={{ paddingRight: 38 }}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear search"
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'var(--text-faint)', padding: 2,
        }}
      >
        <IconX size={15} />
      </button>
    )}
  </form>
);

export default SearchBar;
