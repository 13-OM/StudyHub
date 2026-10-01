import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Avatar, Field, LoadingSpinner, ProgressBar, ProgressRing, SectionTitle,
  Select, StatCard, TextInput, TextArea, InfoTile,
} from '../components/ui';
import {
  IconAlert, IconAward, IconBook, IconCalendarCheck, IconLayers, IconLock,
  IconMail, IconTarget, IconUser, IconUsers,
} from '../components/Icons';
import { COURSES, SKILL_LEVELS } from '../utils/constants';
import { isValid, validateProfile } from '../utils/validation';
import { formatDate } from '../utils/format';

/**
 * Profile — the student's own account: details, learning statistics and
 * edits (name, email, course, skill level, interests, bio and password).
 */
const Profile = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const { data, loading, error, reload } = useApi(() => userService.getProfile(), []);
  const [form, setForm] = useState({
    name: '', email: '', course: '', skillLevel: 'Beginner', interests: '', bio: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fill the form once the profile arrives
  useEffect(() => {
    if (data?.data?.user) {
      const profile = data.data.user;
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        course: profile.course || '',
        skillLevel: profile.skillLevel || 'Beginner',
        interests: (profile.interests || []).join(', '),
        bio: profile.bio || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [data]);

  const stats = data?.data?.stats || {};
  const profileUser = data?.data?.user || user;

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const validationErrors = validateProfile(form);
    setErrors(validationErrors);
    if (!isValid(validationErrors)) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        course: form.course,
        skillLevel: form.skillLevel,
        interests: form.interests,
        bio: form.bio.trim(),
      };
      if (form.password) payload.password = form.password;

      const response = await userService.updateProfile(payload);
      toast.success(response.message || 'Profile updated successfully');
      setUser(response.data.user); // refresh the user stored in AuthContext
      setForm((current) => ({ ...current, password: '', confirmPassword: '' }));
      setEditing(false);
      reload();
    } catch (err) {
      toast.error(err.message || 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading your profile…" />;

  if (error) {
    return (
      <EmptyState
        icon={<IconAlert size={24} />}
        title="Could not load your profile"
        message={error.message}
        action={<button type="button" className="btn btn-primary" onClick={reload}>Try again</button>}
      />
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account details and review your learning statistics.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setEditing((value) => !value)}
        >
          {editing ? 'Cancel editing' : 'Edit profile'}
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)' }}>
        {/* ------------------------- Profile card ------------------------- */}
        <aside className="stack" style={{ gap: 18 }}>
          <section className="card card-pad text-center">
            <div style={{ display: 'grid', placeItems: 'center', marginBottom: 14 }}>
              <Avatar name={profileUser?.name} color={profileUser?.avatarColor} size="xl" />
            </div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{profileUser?.name}</h2>
            <p className="text-sm text-muted" style={{ marginBottom: 10 }}>{profileUser?.email}</p>

            <div className="row" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-brand">{profileUser?.course}</span>
              <span className="badge badge-violet">{profileUser?.skillLevel}</span>
            </div>

            <div className="divider" />

            <div className="text-left">
              <div className="it-label">Bio</div>
              <p className="text-sm text-soft" style={{ margin: 0 }}>
                {profileUser?.bio || 'No bio added yet. Click edit profile to introduce yourself.'}
              </p>
            </div>

            <div className="divider" />

            <div className="text-left">
              <div className="it-label">Interests</div>
              <div className="row-wrap" style={{ gap: 6, marginTop: 6 }}>
                {profileUser?.interests?.length ? (
                  profileUser.interests.map((interest) => (
                    <span key={interest} className="badge badge-neutral">{interest}</span>
                  ))
                ) : (
                  <span className="text-sm text-muted">No interests added</span>
                )}
              </div>
            </div>

            <p className="text-xs text-faint" style={{ marginTop: 18, marginBottom: 0 }}>
              Member since {formatDate(profileUser?.createdAt || Date.now())}
            </p>
          </section>

          <section className="card card-pad">
            <h3 style={{ fontSize: '0.98rem', marginBottom: 12 }}>Account</h3>
            <div className="stack" style={{ gap: 10 }}>
              <span className="row text-sm text-muted" style={{ gap: 8 }}>
                <IconMail size={15} /> {profileUser?.email}
              </span>
              <span className="row text-sm text-muted" style={{ gap: 8 }}>
                <IconUser size={15} /> {profileUser?.name}
              </span>
              <span className="row text-sm text-muted" style={{ gap: 8 }}>
                <IconLock size={15} /> Password protected with bcrypt hashing
              </span>
              <span className="row text-sm text-muted" style={{ gap: 8 }}>
                <IconUsers size={15} /> {stats.groupsCreated || 0} groups created · {stats.groupsJoined || 0} joined
              </span>
            </div>
          </section>
        </aside>

        {/* ---------------------- Statistics + edit form ------------------- */}
        <div className="stack" style={{ gap: 18 }}>
          <div className="grid grid-3">
            <StatCard
              label="Groups joined"
              value={stats.totalGroups ?? 0}
              icon={<IconLayers size={19} />}
              foot={<>Created {stats.groupsCreated ?? 0}</>}
            />
            <StatCard
              label="Sessions completed"
              value={stats.sessionsCompleted ?? 0}
              icon={<IconCalendarCheck size={19} />}
              accent="var(--violet-600)"
              accentSoft="var(--violet-50)"
              foot={<>Attended {stats.sessionsAttended ?? 0}</>}
            />
            <StatCard
              label="Attendance rate"
              value={`${stats.attendanceRate ?? 0}%`}
              icon={<IconAward size={19} />}
              accent="var(--success-600)"
              accentSoft="var(--success-50)"
              foot={<>Missed {stats.sessionsMissed ?? 0}</>}
            />
          </div>

          <section className="card card-pad">
            <div className="row-between" style={{ flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>Attendance performance</h3>
                <p className="text-sm text-muted" style={{ margin: 0 }}>
                  {stats.sessionsAttended ?? 0} present out of {stats.sessionsAttended + stats.sessionsMissed || 0} marked sessions
                </p>
              </div>
              <ProgressRing value={stats.attendanceRate ?? 0} size={112} />
            </div>
            <div style={{ marginTop: 14 }}>
              <ProgressBar
                value={stats.attendanceRate ?? 0}
                variant={(stats.attendanceRate ?? 0) >= 75 ? 'success' : 'warning'}
              />
            </div>
          </section>

          <section className="card card-pad">
            <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>Learning summary</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <InfoTile label="Groups created" value={stats.groupsCreated ?? 0} />
              <InfoTile label="Groups joined" value={stats.groupsJoined ?? 0} />
              <InfoTile label="Sessions attended" value={stats.sessionsAttended ?? 0} />
              <InfoTile label="Sessions missed" value={stats.sessionsMissed ?? 0} />
              <InfoTile label="Resources shared" value={stats.resourcesShared ?? 0} />
              <InfoTile label="Skill level" value={profileUser?.skillLevel || '—'} />
            </div>
          </section>

          {editing && (
            <section className="card card-pad">
              <h3 style={{ fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconTarget size={18} /> Edit your details
              </h3>

              <form onSubmit={handleSave} className="form-grid" noValidate>
                <div className="form-grid cols-2">
                  <Field label="Full name" htmlFor="profile-name" error={errors.name} required>
                    <TextInput
                      id="profile-name"
                      value={form.name}
                      error={errors.name}
                      onChange={update('name')}
                    />
                  </Field>

                  <Field label="Email address" htmlFor="profile-email" error={errors.email} required>
                    <TextInput
                      id="profile-email"
                      type="email"
                      value={form.email}
                      error={errors.email}
                      onChange={update('email')}
                    />
                  </Field>
                </div>

                <div className="form-grid cols-2">
                  <Field label="Course" htmlFor="profile-course" error={errors.course} required>
                    <Select id="profile-course" value={form.course} error={errors.course} onChange={update('course')}>
                      <option value="">Select your course…</option>
                      {COURSES.map((course) => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Skill level" htmlFor="profile-skill">
                    <Select id="profile-skill" value={form.skillLevel} onChange={update('skillLevel')}>
                      {SKILL_LEVELS.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field label="Interests" htmlFor="profile-interests" hint="Separate with commas">
                  <TextInput
                    id="profile-interests"
                    value={form.interests}
                    onChange={update('interests')}
                    placeholder="Web Development, Data Structures, AI"
                  />
                </Field>

                <Field label="Bio" htmlFor="profile-bio" hint={`${form.bio.length}/300 characters`}>
                  <TextArea
                    id="profile-bio"
                    rows={3}
                    maxLength={300}
                    value={form.bio}
                    onChange={update('bio')}
                    placeholder="Tell other students what you are studying and how you like to learn."
                  />
                </Field>

                <div className="divider" />

                <div className="form-grid cols-2">
                  <Field
                    label="New password"
                    htmlFor="profile-password"
                    error={errors.password}
                    hint="Leave blank to keep your current password"
                  >
                    <TextInput
                      id="profile-password"
                      type="password"
                      value={form.password}
                      error={errors.password}
                      onChange={update('password')}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </Field>

                  <Field label="Confirm new password" htmlFor="profile-confirm" error={errors.confirmPassword}>
                    <TextInput
                      id="profile-confirm"
                      type="password"
                      value={form.confirmPassword}
                      error={errors.confirmPassword}
                      onChange={update('confirmPassword')}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </Field>
                </div>

                <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="btn-spinner" />}
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="card card-pad">
            <SectionTitle title="Quick links" icon={<IconBook size={17} />} />
            <div className="row-wrap" style={{ gap: 10 }}>
              <Link to="/my-groups" className="btn btn-secondary btn-sm">My groups</Link>
              <Link to="/sessions" className="btn btn-secondary btn-sm">My sessions</Link>
              <Link to="/attendance" className="btn btn-secondary btn-sm">Attendance</Link>
              <Link to="/resources" className="btn btn-secondary btn-sm">Resources</Link>
              <Link to="/groups/create" className="btn btn-primary btn-sm">Create new group</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Profile;
