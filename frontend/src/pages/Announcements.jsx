import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { announcementService, groupService } from '../services';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementForm from '../components/AnnouncementForm';
import { ConfirmDialog, EmptyState, Modal, RowSkeletonList, Tabs } from '../components/ui';
import { IconAlert, IconMegaphone, IconPlus } from '../components/Icons';

/**
 * Announcements — a consolidated feed of announcements from every group the
 * student belongs to. Owners can post, edit and delete their own announcements.
 */
const Announcements = () => {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [modal, setModal] = useState({ open: false, item: null });
  const [confirm, setConfirm] = useState({ open: false, item: null });
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState('');

  const { data, loading, error, reload } = useApi(() => announcementService.mine(), []);
  const { data: myGroupData } = useApi(() => groupService.myGroups(), []);

  const announcements = data?.data?.announcements || [];
  const myOwnedGroups = myGroupData?.data?.created || [];

  const ownedGroupIds = useMemo(
    () => new Set(myOwnedGroups.map((group) => group._id)),
    [myOwnedGroups]
  );

  const filtered = tab === 'all'
    ? announcements
    : tab === 'mine'
      ? announcements.filter((item) => ownedGroupIds.has(item.group?._id))
      : announcements.filter((item) => !ownedGroupIds.has(item.group?._id));

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (modal.item) {
        const response = await announcementService.update(modal.item._id, values);
        toast.success('Announcement updated successfully');
        setModal({ open: false, item: null });
        reload();
        return response;
      }
      const response = await announcementService.create(values.groupId, values);
      toast.success(response.message || 'Announcement posted successfully.');
      setModal({ open: false, item: null });
      reload();
    } catch (err) {
      toast.error(err.message || 'Unable to save the announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setBusy(`delete-${confirm.item._id}`);
    try {
      await announcementService.remove(confirm.item._id);
      toast.success('Announcement deleted successfully');
      setConfirm({ open: false, item: null });
      reload();
    } catch (err) {
      toast.error(err.message || 'Unable to delete the announcement.');
    } finally {
      setSaving(false);
      setBusy('');
    }
  };

  const TABS = [
    { id: 'all', label: 'All announcements', icon: <IconMegaphone size={15} />, count: announcements.length },
    { id: 'mine', label: 'Posted by me', icon: <IconMegaphone size={15} />, count: announcements.filter((a) => ownedGroupIds.has(a.group?._id)).length },
    { id: 'others', label: 'From groups I joined', icon: <IconMegaphone size={15} />, count: announcements.filter((a) => !ownedGroupIds.has(a.group?._id)).length },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">
            Important updates posted by group owners across your study groups.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={myOwnedGroups.length === 0}
          onClick={() => setModal({ open: true, item: null })}
        >
          <IconPlus size={16} /> Post announcement
        </button>
      </div>

      {myOwnedGroups.length === 0 && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          <IconAlert size={18} />
          <span>
            Only group owners can post announcements. You can create your own group from the{' '}
            <Link to="/groups/create">create group</Link> page.
          </span>
        </div>
      )}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div style={{ marginTop: 22 }}>
        {error ? (
          <div className="alert alert-danger">
            <IconAlert size={18} />
            <span>{error.message}</span>
          </div>
        ) : loading ? (
          <RowSkeletonList count={4} />
        ) : filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<IconMegaphone size={24} />}
              title="No announcements yet."
              message={
                myOwnedGroups.length > 0
                  ? 'Post an announcement to inform your group members about schedule changes or important updates.'
                  : 'Announcements posted by the owners of your groups will appear here.'
              }
              action={
                myOwnedGroups.length > 0 ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setModal({ open: true, item: null })}
                  >
                    <IconPlus size={15} /> Post announcement
                  </button>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="grid grid-2">
            {filtered.map((announcement) => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
                canManage={ownedGroupIds.has(announcement.group?._id)}
                busy={busy}
                onEdit={(item) => setModal({ open: true, item })}
                onDelete={(item) => setConfirm({ open: true, item })}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modal.open}
        title={modal.item ? 'Edit announcement' : 'Post an announcement'}
        onClose={() => !saving && setModal({ open: false, item: null })}
      >
        <AnnouncementForm
          groups={myOwnedGroups}
          showGroupPicker={!modal.item}
          initialValues={modal.item ? { title: modal.item.title, message: modal.item.message } : undefined}
          onSubmit={handleSave}
          submitting={saving}
          submitLabel={modal.item ? 'Save changes' : 'Post announcement'}
        />
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Delete announcement"
        message={`Delete the announcement "${confirm.item?.title}"?`}
        confirmLabel="Delete"
        loading={saving}
        onCancel={() => setConfirm({ open: false, item: null })}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default Announcements;
