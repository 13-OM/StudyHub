import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { statsService } from '../services';
import { Avatar, AvatarStack } from '../components/ui';
import {
  IconArrowRight, IconBarChart, IconBook, IconCalendarCheck, IconCheck, IconCheckSquare,
  IconGraduation, IconMegaphone, IconSearch, IconShield, IconSparkles, IconTarget, IconUsers,
} from '../components/Icons';

/** The four feature highlights of the platform. */
const FEATURES = [
  {
    icon: <IconSearch size={22} />,
    title: 'Discover study groups',
    text: 'Search and filter groups by course, subject, topic, skill level and weekly schedule to find students who are learning the same thing as you.',
  },
  {
    icon: <IconCalendarCheck size={22} />,
    title: 'Plan focused sessions',
    text: 'Schedule sessions with a clear agenda, learning objective and expected outcome, so every meeting has a purpose.',
  },
  {
    icon: <IconCheckSquare size={22} />,
    title: 'Track attendance',
    text: 'Mark attendance after each session and watch your personal attendance rate grow throughout the semester.',
  },
  {
    icon: <IconBook size={22} />,
    title: 'Share resources',
    text: 'Keep notes, videos, articles and practice sheets in one place so the whole group studies from the same material.',
  },
  {
    icon: <IconMegaphone size={22} />,
    title: 'Stay informed',
    text: 'Group owners post announcements for schedule changes, exam reminders and session updates.',
  },
  {
    icon: <IconBarChart size={22} />,
    title: 'See your progress',
    text: 'A simple dashboard shows your groups, upcoming sessions, completed sessions and attendance at a glance.',
  },
];

const STEPS = [
  { title: 'Create your account', text: 'Register with your course, skill level and subjects of interest in under a minute.' },
  { title: 'Join or create a group', text: 'Send a join request to an existing group or start your own and invite your classmates.' },
  { title: 'Study together', text: 'Meet for scheduled sessions, follow the agenda, and mark attendance after each meeting.' },
  { title: 'Track your growth', text: 'Review your session history, attendance rate and shared resources any time.' },
];

/** A small illustrative product preview used inside the hero section. */
const HeroPreview = () => (
  <div className="hero-visual" aria-hidden="true">
    <div className="row-between" style={{ marginBottom: 14 }}>
      <span className="row" style={{ gap: 8 }}>
        <span className="brand-mark" style={{ width: 30, height: 30 }}>
          <IconGraduation size={16} />
        </span>
        <strong style={{ fontSize: '0.9rem' }}>React Study Circle</strong>
      </span>
      <span className="badge badge-success">Active</span>
    </div>

    <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
      {[
        { label: 'Members', value: '3/8' },
        { label: 'Sessions', value: '3' },
        { label: 'Attendance', value: '92%' },
      ].map((item) => (
        <div key={item.label} className="info-tile" style={{ padding: '10px 12px' }}>
          <div className="it-label">{item.label}</div>
          <div className="it-value">{item.value}</div>
        </div>
      ))}
    </div>

    <div className="stack" style={{ gap: 10 }}>
      {[
        { title: 'React Hooks Deep Dive', when: 'Tomorrow · 6:00 PM', status: 'Upcoming', variant: 'badge-brand' },
        { title: 'Components & Props', when: '05 Oct · 6:00 PM', status: 'Completed', variant: 'badge-success' },
      ].map((session) => (
        <div key={session.title} className="list-item" style={{ padding: '11px 13px' }}>
          <span className="li-icon" style={{ width: 34, height: 34 }}>
            <IconCalendarCheck size={17} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span className="li-title truncate">{session.title}</span>
            <span className="li-sub">{session.when}</span>
          </span>
          <span className={`badge ${session.variant}`}>{session.status}</span>
        </div>
      ))}
    </div>

    <div className="row-between" style={{ marginTop: 14, paddingTop: 13, borderTop: '1px dashed var(--border)' }}>
      <span className="row" style={{ gap: 9 }}>
        <AvatarStack
          users={[
            { _id: '1', name: 'Om Bhatt', avatarColor: '#4f46e5' },
            { _id: '2', name: 'Rahul Patel', avatarColor: '#7c3aed' },
            { _id: '3', name: 'Aarav Desai', avatarColor: '#059669' },
            { _id: '4', name: 'Priya Mehta', avatarColor: '#db2777' },
          ]}
          max={4}
        />
        <span className="text-xs text-muted">+6 students learning together</span>
      </span>
      <span className="badge badge-violet">
        <IconSparkles size={12} /> Weekly
      </span>
    </div>
  </div>
);

