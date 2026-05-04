import { useEffect, useState } from 'react';
import { Users, Shield, UserCheck, Trash2, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const TeamPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'Member' });
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch { toast.error('Failed to load team'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({ name: u.name, role: u.role });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/users/${editUser._id}`, editForm);
      setUsers(users.map((u) => u._id === editUser._id ? { ...u, ...data } : u));
      setEditUser(null);
      toast.success('User updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Remove this user from the team?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const adminCount  = users.filter((u) => u.role === 'Admin').length;
  const memberCount = users.filter((u) => u.role === 'Member').length;

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-60 flex-1 p-8 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Members', value: users.length, icon: Users,      color: 'text-gray-300', bg: 'bg-gray-800' },
            { label: 'Admins',        value: adminCount,    icon: Shield,     color: 'text-red-300',  bg: 'bg-red-900/30' },
            { label: 'Members',       value: memberCount,   icon: UserCheck,  color: 'text-blue-300', bg: 'bg-blue-900/30' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`${bg} p-3 rounded-xl`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-xs">{label}</p>
                <p className="text-white font-bold text-2xl">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border">
                  {['Member', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-surface-elevated transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-red/20 border border-brand-red/30 flex items-center justify-center text-xs text-brand-red-light font-semibold uppercase shrink-0">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{u.name}</p>
                          {u._id === currentUser?._id && <p className="text-brand-red text-xs">You</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`badge text-xs ${
                        u.role === 'Admin' ? 'bg-red-900/40 text-red-300' : 'bg-blue-900/30 text-blue-300'
                      }`}>
                        {u.role === 'Admin' ? <Shield className="w-3 h-3 mr-1" /> : <UserCheck className="w-3 h-3 mr-1" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(u)}
                          className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-surface-hover transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u._id !== currentUser?._id && (
                          <button onClick={() => deleteUser(u._id)}
                            className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Edit user modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setEditUser(null)}>
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-sm animate-slide-up"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h2 className="text-white font-semibold">Edit Member</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
                <input className="input" value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
                <select className="input" value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                  <option>Member</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
