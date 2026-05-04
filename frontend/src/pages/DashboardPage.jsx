import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare, Clock, AlertCircle, ListTodo,
  FolderKanban, TrendingUp, ArrowRight, Plus,
  Sparkles, Target
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import AddTaskModal from '../components/AddTaskModal';

// ── Skeleton loader ──────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="skeleton h-3 w-24 mb-4 rounded" />
    <div className="skeleton h-10 w-16 mb-2 rounded" />
    <div className="skeleton h-2.5 w-32 rounded" />
  </div>
);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', icon: '☀️' };
  if (h < 17) return { text: 'Good afternoon', icon: '🌤️' };
  return { text: 'Good evening', icon: '🌙' };
};

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats]           = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const { text: greetText, icon: greetIcon } = getGreeting();

  const loadData = useCallback(async () => {
    try {
      const [s, t, p] = await Promise.all([
        api.get('/tasks/dashboard'),
        api.get('/tasks'),
        api.get('/projects'),
      ]);
      setStats(s.data);
      setRecentTasks(t.data.slice(0, 6));
      setProjects(p.data.slice(0, 4));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleTaskCreated = (newTask) => {
    setRecentTasks((prev) => [newTask, ...prev].slice(0, 6));
    setStats((prev) => prev ? { ...prev, total: prev.total + 1, pending: prev.pending + 1 } : prev);
  };

  const completionRate = stats?.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <main className="ml-60 flex-1 p-8 animate-fade-in">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{greetIcon}</span>
              <p className="text-gray-400 text-sm font-medium">{greetText}</p>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {user?.name?.split(' ')[0]}'s{' '}
              <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {isAdmin && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowAddTask(true)}
              className="shrink-0"
              style={{ boxShadow: '0 4px 20px rgba(239,35,60,0.4)' }}
            >
              Add Task
            </Button>
          )}
        </div>

        {loading ? (
          /* ── Skeleton State ── */
          <div className="space-y-6">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <div className="skeleton h-24 rounded-2xl" />
            <div className="grid grid-cols-2 gap-6">
              <div className="skeleton h-64 rounded-2xl" />
              <div className="skeleton h-64 rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Tasks"
                value={stats?.total ?? 0}
                icon={ListTodo}
                color="gray"
                large
                subtitle="All tracked work"
              />
              <StatCard
                title="Completed"
                value={stats?.completed ?? 0}
                icon={CheckSquare}
                color="green"
                subtitle={`${completionRate}% of total`}
              />
              <StatCard
                title="In Progress"
                value={stats?.inProgress ?? 0}
                icon={Clock}
                color="blue"
                subtitle="Actively working"
              />
              <StatCard
                title="Overdue"
                value={stats?.overdue ?? 0}
                icon={AlertCircle}
                color="red"
                subtitle="Needs attention"
              />
            </div>

            {/* ── Progress Section ── */}
            <div className="rounded-2xl p-6 mb-6 animate-fade-in"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(239,35,60,0.1)', border: '1px solid rgba(239,35,60,0.2)' }}>
                    <TrendingUp className="w-4 h-4 text-brand-red" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Overall Progress</p>
                    <p className="text-gray-500 text-xs">{stats?.completed} of {stats?.total} tasks completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gradient">{completionRate}%</p>
                  <p className="text-gray-500 text-xs">{stats?.pending} remaining</p>
                </div>
              </div>

              {/* Progress bar track */}
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${completionRate}%`,
                    background: 'linear-gradient(90deg, #ef233c, #ff6b6b)',
                    boxShadow: '0 0 8px rgba(239,35,60,0.5)',
                  }}
                />
              </div>

              {/* Mini legend */}
              <div className="flex items-center gap-4 mt-3">
                {[
                  { label: 'Done',        val: stats?.completed, color: '#22c55e' },
                  { label: 'In Progress', val: stats?.inProgress, color: '#3b82f6' },
                  { label: 'Overdue',     val: stats?.overdue,    color: '#ef233c' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    {label}: <span className="text-gray-300 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bottom Grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Recent Tasks */}
              <div className="rounded-2xl overflow-hidden animate-slide-up"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                <div className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-red" />
                    <span className="text-white font-semibold text-sm">Recent Tasks</span>
                  </div>
                  <Link to="/tasks"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-red-light transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 space-y-1.5">
                  {recentTasks.length === 0 ? (
                    /* ── Empty state ── */
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'rgba(239,35,60,0.08)', border: '1px solid rgba(239,35,60,0.15)' }}>
                        <CheckSquare className="w-6 h-6 text-brand-red/60" />
                      </div>
                      <p className="text-white font-semibold text-sm mb-1">No tasks yet</p>
                      <p className="text-gray-500 text-xs mb-4">Start by creating your first task</p>
                      {isAdmin && (
                        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddTask(true)}>
                          Create your first task
                        </Button>
                      )}
                    </div>
                  ) : (
                    recentTasks.map((task) => (
                      <div
                        key={task._id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-default"
                        style={{ transition: 'background 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                      >
                        {/* Status dot */}
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                          background: task.status === 'Done' ? '#22c55e' :
                                      task.status === 'In Progress' ? '#3b82f6' : '#6b7280',
                        }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{task.title}</p>
                          <p className="text-gray-500 text-xs truncate">{task.project?.name}</p>
                        </div>
                        <span className={`badge text-xs shrink-0 ${
                          task.status === 'Done' ? 'status-done' :
                          task.status === 'In Progress' ? 'status-progress' : 'status-todo'
                        }`}>{task.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Projects Overview */}
              <div className="rounded-2xl overflow-hidden animate-slide-up"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                <div className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-red" />
                    <span className="text-white font-semibold text-sm">Active Projects</span>
                  </div>
                  <Link to="/projects"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-red-light transition-colors">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="p-4 space-y-2">
                  {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'rgba(239,35,60,0.08)', border: '1px solid rgba(239,35,60,0.15)' }}>
                        <FolderKanban className="w-6 h-6 text-brand-red/60" />
                      </div>
                      <p className="text-white font-semibold text-sm mb-1">No projects yet</p>
                      <p className="text-gray-500 text-xs mb-4">Create your first project to get started</p>
                      <Link to="/projects">
                        <Button variant="primary" size="sm" icon={Plus}>New Project</Button>
                      </Link>
                    </div>
                  ) : (
                    projects.map((proj) => (
                      <div
                        key={proj._id}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-default"
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: 'rgba(239,35,60,0.08)',
                            border: '1px solid rgba(239,35,60,0.15)',
                          }}>
                          <FolderKanban className="w-4 h-4 text-brand-red/80" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{proj.name}</p>
                          <p className="text-gray-500 text-xs">
                            {proj.members?.length} member{proj.members?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        {/* Stacked avatars */}
                        <div className="flex -space-x-1.5 shrink-0">
                          {proj.members?.slice(0, 3).map((m) => (
                            <div key={m._id} title={m.name}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold uppercase"
                              style={{
                                background: 'rgba(239,35,60,0.2)',
                                border: '1.5px solid rgba(8,8,8,1)',
                                color: '#ff4d6d',
                                fontSize: '9px',
                              }}>
                              {m.name?.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className={`badge shrink-0 text-xs ${
                          proj.status === 'Active'    ? 'bg-green-950/60 text-green-400' :
                          proj.status === 'Completed' ? 'bg-blue-950/60 text-blue-400' :
                          'bg-yellow-950/60 text-yellow-400'
                        }`} style={{ border: 'none' }}>
                          {proj.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </>
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

export default DashboardPage;