const Landing = () => {
  const [data, setData] = useState(null);

  // Public statistics (students / groups / sessions / resources)
  useEffect(() => {
    statsService
      .publicStats()
      .then((response) => setData(response.data))
      .catch(() => setData(null));
  }, []);

  const stats = data?.stats || { students: 120, groups: 24, sessions: 86, resources: 140 };
  const popular = data?.popularSubjects || [];
  const featured = data?.featuredGroups || [];

  return (
    <>
      {/* ------------------------------- HERO ------------------------------- */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="hero-badge">
              <IconSparkles size={14} /> Study Group Formation &amp; Management Platform
            </span>

            <h1>
              STUDY<span className="gradient-text">HUB</span>
              <br />
              Learn Better. Together.
            </h1>

            <p className="lead">
              Find students with similar interests, create focused study groups, schedule
              collaborative sessions and track your learning journey — all in one clean
              dashboard.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                Explore Study Groups <IconArrowRight size={17} />
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Create Account
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hs-value mono">{stats.students}</div>
                <div className="hs-label">Students registered</div>
              </div>
              <div className="hero-stat">
                <div className="hs-value mono">{stats.groups}</div>
                <div className="hs-label">Active study groups</div>
              </div>
              <div className="hero-stat">
                <div className="hs-value mono">{stats.sessions}</div>
                <div className="hs-label">Study sessions</div>
              </div>
            </div>
          </div>

          <HeroPreview />
        </div>
      </section>

      {/* ----------------------------- FEATURES ----------------------------- */}
      <section className="section" id="features">
        <div className="section-head">
          <p className="eyebrow">Why StudyHub</p>
          <h2>Everything you need to study as a team</h2>
          <p>
            Built around the way college students actually study — small groups,
            regular sessions and shared notes.
          </p>
        </div>

        <div className="grid grid-3">
          {FEATURES.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* --------------------------- HOW IT WORKS --------------------------- */}
      <section className="section alt" id="how-it-works">
        <div className="section-inner">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>From registration to your first session in four steps</h2>
            <p>No complicated setup. Register, find your group and start learning.</p>
          </div>

          <div className="grid grid-4">
            {STEPS.map((step, index) => (
              <article className="step-card" key={step.title}>
                <div className="step-number">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- SUBJECTS ----------------------------- */}
      <section className="section" id="subjects">
        <div className="section-head">
          <p className="eyebrow">Popular subjects</p>
          <h2>Study groups across the engineering curriculum</h2>
          <p>From web development to computer networks — join a group that matches your syllabus.</p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {(popular.length > 0
            ? popular
            : [
              { name: 'Web Application Development', groups: 4, members: 12 },
              { name: 'Data Structures', groups: 2, members: 6 },
              { name: 'Database Management System', groups: 2, members: 5 },
              { name: 'Computer Networks', groups: 1, members: 3 },
            ]
          ).slice(0, 8).map((subject) => (
            <div className="subject-tile" key={subject.name}>
              <span className="st-icon"><IconBook size={19} /></span>
              <span style={{ minWidth: 0 }}>
                <span className="st-name" style={{ display: 'block' }}>{subject.name}</span>
                <span className="st-count">
                  {subject.groups} group{subject.groups === 1 ? '' : 's'} · {subject.members} members
                </span>
              </span>
            </div>
          ))}
        </div>

        {featured.length > 0 && (
          <>
            <div className="section-head" style={{ marginTop: 54, marginBottom: 30 }}>
              <h2 style={{ fontSize: '1.35rem' }}>Recently created groups</h2>
            </div>
            <div className="grid grid-3">
              {featured.slice(0, 3).map((group) => (
                <article className="card card-pad" key={group._id}>
                  <div className="row-between" style={{ alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>{group.name}</h3>
                    <span className="badge badge-brand">{group.skillLevel}</span>
                  </div>
                  <p className="text-xs text-muted" style={{ margin: '6px 0 12px' }}>
                    {group.subject} · {group.topic}
                  </p>
                  <div className="row" style={{ gap: 9 }}>
                    <Avatar
                      name={group.createdBy?.name}
                      color={group.createdBy?.avatarColor}
                      size="sm"
                    />
                    <span className="text-xs text-muted">
                      {group.createdBy?.name} · {group.memberCount}/{group.maxCapacity} members
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ------------------------------- STATS ------------------------------ */}
      <section className="alt" style={{ padding: '10px 0' }}>
        <div className="stat-band">
          {[
            { value: stats.students, label: 'Registered students' },
            { value: stats.groups, label: 'Active study groups' },
            { value: stats.sessions, label: 'Sessions scheduled' },
            { value: stats.resources, label: 'Resources shared' },
          ].map((item) => (
            <div className="band-item" key={item.label}>
              <div className="band-value mono">{item.value}</div>
              <div className="band-label">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- TRUST / CTA ---------------------------- */}
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="grid grid-3" style={{ marginBottom: 54 }}>
          {[
            { icon: <IconShield size={20} />, title: 'Secure by design', text: 'Passwords are hashed with bcrypt and every request is protected with JWT authentication.' },
            { icon: <IconUsers size={20} />, title: 'Owner controlled', text: 'Only the group owner can approve join requests, manage members and post announcements.' },
            { icon: <IconTarget size={20} />, title: 'Built for learning', text: 'Session plans, agendas and attendance keep every group focused on actual studying.' },
          ].map((item) => (
            <div className="row" key={item.title} style={{ alignItems: 'flex-start', gap: 13 }}>
              <span className="badge badge-brand" style={{ padding: 9, borderRadius: 11 }}>{item.icon}</span>
              <span>
                <h3 style={{ fontSize: '0.98rem', margin: '0 0 4px' }}>{item.title}</h3>
                <p className="text-sm text-muted" style={{ margin: 0 }}>{item.text}</p>
              </span>
            </div>
          ))}
        </div>

        <div className="cta-band">
          <h2>Ready to find your study group?</h2>
          <p>
            Create a free account, browse open groups and send your first join request in
            under two minutes.
          </p>
          <div className="row" style={{ justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--brand-700)' }}>
              Get started free <IconArrowRight size={17} />
            </Link>
            <Link
              to="/login"
              className="btn btn-lg"
              style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}
            >
              I already have an account
            </Link>
          </div>

          <div className="row" style={{ justifyContent: 'center', gap: 22, marginTop: 26, flexWrap: 'wrap', fontSize: '0.85rem' }}>
            {['Free for students', 'No installation required', 'Works on mobile'].map((item) => (
              <span key={item} className="row" style={{ gap: 7 }}>
                <IconCheck size={15} strokeWidth={3} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Landing;
