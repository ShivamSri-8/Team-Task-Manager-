import { useState } from 'react';
import { Calendar, User, Tag, AlertCircle, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  'To Do':       'status-todo',
  'In Progress': 'status-progress',
  'Done':        'status-done',
};

const PRIORITY_STYLES = {
  Low:    'priority-low',
  Medium: 'priority-medium',
  High:   'priority-high',
};

const PRIORITY_DOT = {
  Low:    '#6b7280',
  Medium: '#fbbf24',
  High:   '#ef233c',
};

const TaskCard = ({ task, onStatusChange, onDelete, onEdit }) => {
  const { isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isOverdue =
    task.dueDate && task.status !== 'Done' && isPast(new Date(task.dueDate));

  const handleStatusCycle = () => {
    const cycle = ['To Do', 'In Progress', 'Done'];
    const next = cycle[(cycle.indexOf(task.status) + 1) % cycle.length];
    onStatusChange(task._id, next);
  };

  return (
    <div
      className="relative rounded-2xl p-5 group animate-slide-up"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(239,35,60,0.2)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35), 0 0 16px rgba(239,35,60,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)';
      }}
    >
      {/* Priority indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-60"
        style={{ background: PRIORITY_DOT[task.priority] || '#6b7280' }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 flex-1">
          {task.title}
        </h3>
        {isAdmin && (
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-white
                         opacity-0 group-hover:opacity-100 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 w-36 rounded-xl py-1 z-20 animate-scale-in"
                  style={{
                    background: 'rgba(20,20,20,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(16px)',
                  }}>
                  <button
                    onClick={() => { onEdit(task); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-300
                               hover:text-white hover:bg-white/5 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" /> Edit task
                  </button>
                  <button
                    onClick={() => { onDelete(task._id); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400
                               hover:text-red-300 hover:bg-red-950/30 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span
          className={`badge cursor-pointer select-none hover:opacity-75 transition-opacity ${STATUS_STYLES[task.status]}`}
          onClick={handleStatusCycle}
          title="Click to advance status"
        >
          {task.status}
        </span>
        <span className={`badge ${PRIORITY_STYLES[task.priority]}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_DOT[task.priority] }} />
          {task.priority}
        </span>
        {isOverdue && (
          <span className="badge status-overdue">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="flex items-center gap-1.5 text-gray-500">
          {task.assignedTo ? (
            <>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold uppercase"
                style={{
                  background: 'rgba(239,35,60,0.15)',
                  color: '#ff4d6d',
                  border: '1px solid rgba(239,35,60,0.2)',
                }}>
                {task.assignedTo.name?.charAt(0)}
              </div>
              <span className="text-gray-400">{task.assignedTo.name}</span>
            </>
          ) : (
            <span className="italic text-gray-600">Unassigned</span>
          )}
        </span>

        {task.dueDate && (
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
            <Calendar className="w-3 h-3" />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>

      {task.project?.name && (
        <p className="text-gray-600 text-xs mt-2.5 flex items-center gap-1.5">
          <Tag className="w-3 h-3" />
          <span className="text-gray-500">{task.project.name}</span>
        </p>
      )}
    </div>
  );
};

export default TaskCard;
