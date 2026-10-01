import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { groupService, statsService } from '../services';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import GroupForm from '../components/GroupForm';
import { IconInfo, IconLayers, IconShield, IconUsers } from '../components/Icons';

/** Create Group — full form with validation, then redirect to the new group. */
const CreateGroup = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { data: subjectData } = useApi(() => statsService.subjects(), []);
  const subjects = subjectData?.data?.subjects || [];

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      const response = await groupService.create(values);
      const group = response.data.group;
      toast.success('Study group created successfully.');
      navigate(`/groups/${group._id}`);
    } catch (error) {
      // Server validation errors are also shown as a toast
      toast.error(error.message || 'Unable to create group.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Create a study group</h1>
          <p className="page-subtitle">
            You become the group owner and can approve join requests, schedule sessions and post
            announcements.
          </p>
        </div>
        <Link to="/groups" className="btn btn-secondary">Back to browse</Link>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
        <section className="card card-pad">
          <h2 style={{ fontSize: '1.05rem', marginBottom: 18 }}>Group information</h2>
          <GroupForm
            subjects={subjects}
            onSubmit={handleCreate}
            submitting={submitting}
            submitLabel="Create group"
          />
        </section>

        <aside className="stack" style={{ gap: 16 }}>
          <div className="card card-pad">
            <h3 style={{ fontSize: '0.98rem' }}>As the owner you can</h3>
            <ul className="stack" style={{ gap: 12, marginTop: 14 }}>
              {[
                { icon: <IconUsers size={17} />, text: 'Approve or reject join requests' },
                { icon: <IconLayers size={17} />, text: 'Remove members who are inactive' },
                { icon: <IconInfo size={17} />, text: 'Edit group details and capacity' },
                { icon: <IconShield size={17} />, text: 'Schedule sessions and mark attendance' },
              ].map((item) => (
                <li key={item.text} className="row" style={{ gap: 11, alignItems: 'flex-start' }}>
                  <span className="badge badge-brand" style={{ padding: 8, borderRadius: 10 }}>
                    {item.icon}
                  </span>
                  <span className="text-sm text-soft">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="alert alert-info">
            <IconInfo size={18} />
            <span>
              <strong>Tip:</strong> a capacity between 4 and 8 members works best for regular
              study sessions. You can change it later.
            </span>
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: '0.98rem', marginBottom: 10 }}>Good group description</h3>
            <p className="text-sm text-muted" style={{ marginBottom: 10 }}>
              Mention what you will study, how often you meet and who should join. Example:
            </p>
            <p className="text-sm" style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-soft)' }}>
              &ldquo;We meet every Monday evening to practise React hooks and build one small
              component together. Beginners who know basic JavaScript are welcome.&rdquo;
            </p>
          </div>
        </aside>
      </div>
    </>
  );
};

export default CreateGroup;
