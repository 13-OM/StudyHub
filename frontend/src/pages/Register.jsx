import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { Field, Select, TextInput } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { COURSES, SKILL_LEVELS } from '../utils/constants';
import { isValid, validateRegister } from '../utils/validation';
import { IconCheck, IconEye, IconMoon, IconSun, IconUsers } from '../components/Icons';

/**
 * Register page — creates the student account and logs the user in
 * immediately (the API returns a JWT together with the new user).
 */
const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: '',
    skillLevel: 'Beginner',
    interests: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateRegister(form);
    setErrors(validationErrors);
    if (!isValid(validationErrors)) return;

    setSubmitting(true);
    try {
      const response = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        course: form.course,
        skillLevel: form.skillLevel,
        interests: form.interests,
      });
      toast.success(response.message || 'Registration successful. Welcome to StudyHub!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrors({ form: error.message });
      toast.error(error.message || 'Unable to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const passwordStrength = (() => {
    const value = form.password;
    if (!value) return { label: '', percent: 0, variant: '' };
    let score = 0;
    if (value.length >= 6) score += 34;
    if (value.length >= 10) score += 20;
    if (/[A-Z]/.test(value)) score += 15;
    if (/\d/.test(value)) score += 15;
    if (/[^A-Za-z0-9]/.test(value)) score += 16;
    const percent = Math.min(score, 100);
    if (percent < 45) return { label: 'Weak password', percent, variant: 'danger' };
    if (percent < 75) return { label: 'Fair password', percent, variant: 'warning' };
    return { label: 'Strong password', percent, variant: 'success' };
  })();

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <span className="hero-badge" style={{ background: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff', width: 'fit-content' }}>
          Join 100+ students
        </span>
        <h2 style={{ marginTop: 22 }}>Create your account and find your study group today.</h2>
        <p>
          StudyHub connects you with classmates who are studying the same subjects at the
          same pace — so nobody has to prepare alone.
        </p>

        <ul className="auth-points">
          {[
            'Free forever for students',
            'Create unlimited study groups',
            'Join requests approved by owners',
            'Attendance and progress tracking',
          ].map((point) => (
            <li key={point}>
              <span className="tick"><IconCheck size={14} strokeWidth={3} /></span>
              {point}
            </li>
          ))}
        </ul>

        <div className="row" style={{ gap: 10, marginTop: 32, color: 'rgba(255,255,255,0.92)', fontSize: '0.85rem' }}>
          <IconUsers size={18} />
          Already have an account? <Link to="/login" style={{ color: '#fff', textDecoration: 'underline' }}>Login here</Link>
        </div>
      </aside>

      <section className="auth-form-side">
        <div className="auth-card">
          <div className="row-between" style={{ marginBottom: 22 }}>
            <Logo />
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <IconSun /> : <IconMoon />}
            </button>
          </div>

          <h1>Create your account</h1>
          <p className="sub">It takes less than a minute. All fields marked * are required.</p>

          {errors.form && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: 18 }}>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid" noValidate>
            <Field label="Full name" htmlFor="reg-name" error={errors.name} required>
              <TextInput
                id="reg-name"
                value={form.name}
                error={errors.name}
                onChange={update('name')}
                placeholder="e.g. Om Bhatt"
                autoComplete="name"
              />
            </Field>

            <Field label="Email address" htmlFor="reg-email" error={errors.email} required>
              <TextInput
                id="reg-email"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={update('email')}
                placeholder="you@college.edu"
                autoComplete="email"
              />
            </Field>

            <div className="form-grid cols-2">
              <Field label="Password" htmlFor="reg-password" error={errors.password} required>
                <div style={{ position: 'relative' }}>
                  <TextInput
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    error={errors.password}
                    onChange={update('password')}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    style={{ paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-faint)', padding: 6,
                    }}
                  >
                    <IconEye size={16} />
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop: 7 }}>
                    <div className={`progress ${passwordStrength.variant}`} style={{ height: 5 }}>
                      <span style={{ width: `${passwordStrength.percent}%` }} />
                    </div>
                    <span className="hint">{passwordStrength.label}</span>
                  </div>
                )}
              </Field>

              <Field label="Confirm password" htmlFor="reg-confirm" error={errors.confirmPassword} required>
                <TextInput
                  id="reg-confirm"
                  type="password"
                  value={form.confirmPassword}
                  error={errors.confirmPassword}
                  onChange={update('confirmPassword')}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </Field>
            </div>

            <div className="form-grid cols-2">
              <Field label="Course" htmlFor="reg-course" error={errors.course} required>
                <Select id="reg-course" value={form.course} error={errors.course} onChange={update('course')}>
                  <option value="">Select your course…</option>
                  {COURSES.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Skill level" htmlFor="reg-skill" error={errors.skillLevel}>
                <Select id="reg-skill" value={form.skillLevel} onChange={update('skillLevel')}>
                  {SKILL_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field
              label="Interests (optional)"
              htmlFor="reg-interests"
              hint="Comma separated — used to recommend groups, e.g. React, Data Structures, DBMS"
            >
              <TextInput
                id="reg-interests"
                value={form.interests}
                onChange={update('interests')}
                placeholder="Web Development, Data Structures, AI"
              />
            </Field>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting && <span className="btn-spinner" />}
              {submitting ? 'Creating your account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-muted text-center" style={{ marginTop: 20 }}>
            Already registered? <Link to="/login" className="font-semibold">Login instead</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
