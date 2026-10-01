import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { Field, TextInput } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { isValid, validateLogin } from '../utils/validation';
import { IconCheck, IconEye, IconMoon, IconSun } from '../components/Icons';

/** Login page — email + password, sends the credentials to POST /api/auth/login. */
const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateLogin(form);
    setErrors(validationErrors);
    if (!isValid(validationErrors)) return;

    setSubmitting(true);
    try {
      const response = await login(form.email.trim(), form.password);
      toast.success(response.message || 'Logged in successfully');
      navigate(from, { replace: true });
    } catch (error) {
      // Backend answers 401 with "Invalid email or password."
      setErrors({ form: error.message });
      toast.error(error.message || 'Unable to login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (email) => {
    setForm({ email, password: 'studyhub123' });
    setErrors({});
    toast.info(`Demo credentials for ${email} filled in — press Login.`);
  };

  return (
    <div className="auth-wrap">
      {/* Left marketing panel */}
      <aside className="auth-aside">
        <span className="hero-badge" style={{ background: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff', width: 'fit-content' }}>
          Welcome back to StudyHub
        </span>
        <h2 style={{ marginTop: 22 }}>Pick up where your study group left off.</h2>
        <p>
          Sign in to see your upcoming sessions, pending join requests, shared resources and
          attendance history.
        </p>

        <ul className="auth-points">
          {[
            'Track every session and agenda',
            'Approve or reject join requests',
            'Mark and review attendance',
            'Keep all study resources together',
          ].map((point) => (
            <li key={point}>
              <span className="tick"><IconCheck size={14} strokeWidth={3} /></span>
              {point}
            </li>
          ))}
        </ul>

        <div className="card" style={{ marginTop: 34, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', padding: 16, boxShadow: 'none' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.95)' }}>
            <strong>Demo accounts</strong> — all use the password <code style={{ color: '#fff' }}>studyhub123</code>
          </p>
          <div className="row-wrap" style={{ gap: 7, marginTop: 10 }}>
            {['om@studyhub.com', 'rahul@studyhub.com', 'priya@studyhub.com'].map((email) => (
              <button
                key={email}
                type="button"
                onClick={() => fillDemoAccount(email)}
                className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--brand-700)', border: 'none' }}
              >
                {email.split('@')[0]}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right form panel */}
      <section className="auth-form-side">
        <div className="auth-card">
          <div className="row-between" style={{ marginBottom: 26 }}>
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

          <h1>Welcome back 👋</h1>
          <p className="sub">Login to continue to your StudyHub dashboard.</p>

          {errors.form && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: 18 }}>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid" noValidate>
            <Field label="Email address" htmlFor="login-email" error={errors.email} required>
              <TextInput
                id="login-email"
                type="email"
                autoComplete="email"
                value={form.email}
                error={errors.email}
                onChange={update('email')}
                placeholder="you@college.edu"
              />
            </Field>

            <Field label="Password" htmlFor="login-password" error={errors.password} required>
              <div style={{ position: 'relative' }}>
                <TextInput
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  error={errors.password}
                  onChange={update('password')}
                  placeholder="••••••••"
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
            </Field>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
              {submitting && <span className="btn-spinner" />}
              {submitting ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <p className="text-sm text-muted text-center" style={{ marginTop: 22 }}>
            Don&apos;t have an account? <Link to="/register" className="font-semibold">Create one now</Link>
          </p>
          <p className="text-sm text-center" style={{ marginTop: 6 }}>
            <Link to="/" className="text-muted">← Back to home</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
