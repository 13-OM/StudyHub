import { useState } from 'react';
import { Field, Select, TextArea, TextInput } from './ui';
import { isValid, validateSession } from '../utils/validation';
import { SESSION_STATUS } from '../utils/constants';
import { toDateInput } from '../utils/format';

/**
 * SessionForm — creates or edits a study session with its full session plan
 * (learning objective, agenda, topics, expected outcome).
 */
const EMPTY_SESSION = {
  title: '',
  learningObjective: '',
  agenda: '',
  topics: '',
  expectedOutcome: '',
  date: '',
  startTime: '18:00',
  duration: 60,
  meetingLink: '',
  notes: '',
  status: 'Upcoming',
};

const SessionForm = ({ initialValues, onSubmit, submitting = false, submitLabel = 'Schedule session', showStatus = false }) => {
  const [form, setForm] = useState({ ...EMPTY_SESSION, ...initialValues });
  const [errors, setErrors] = useState({});

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateSession(form);
    setErrors(validationErrors);
    if (!isValid(validationErrors)) return;

    onSubmit({
      title: form.title.trim(),
      learningObjective: form.learningObjective.trim(),
      agenda: form.agenda,
      topics: form.topics,
      expectedOutcome: form.expectedOutcome.trim(),
      date: new Date(`${form.date}T${form.startTime}:00`).toISOString(),
      startTime: form.startTime,
      duration: Number(form.duration),
      meetingLink: form.meetingLink.trim(),
      notes: form.notes.trim(),
      ...(showStatus ? { status: form.status } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      <Field label="Session title" htmlFor="session-title" error={errors.title} required>
        <TextInput
          id="session-title"
          value={form.title}
          error={errors.title}
          onChange={update('title')}
          placeholder="e.g. React Hooks Deep Dive"
          maxLength={100}
        />
      </Field>

      <div className="form-grid cols-2">
        <Field label="Date" htmlFor="session-date" error={errors.date} required>
          <TextInput
            id="session-date"
            type="date"
            value={form.date}
            error={errors.date}
            onChange={update('date')}
          />
        </Field>

        <Field label="Start time" htmlFor="session-time" error={errors.startTime} required>
          <TextInput
            id="session-time"
            type="time"
            value={form.startTime}
            error={errors.startTime}
            onChange={update('startTime')}
          />
        </Field>
      </div>

      <div className="form-grid cols-2">
        <Field label="Duration (minutes)" htmlFor="session-duration" error={errors.duration} required>
          <TextInput
            id="session-duration"
            type="number"
            min={15}
            max={480}
            step={5}
            value={form.duration}
            error={errors.duration}
            onChange={update('duration')}
          />
        </Field>

        {showStatus ? (
          <Field label="Status" htmlFor="session-status">
            <Select id="session-status" value={form.status} onChange={update('status')}>
              {SESSION_STATUS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
          </Field>
        ) : (
          <Field label="Meeting link" htmlFor="session-link" error={errors.meetingLink} hint="Optional — Google Meet, Zoom…">
            <TextInput
              id="session-link"
              value={form.meetingLink}
              error={errors.meetingLink}
              onChange={update('meetingLink')}
              placeholder="https://meet.google.com/…"
            />
          </Field>
        )}
      </div>

      {showStatus && (
        <Field label="Meeting link" htmlFor="session-link" error={errors.meetingLink} hint="Optional — Google Meet, Zoom…">
          <TextInput
            id="session-link"
            value={form.meetingLink}
            error={errors.meetingLink}
            onChange={update('meetingLink')}
          />
        </Field>
      )}

      <Field
        label="Learning objective"
        htmlFor="session-objective"
        hint="What should members be able to do after this session?"
      >
        <TextInput
          id="session-objective"
          value={form.learningObjective}
          onChange={update('learningObjective')}
          placeholder="Understand useState and useEffect by building a small example"
          maxLength={300}
        />
      </Field>

      <Field
        label="Agenda"
        htmlFor="session-agenda"
        hint="One point per line — they are numbered automatically."
      >
        <TextArea
          id="session-agenda"
          rows={5}
          value={form.agenda}
          onChange={update('agenda')}
          placeholder={'1. useState basics\n2. useEffect and dependency array\n3. Custom hooks\n4. Practical exercise'}
        />
      </Field>

      <Field label="Topics covered" htmlFor="session-topics" hint="Separate with commas, e.g. Hooks, State, Effects">
        <TextInput
          id="session-topics"
          value={form.topics}
          onChange={update('topics')}
          placeholder="useState, useEffect, Custom Hooks"
        />
      </Field>

      <Field label="Expected outcome" htmlFor="session-outcome">
        <TextInput
          id="session-outcome"
          value={form.expectedOutcome}
          onChange={update('expectedOutcome')}
          placeholder="Every member can build a component that fetches data"
          maxLength={300}
        />
      </Field>

      <Field label="Notes (optional)" htmlFor="session-notes">
        <TextArea
          id="session-notes"
          rows={2}
          value={form.notes}
          onChange={update('notes')}
          placeholder="Bring laptops, install Node.js before the session…"
          maxLength={400}
        />
      </Field>

      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && <span className="btn-spinner" />}
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

/** Convert an API session document back into the form shape (for editing). */
export const sessionToForm = (session) => ({
  title: session.title || '',
  learningObjective: session.learningObjective || '',
  agenda: (session.agenda || []).join('\n'),
  topics: (session.topics || []).join(', '),
  expectedOutcome: session.expectedOutcome || '',
  date: toDateInput(session.date),
  startTime: session.startTime || '18:00',
  duration: session.duration || 60,
  meetingLink: session.meetingLink || '',
  notes: session.notes || '',
  status: session.status || 'Upcoming',
});

export default SessionForm;
