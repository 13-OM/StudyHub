import { useState } from 'react';
import { Field, Select, TextInput, TextArea } from './ui';
import { isValid, validateAnnouncement } from '../utils/validation';

/** AnnouncementForm — post or edit an announcement (group owner only). */
const EMPTY = { title: '', message: '' };

const AnnouncementForm = ({ initialValues, onSubmit, submitting = false, submitLabel = 'Post announcement', groups = [], showGroupPicker = false }) => {
  const [form, setForm] = useState({ ...EMPTY, ...initialValues });
  const [errors, setErrors] = useState({});

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateAnnouncement(form);
    if (showGroupPicker && !form.groupId) validationErrors.groupId = 'Please choose a group';
    setErrors(validationErrors);
    if (!isValid(validationErrors)) return;

    onSubmit({
      title: form.title.trim(),
      message: form.message.trim(),
      ...(showGroupPicker ? { groupId: form.groupId } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      {showGroupPicker && (
        <Field label="Study group" htmlFor="announcement-group" error={errors.groupId} required>
          <Select
            id="announcement-group"
            value={form.groupId || ''}
            error={errors.groupId}
            onChange={update('groupId')}
          >
            <option value="">Choose a group you own…</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>{group.name}</option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Title" htmlFor="announcement-title" error={errors.title} required>
        <TextInput
          id="announcement-title"
          value={form.title}
          error={errors.title}
          onChange={update('title')}
          placeholder="e.g. Tomorrow's session moved to 5 PM"
          maxLength={120}
        />
      </Field>

      <Field
        label="Message"
        htmlFor="announcement-message"
        error={errors.message}
        hint={`${form.message.trim().length}/800 characters`}
        required
      >
        <TextArea
          id="announcement-message"
          rows={6}
          value={form.message}
          error={errors.message}
          onChange={update('message')}
          maxLength={800}
          placeholder="Share the details with all group members…"
        />
      </Field>

      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && <span className="btn-spinner" />}
          {submitting ? 'Posting…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
