import { useEffect, useState, useCallback } from 'react';
import { CheckSquare, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';
import AddTaskModal from '../components/AddTaskModal';
import { Plus } from 'lucide-react';

const STATUSES   = ['All', 'To Do', 'In Progress', 'Done'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High'];

const TasksPage = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAddTask, setShowAddTask]   = useState(false);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus]     = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, { status });
      setTasks((prev) => prev.map((t) => t._id === id ? data : t));
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const openEdit = (task) => {
    // Opens AddTaskModal in edit mode — for simplicity we re-use existing TasksPage edit flow
    // handled inside TaskCard context menu → could extend AddTaskModal to accept initialValues
    toast('Use the Edit button in the task card menu');
  };

  const filtered = tasks.filter((t) => {
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = filterStatus === 'All'   || t.status === filterStatus;
    const matchPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="ml-60 flex-1 p-8 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Tasks</h1>
            <p className="text-gray-500 text-sm mt-1">
              {filtered.length} task{filtered.length !== 1 ? 's' : ''}
              {filterStatus !== 'All' && ` · ${filterStatus}`}
            </p>
          </div>
          {isAdmin && (
            <Button variant="primary" icon={Plus} onClick={() => setShowAddTask(true)}>
              New Task
            </Button>
          )}
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="input pl-9 py-2 text-xs"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10" />

          {/* Status filters */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-600 mr-1" />
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={filterStatus === s ? {
                  background: 'linear-gradient(135deg, #ef233c, #c1121f)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(239,35,60,0.3)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: '#6b7280',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => { if (filterStatus !== s) e.currentTarget.style.color = '#d1d5db'; }}
                onMouseLeave={(e) => { if (filterStatus !== s) e.currentTarget.style.color = '#6b7280'; }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10" />

          {/* Priority filters */}
          <div className="flex items-center gap-1.5">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={filterPriority === p ? {
                  background: 'linear-gradient(135deg, #ef233c, #c1121f)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(239,35,60,0.3)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: '#6b7280',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Task grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'rgba(239,35,60,0.08)', border: '1px solid rgba(239,35,60,0.15)' }}>
              <CheckSquare className="w-7 h-7 text-brand-red/50" />
            </div>
            <p className="text-white font-semibold text-base mb-2">No tasks found</p>
            <p className="text-gray-500 text-sm mb-6">
              {search || filterStatus !== 'All' || filterPriority !== 'All'
                ? 'Try adjusting your filters'
                : 'Start by creating your first task'}
            </p>
            {isAdmin && !search && filterStatus === 'All' && filterPriority === 'All' && (
              <Button variant="primary" icon={Plus} onClick={() => setShowAddTask(true)}>
                Create your first task
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={updateStatus}
                onDelete={deleteTask}
                onEdit={openEdit}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showAddTask && (
        <AddTaskModal
          onClose={() => setShowAddTask(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default TasksPage;
