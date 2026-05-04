import { useEffect, useState } from 'react';
import { Plus, FolderKanban, Users, Trash2, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const ProjectsPage = () => {
  const { isAdmin, user } = useAuth();
  const [projects, setProjects]     = useState([]);
  const [allUsers, setAllUsers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [memberModal, setMemberModal] = useState(null); // project id
  const [form, setForm]             = useState({ name: '', description: '', status: 'Active' });
  const [saving, setSaving]         = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const load = async () => {
    try {
      const [p, u] = await Promise.all([
        api.get('/projects'),
        isAdmin ? api.get('/users') : Promise.resolve({ data: [] }),
      ]);
      setProjects(p.data);
      setAllUsers(u.data);
    } catch (e) { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createProject = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/projects', form);
      setProjects([data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', status: 'Active' });
      toast.success('Project created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      toast.success('Project deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const addMember = async () => {
    if (!selectedUser) return;
    try {
      const { data } = await api.post(`/projects/${memberModal}/members`, { userId: selectedUser });
      setProjects(projects.map((p) => p._id === memberModal ? data : p));
      setSelectedUser('');
      toast.success('Member added');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const removeMember = async (projectId, userId) => {
    try {
      const { data } = await api.delete(`/projects/${projectId}/members/${userId}`);
      setProjects(projects.map((p) => p._id === projectId ? data : p));
      toast.success('Member removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const activeProject = projects.find((p) => p._id === memberModal);
  const nonMembers = allUsers.filter(
    (u) => !activeProject?.members?.some((m) => m._id === u._id)
  );

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-60 flex-1 p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <FolderKanban className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No projects yet.</p>
            {isAdmin && <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Create your first project</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <div key={proj._id} className="card hover:border-gray-600 group animate-slide-up">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-brand-red" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${
                      proj.status === 'Active' ? 'bg-green-900/30 text-green-400' :
                      proj.status === 'Completed' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>{proj.status}</span>
                    {isAdmin && proj.owner?._id === user?._id && (
                      <button onClick={() => deleteProject(proj._id)}
                        className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-white font-semibold mb-1">{proj.name}</h3>
                {proj.description && (
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">{proj.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-border">
                  <div className="flex -space-x-1.5">
                    {proj.members?.slice(0, 4).map((m) => (
                      <div key={m._id} title={m.name}
                        className="w-6 h-6 rounded-full bg-brand-red/20 border border-surface-card flex items-center justify-center text-xs text-brand-red-light font-semibold uppercase">
                        {m.name?.charAt(0)}
                      </div>
                    ))}
                    {proj.members?.length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-surface-elevated border border-surface-card flex items-center justify-center text-xs text-gray-400">
                        +{proj.members.length - 4}
                      </div>
                    )}
                  </div>

                  {isAdmin && proj.owner?._id === user?._id && (
                    <button onClick={() => setMemberModal(proj._id)}
                      className="text-xs text-gray-400 hover:text-brand-red-light transition-colors flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5" /> Manage members
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create project modal */}
      {showModal && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={createProject} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Name *</label>
              <input className="input" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Project name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
              <textarea className="input resize-none" rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['Active', 'On Hold', 'Completed'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Member management modal */}
      {memberModal && activeProject && (
        <Modal title={`Members — ${activeProject.name}`} onClose={() => setMemberModal(null)}>
          <div className="space-y-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeProject.members?.map((m) => (
                <div key={m._id} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-elevated">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-red/20 flex items-center justify-center text-xs text-brand-red-light font-semibold uppercase">
                      {m.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">{m.name}</p>
                      <p className="text-gray-500 text-xs">{m.role}</p>
                    </div>
                  </div>
                  {m._id !== user?._id && (
                    <button onClick={() => removeMember(memberModal, m._id)}
                      className="text-gray-500 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {nonMembers.length > 0 && (
              <div className="flex gap-2 pt-3 border-t border-surface-border">
                <select className="input flex-1" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                  <option value="">Add member...</option>
                  {nonMembers.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                </select>
                <button onClick={addMember} className="btn-primary px-4">
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md animate-slide-up"
      onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between p-6 border-b border-surface-border">
        <h2 className="text-white font-semibold">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export default ProjectsPage;
