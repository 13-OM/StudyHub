import { useEffect, useState } from 'react';
import { sessionService } from '../services';
import { useToast } from '../context/ToastContext';
import { Avatar, EmptyState, LoadingSpinner, Modal, ProgressBar, RoleBadge } from './ui';
import { IconCheck, IconInfo, IconUsers, IconX } from './Icons';
import { formatDateShort, formatDuration, formatTime, percent } from '../utils/format';

/**
 * AttendanceModal — the group owner marks Present / Absent for every member
 * of a session. Data is saved through POST /api/sessions/:id/attendance.
 */
const AttendanceModal = ({ open, session, onClose, onSaved }) => {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !session) return;
    let active = true;
    setLoading(true);
    setError(null);

    sessionService
      .attendance(session._id)
      .then((response) => {
        if (!active) return;
        setRows(response.data.rows);
      })
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [open, session]);

  const setStatus = (userId, status) =>
    setRows((current) =>
      current.map((row) => (row.user._id === userId ? { ...row, status } : row))
    );

  const markAll = (status) => setRows((current) => current.map((row) => ({ ...row, status })));

  const presentCount = rows.filter((row) => row.status === 'Present').length;
  const markedCount = rows.filter((row) => row.status).length;

  const handleSave = async () => {
    if (markedCount === 0) {
      toast.warning('Please mark at least one student before saving.');
      return;
    }
    setSaving(true);
    try {
      const records = rows
        .filter((row) => row.status)
        .map((row) => ({ user: row.user._id, status: row.status }));

      const response = await sessionService.markAttendance(session._id, records);
      toast.success(response.message || 'Attendance saved successfully');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Unable to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Mark attendance"
      size="modal-lg"
      onClose={() => !saving && onClose()}
      footer={
        <>
          <span className="text-sm text-muted" style={{ marginRight: 'auto' }}>
            {markedCount}/{rows.length} marked · {presentCount} present
          </span>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving || loading}>
            {saving && <span className="btn-spinner" />}
            {saving ? 'Saving…' : 'Save attendance'}
          </button>
        </>
      }
    >
      {session && (
        <div className="row-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem' }}>{session.title}</h4>
            <p className="text-xs text-muted" style={{ margin: '3px 0 0' }}>
              {formatDateShort(session.date)} · {formatTime(session.startTime)} ·{' '}
              {formatDuration(session.duration)}
            </p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => markAll('Present')}>
              <IconCheck size={14} /> All present
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => markAll('Absent')}>
              <IconX size={14} /> All absent
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading members…" />
      ) : error ? (
        <EmptyState title="Could not load attendance" message={error.message} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={22} />}
          title="No members in this group"
          message="Approve at least one join request before marking attendance."
        />
      ) : (
        <>
          <ProgressBar value={percent(presentCount, rows.length)} variant="success" />
          <div className="stack" style={{ gap: 10, marginTop: 16 }}>
            {rows.map((row) => (
              <div className="list-item" key={row.user._id} style={{ padding: '11px 14px' }}>
                <Avatar name={row.user.name} color={row.user.avatarColor} size="md" />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="li-title truncate">{row.user.name}</span>
                  <span className="li-sub">
                    {row.user.course} · {row.user.skillLevel}
                  </span>
                </span>
                <RoleBadge role={row.role} />
                <span className="segmented">
                  <button
                    type="button"
                    className={row.status === 'Present' ? 'active' : ''}
                    onClick={() => setStatus(row.user._id, 'Present')}
                    style={row.status === 'Present' ? { color: 'var(--success-600)' } : undefined}
                  >
                    <IconCheck size={14} /> Present
                  </button>
                  <button
                    type="button"
                    className={row.status === 'Absent' ? 'active' : ''}
                    onClick={() => setStatus(row.user._id, 'Absent')}
                    style={row.status === 'Absent' ? { color: 'var(--danger-600)' } : undefined}
                  >
                    <IconX size={14} /> Absent
                  </button>
                </span>
              </div>
            ))}
          </div>

          <div className="alert alert-info" style={{ marginTop: 18 }}>
            <IconInfo size={17} />
            <span>
              Attendance is stored per session and per member. Members can view their own
              attendance history from the Attendance page.
            </span>
          </div>
        </>
      )}
    </Modal>
  );
};

export default AttendanceModal;
