import { useState } from 'react';
import { Field, Select, TextArea, TextInput } from './ui';
import { COURSES, SKILL_LEVELS, TIME_SLOTS, WEEK_DAYS } from '../utils/constants';
import { isValid, validateGroup } from '../utils/validation';

/**
 * GroupForm — used both on the "Create study group" page and inside the
 * "Edit group" modal on the group details page.
 *
 * Props:
 *   initialValues : pre-filled values when editing
 *   onSubmit      : async (values) => void   (parent performs the API call)
 *   submitting    : shows a loading state on the button
 *   submitLabel   : "Create group" / "Save changes"
 */
const EMPTY_GROUP = {
  name: '',
  subject: '',
  topic: '',
  course: '',
  skillLevel: 'Beginner',
  maxCapacity: 6,
  day: 'Monday',
  time: 'Evening',
  description: '',
};

const GroupForm = ({ initialValues, onSubmit, submitting = false, submitLabel = 'Create group', subjects = [] }) => {
  const [form, setForm] = useState({ ...EMPTY_GROUP, ...initialValues });
  const [errors, setErrors] = useState({});

  const update = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
    // remove the error of the field being edited
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateGroup(form);
    setErrors(validationErrors);
    if (!isValid(validationErrors)) return;

    // Convert the flat form into the shape the API expects
    onSubmit({
      name: form.name.trim(),
      subject: form.subject.trim(),
      topic: form.topic.trim(),
      course: form.course,
      skillLevel: form.skillLevel,
      maxCapacity: Number(form.maxCapacity),
      schedule: { day: form.day, time: form.time },
      description: form.description.trim(),
    });
  };

  const subjectOptions = subjects.length
    ? subjects.map((subject) => subject.name || subject)
    : [];

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      <Field label="Group name" htmlFor="group-name" error={errors.name} required>
        <TextInput
          id="group-name"
          value={form.name}
          error={errors.name}
          onChange={update('name')}
          placeholder="e.g. React Study Circle"
          maxLength={80}
        />
      </Field>

      <div className="form-grid cols-2">
        <Field label="Subject" htmlFor="group-subject" error={errors.subject} required>
          <TextInput
            id="group-subject"
            value={form.subject}
            error={errors.subject}
            onChange={update('subject')}
            placeholder="e.g. Web Application Development"
            list="subject-options"
          />
          <datalist id="subject-options">
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>
        </Field>

        <Field label="Topic" htmlFor="group-topic" error={errors.topic} required>
          <TextInput
            id="group-topic"
            value={form.topic}
            error={errors.topic}
            onChange={update('topic')}
            placeholder="e.g. React Hooks & State"
          />
        </Field>
      </div>

      <div className="form-grid cols-2">
        <Field label="Course" htmlFor="group-course" error={errors.course} required>
          <Select id="group-course" value={form.course} error={errors.course} onChange={update('course')}>
            <option value="">Select a course…</option>
            {COURSES.map((course) => (
              <option key={course} value={course}>{course}</option>
            ))}
          </Select>
        </Field>

        <Field label="Skill level" htmlFor="group-skill" error={errors.skillLevel} required>
          <Select id="group-skill" value={form.skillLevel} onChange={update('skillLevel')}>
            {SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="form-grid cols-2">
        <Field
          label="Maximum capacity"
          htmlFor="group-capacity"
          error={errors.maxCapacity}
          hint="Between 2 and 50 students"
          required
        >
          <TextInput
            id="group-capacity"
            type="number"
            min={2}
            max={50}
            value={form.maxCapacity}
            error={errors.maxCapacity}
            onChange={update('maxCapacity')}
          />
        </Field>

        <Field label="Preferred day" htmlFor="group-day" error={errors.day} required>
          <Select id="group-day" value={form.day} onChange={update('day')}>
            {WEEK_DAYS.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Preferred time" htmlFor="group-time" error={errors.time} required>
        <div className="row-wrap" style={{ gap: 8 }}>
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              className={`chip ${form.time === slot ? 'active' : ''}`}
              onClick={() => setForm((current) => ({ ...current, time: slot }))}
            >
              {slot}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Description"
        htmlFor="group-description"
        error={errors.description}
        hint={`${form.description.trim().length}/600 characters — describe the goal, meeting style and who should join.`}
        required
      >
        <TextArea
          id="group-description"
          rows={5}
          value={form.description}
          error={errors.description}
          onChange={update('description')}
          maxLength={600}
          placeholder="We meet every week to practise React components, hooks and build a small project together."
        />
      </Field>

      <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && <span className="btn-spinner" />}
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default GroupForm;
