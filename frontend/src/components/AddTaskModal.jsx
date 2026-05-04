import { useState, useEffect, useRef } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Button from './Button';

const FIELD_ERR = 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20';

const AddTaskModal = ({ onClose, onTaskCreated }) => {
  const overlayRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    project: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
  });

  // Load projects + users on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [p, u] = await Promise.all([api.get('/projects'), api.get('/users')]);
        setProjects(p.data);
        setUsers(u.data);
        // Pre-select first project
        if (p.data.length > 0) setForm((f) => ({ ...f, project: p.data[0]._id }));
      } catch {
        toast.error('Could not load projects/users');
      }
    };
    load();
  }, []);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim())   errs.title   = 'Title is required';
    if (!form.project)        errs.project  = 'Select a project';
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
      };
      const { data } = await api.post('/tasks', payload);
      toast.success('Task created! 🎉');
      onTaskCreated(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  // Click overlay to close
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in"
    >
      <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'rgba(12,12,12,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 0 40px rgba(239,35,60,0.06)',
          backdropFilter: 'blur(24px)',
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(239,35,60,0.2), rgba(239,35,60,0.08))',
                border: '1px solid rgba(239,35,60,0.25)',
              }}>
              <Plus className="w-4 h-4 text-brand-red" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Create New Task</h2>
              <p className="text-gray-500 text-xs mt-0.5">Fill in the details below</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                       hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-6 py-5 space-y-4">

          {/* Title */}
          <div>
            <label className="label">
              Task Title <span className="text-brand-red">*</span>
            </label>
            <input
              className={`input ${errors.title ? FIELD_ERR : ''}`}
              placeholder="e.g. Design the landing page hero"
              value={form.title}
              onChange={set('title')}
              autoFocus
            />
            {errors.title && <FieldError msg={errors.title} />}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Add more context (optional)..."
              value={form.description}
              onChange={set('description')}
              style={{ lineHeight: '1.6' }}
            />
          </div>

          {/* Project + Assign */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                Project <span className="text-brand-red">*</span>
              </label>
              <select
                className={`input ${errors.project ? FIELD_ERR : ''}`}
                value={form.project}
                onChange={set('project')}
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
              {errors.project && <FieldError msg={errors.project} />}
            </div>

            <div>
              <label className="label">Assign To</label>
              <select className="input" value={form.assignedTo} onChange={set('assignedTo')}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={set('status')}>
                {['To Do', 'In Progress', 'Done'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={set('priority')}>
                {['Low', 'Medium', 'High'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="label">Due Date</label>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={set('dueDate')}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="ghost" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving} className="flex-1"
              icon={!saving ? Plus : undefined}>
              {saving ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FieldError = ({ msg }) => (
  <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
    <AlertCircle className="w-3 h-3" /> {msg}
  </p>
);

export default AddTaskModal;
