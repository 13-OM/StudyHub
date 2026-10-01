import { useState } from 'react';
import { Field, Select, TextInput, TextArea } from './ui';
import { RESOURCE_TYPES } from '../utils/constants';
import { isValid, validateResource } from '../utils/validation';

/** ResourceForm — share or edit a study resource. */
const EMPTY_RESOURCE = { title: '', type: 'Notes', url: '', description: '' };

const ResourceForm = ({ initialValues, onSubmit, submitting = false, submitLabel = 'Share resource', groups = [], showGroupPicker = false }) => {
  const [form, setForm] = useState({ ...EMPTY_RESOURCE, ...initialValues });
  const [errors, setErrors] = useState({});

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateResource(form);
    if (showGroupPicker && !form.groupId) validationErrors.groupId = 'Please choose a group';
    setErrors(validationErrors);
    if (!isValid(validationErrors)) return;

    onSubmit({
      title: form.title.trim(),
      type: form.type,
      url: form.url.trim(),
      description: form.description.trim(),
      ...(showGroupPicker ? { groupId: form.groupId } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      {showGroupPicker && (
        <Field label="Study group" htmlFor="resource-group" error={errors.groupId} required>
          <Select
            id="resource-group"
            value={form.groupId || ''}
            error={errors.groupId}
            onChange={update('groupId')}
          >
            <option value="">Choose a group…</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>{group.name}</option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Title" htmlFor="resource-title" error={errors.title} required>
        <TextInput
          id="resource-title"
          value={form.title}
          error={errors.title}
          onChange={update('title')}
          placeholder="e.g. React Hooks Official Notes"
          maxLength={120}
        />
      </Field>

      <div className="form-grid cols-2">
        <Field label="Type" htmlFor="resource-type" error={errors.type} required>
          <Select id="resource-type" value={form.type} onChange={update('type')}>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
        </Field>

        <Field label="URL" htmlFor="resource-url" error={errors.url} required>
          <TextInput
            id="resource-url"
            value={form.url}
            error={errors.url}
            onChange={update('url')}
            placeholder="https://react.dev/learn"
          />
        </Field>
      </div>

      <Field label="Description (optional)" htmlFor="resource-description">
        <TextArea
          id="resource-description"
          rows={3}
          value={form.description}
          onChange={update('description')}
          placeholder="Why is this useful for the group?"
          maxLength={300}
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

export default ResourceForm;
