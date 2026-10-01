import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupService, resourceService } from '../services';
import { useApi, useDebounce } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ResourceCard from '../components/ResourceCard';
import ResourceForm from '../components/ResourceForm';
import SearchBar from '../components/SearchBar';
import { CardSkeletonGrid, ConfirmDialog, EmptyState, LoadingSpinner, Modal } from '../components/ui';
import { IconAlert, IconBook, IconPlus, IconSearch } from '../components/Icons';
import { RESOURCE_TYPES } from '../utils/constants';

/**
 * Resources — every resource shared across all the groups of the student,
 * with type filters, search and full CRUD (add / edit / delete).
 */
const Resources = () => {
  const toast = useToast();
  const { user } = useAuth();

  const [typeFilter, setTypeFilter] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);

  const [modal, setModal] = useState({ open: false, resource: null });
  const [confirm, setConfirm] = useState({ open: false, resource: null });
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState('');

  const { data, loading, error, reload } = useApi(() => resourceService.mine(), []);
  const { data: myGroupData } = useApi(() => groupService.myGroups(), []);

  const resources = data?.data?.resources || [];
  const myGroups = useMemo(
    () => [...(myGroupData?.data?.created || []), ...(myGroupData?.data?.joined || [])],
    [myGroupData]
  );

  const filtered = resources.filter((resource) => {
    const matchesType = !typeFilter || resource.type === typeFilter;
    const matchesQuery =
      !debouncedQuery ||
      resource.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      (resource.description || '').toLowerCase().includes(debouncedQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const counts = RESOURCE_TYPES.reduce((acc, type) => {
    acc[type] = resources.filter((resource) => resource.type === type).length;
    return acc;
  }, {});

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (modal.resource) {
        await resourceService.update(modal.resource._id, values);
        toast.success('Resource updated successfully');
        setModal({ open: false, resource: null });
        reload();
        return;
      }
      const response = await resourceService.create(values.groupId, values);
      toast.success(response.message || 'Resource shared successfully.');
      setModal({ open: false, resource: null });
      reload();
    } catch (err) {
      toast.error(err.message || 'Unable to save the resource.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await resourceService.remove(confirm.resource._id);
      toast.success('Resource deleted successfully');
      setConfirm({ open: false, resource: null });
      reload();
    } catch (err) {
      toast.error(err.message || 'Unable to delete the resource.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Shared Resources</h1>
          <p className="page-subtitle">
            {resources.length} study material{resources.length === 1 ? '' : 's'} shared across your groups.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModal({ open: true, resource: null })}
          disabled={myGroups.length === 0}
        >
          <IconPlus size={16} /> Add resource
        </button>
      </div>

      {myGroups.length === 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <IconAlert size={18} />
          <span>
            You need to be part of a study group before you can share resources.{' '}
            <Link to="/groups">Browse study groups</Link> to get started.
          </span>
        </div>
      )}

      {/* Filters */}
      <section className="card filter-bar" style={{ marginBottom: 20 }}>
        <div className="row-wrap" style={{ gap: 12 }}>
          <div style={{ flex: '1 1 300px' }}>
            <SearchBar
              id="resource-search"
              value={query}
              onChange={setQuery}
              placeholder="Search resources by title or description…"
            />
          </div>
          <span className="badge badge-brand">
            <IconBook size={12} /> {filtered.length} shown
          </span>
        </div>

        <div className="row-wrap" style={{ gap: 8 }}>
          <button
            type="button"
            className={`chip ${typeFilter === '' ? 'active' : ''}`}
            onClick={() => setTypeFilter('')}
          >
            All types ({resources.length})
          </button>
          {RESOURCE_TYPES.filter((type) => counts[type] > 0).map((type) => (
            <button
              key={type}
              type="button"
              className={`chip ${typeFilter === type ? 'active' : ''}`}
              onClick={() => setTypeFilter(type)}
            >
              {type} ({counts[type]})
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <div className="alert alert-danger">
          <IconAlert size={18} />
          <span>{error.message}</span>
        </div>
      ) : loading ? (
        <>
          <LoadingSpinner label="Loading resources…" />
          <CardSkeletonGrid count={6} height={220} />
        </>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconSearch size={24} />}
            title={resources.length === 0 ? 'No resources have been shared yet.' : 'No resources match your filters.'}
            message={
              resources.length === 0
                ? 'Share notes, videos or useful links so your group studies from the same material.'
                : 'Try a different resource type or clear the search text.'
            }
            action={
              myGroups.length > 0 ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setModal({ open: true, resource: null })}
                >
                  <IconPlus size={15} /> Share a resource
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              canManage={resource.addedBy?._id === user?._id || resource.group?.createdBy === user?._id}
              busy={busy}
              onEdit={(item) => setModal({ open: true, resource: item })}
              onDelete={(item) => setConfirm({ open: true, resource: item })}
            />
          ))}
        </div>
      )}

      <Modal
        open={modal.open}
        title={modal.resource ? 'Edit resource' : 'Share a new resource'}
        onClose={() => !saving && setModal({ open: false, resource: null })}
      >
        <ResourceForm
          groups={myGroups}
          showGroupPicker={!modal.resource}
          initialValues={
            modal.resource
              ? {
                title: modal.resource.title,
                type: modal.resource.type,
                url: modal.resource.url,
                description: modal.resource.description,
              }
              : undefined
          }
          onSubmit={handleSave}
          submitting={saving}
          submitLabel={modal.resource ? 'Save changes' : 'Share resource'}
        />
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title="Delete resource"
        message={`Delete "${confirm.resource?.title}" from the shared resources?`}
        confirmLabel="Delete resource"
        loading={saving}
        onCancel={() => setConfirm({ open: false, resource: null })}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default Resources;
