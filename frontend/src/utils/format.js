/**
 * format.js — small pure helper functions used across many components.
 */

/** 2026-10-05 -> "05 Oct 2026" */
export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** 2026-10-05 -> "Mon, 05 Oct" */
export const formatDateShort = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
};

/** "18:30" -> "6:30 PM" */
export const formatTime = (time) => {
  if (!time) return '—';
  const [hourStr, minute = '00'] = String(time).split(':');
  const hour = Number(hourStr);
  if (Number.isNaN(hour)) return time;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${minute} ${suffix}`;
};

/** 90 -> "1h 30m" */
export const formatDuration = (minutes) => {
  const mins = Number(minutes) || 0;
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

/** "2 hours ago" / "in 3 days" */
export const timeAgo = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const future = seconds < 0;
  const abs = Math.abs(seconds);

  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  for (const [unit, secs] of units) {
    const amount = Math.floor(abs / secs);
    if (amount >= 1) {
      const text = `${amount} ${unit}${amount > 1 ? 's' : ''}`;
      return future ? `in ${text}` : `${text} ago`;
    }
  }
  return 'just now';
};

/** Today / Tomorrow / Mon, 05 Oct */
export const relativeDay = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(date, today)) return 'Today';
  if (same(date, tomorrow)) return 'Tomorrow';
  return formatDateShort(date);
};

/** "Om Bhatt" -> "OB" */
export const initialsOf = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || '?';

/** Greeting based on the current hour of the day. */
export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

/** Convert a date string into the value an <input type="date"> expects. */
export const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

/** Percent helper that never divides by zero. */
export const percent = (part, total) => (total > 0 ? Math.round((part / total) * 100) : 0);
