import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  LayoutList,
  Kanban,
  History,
  Edit2,
  Archive,
  Trash2,
  Clock,
  User,
  Folder,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { TaskHistoryModal } from './TaskHistoryModal';
import { TaskEditorModal } from './TaskEditorModal';

const STATUS_ORDER: TaskStatus[] = [
  'Started',
  'In Progress',
  'Testing',
  'Debugging',
  'Completed',
  'Done'
];

export const TaskManagerView: React.FC = () => {
  const { state, updateTask, archiveTask, deleteTask } = useWorkPulse();

  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'hours' | 'name'>('date');

  // Modals
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Projects list
  const allProjects = useMemo(() => {
    return Array.from(new Set(state.tasks.map(t => t.project)));
  }, [state.tasks]);

  // Priority weight for sorting
  const priorityWeight: Record<TaskPriority, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  // Filtered & Sorted Tasks
  const processedTasks = useMemo(() => {
    return state.tasks
      .filter(t => {
        if (!showArchived && t.archived) return false;
        if (showArchived && !t.archived) return false;
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (projectFilter !== 'all' && t.project !== projectFilter) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = t.name.toLowerCase().includes(q);
          const matchProject = t.project.toLowerCase().includes(q);
          const matchAssigned = t.assignedBy.toLowerCase().includes(q);
          const matchNotes = (t.latestNotes || '').toLowerCase().includes(q);
          if (!matchName && !matchProject && !matchAssigned && !matchNotes) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        if (sortBy === 'hours') {
          return b.actualHours - a.actualHours;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [state.tasks, showArchived, statusFilter, projectFilter, priorityFilter, searchTerm, sortBy]);

  const handleQuickStatusChange = (task: Task, nextStatus: TaskStatus) => {
    updateTask({
      ...task,
      status: nextStatus,
      completedAt: (nextStatus === 'Completed' || nextStatus === 'Done') ? (task.completedAt || new Date().toISOString().split('T')[0]) : task.completedAt,
      history: [
        ...task.history,
        {
          id: `hist-quick-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          status: nextStatus,
          timeSpentHours: 0,
          notes: `Status changed to ${nextStatus}`,
          timestamp: new Date().toISOString()
        }
      ]
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Permanently delete task "${name}"? This will also remove associated historical logs.`)) {
      deleteTask(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gold-500" />
            <h1 className="font-display text-3xl tracking-wider text-cream-200">
              TASK MANAGER
            </h1>
          </div>
          <p className="text-xs text-slate-350 mt-1">
            Complete lifecycle management, historical audit trails, and multi-day task continuity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switch */}
          <div className="flex items-center bg-navy-800 border border-navy-500 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-350 hover:text-cream-200'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 transition-colors ${
                viewMode === 'board' ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-350 hover:text-cream-200'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs tracking-wider shadow-geometric-gold"
          >
            <Plus className="w-4 h-4" />
            <span>NEW TASK</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-800 border border-navy-500 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-450 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search tasks by title, project, assignee..."
            className="w-full bg-navy-900 border border-navy-500 pl-9 pr-3 py-2 text-xs text-cream-200 placeholder:text-slate-500 focus:border-gold-500 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
          >
            <option value="all">Status: All</option>
            {STATUS_ORDER.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        <div className="lg:col-span-2">
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
          >
            <option value="all">Project: All</option>
            {allProjects.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="lg:col-span-2">
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
          >
            <option value="all">Priority: All</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Sort */}
        <div className="lg:col-span-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full bg-navy-900 border border-navy-500 px-3 py-2 text-xs text-slate-350 focus:border-gold-500 focus:outline-none font-mono"
          >
            <option value="date">Sort: Created Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="hours">Sort: Hours Logged</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Archive Toggle Filter */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-450">
        <div>
          Showing <span className="text-gold-500 font-bold">{processedTasks.length}</span> tasks
        </div>
        <button
          onClick={() => setShowArchived(prev => !prev)}
          className={`px-3 py-1 border transition-colors ${
            showArchived 
              ? 'bg-navy-700 text-gold-400 border-gold-500' 
              : 'bg-navy-900 text-slate-450 border-navy-500 hover:text-cream-200'
          }`}
        >
          {showArchived ? 'Viewing Archived Tasks' : 'View Archived Tasks'}
        </button>
      </div>

      {/* VIEW MODE 1: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-navy-800 border border-navy-500 overflow-x-auto chamfer-tr">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-950 border-b border-navy-500 text-[10px] font-mono uppercase text-slate-450 font-bold">
                <th className="p-3.5">TASK & OBJECTIVE</th>
                <th className="p-3.5">PROJECT</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5">PRIORITY</th>
                <th className="p-3.5">TIME</th>
                <th className="p-3.5">ASSIGNED BY</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-600/50 text-xs">
              {processedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-450">
                    <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-sm text-cream-200">
                      {state.tasks.length === 0 ? 'No tasks created yet' : 'No tasks match the selected filters'}
                    </p>
                    <p className="text-xs text-slate-450 mt-1">
                      {state.tasks.length === 0
                        ? 'Click "+ CREATE TASK" above to start tracking your first project or assignment.'
                        : 'Try adjusting your search query or filter settings.'}
                    </p>
                  </td>
                </tr>
              ) : (
                processedTasks.map(task => (
                  <tr
                    key={task.id}
                    className="hover:bg-navy-750/70 transition-colors group"
                  >
                    {/* Task Name & Notes */}
                    <td className="p-3.5 max-w-xs">
                      <div className="font-bold text-cream-200 group-hover:text-gold-400 transition-colors">
                        {task.name}
                      </div>
                      {task.latestNotes && (
                        <div className="text-[11px] text-slate-450 truncate mt-0.5">
                          {task.latestNotes}
                        </div>
                      )}
                    </td>

                    {/* Project */}
                    <td className="p-3.5 font-mono text-slate-350 whitespace-nowrap">
                      {task.project}
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-3.5 whitespace-nowrap">
                      <select
                        value={task.status}
                        onChange={e => handleQuickStatusChange(task, e.target.value as TaskStatus)}
                        className={`text-[11px] font-mono font-bold px-2 py-1 border bg-navy-900 cursor-pointer focus:outline-none ${
                          task.status === 'Completed' || task.status === 'Done'
                            ? 'text-emerald-400 border-emerald-500/50'
                            : task.status === 'In Progress'
                            ? 'text-gold-400 border-gold-500/50'
                            : task.status === 'Debugging'
                            ? 'text-red-400 border-red-500/50'
                            : 'text-slate-350 border-navy-500'
                        }`}
                      >
                        {STATUS_ORDER.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 font-bold ${
                          task.priority === 'Critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                            : task.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-navy-900 text-slate-450'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </td>

                    {/* Hours */}
                    <td className="p-3.5 font-mono whitespace-nowrap">
                      <span className="text-gold-500 font-bold">{task.actualHours}h</span>
                      <span className="text-slate-500"> / {task.estimatedHours}h</span>
                    </td>

                    {/* Assigned By */}
                    <td className="p-3.5 text-slate-450 font-mono text-[11px] whitespace-nowrap">
                      {task.assignedBy}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTaskForHistory(task)}
                          className="p-1.5 text-slate-450 hover:text-gold-400 hover:bg-navy-700 transition-colors"
                          title="View Audit Trail"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 text-slate-450 hover:text-cream-200 hover:bg-navy-700 transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => archiveTask(task.id)}
                          className={`p-1.5 hover:bg-navy-700 transition-colors ${
                            task.archived ? 'text-gold-500' : 'text-slate-450 hover:text-slate-200'
                          }`}
                          title={task.archived ? 'Unarchive' : 'Archive'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id, task.name)}
                          className="p-1.5 text-slate-450 hover:text-red-400 hover:bg-navy-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODE 2: KANBAN BOARD VIEW */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {STATUS_ORDER.map(status => {
            const columnTasks = processedTasks.filter(t => t.status === status);

            return (
              <div
                key={status}
                className="bg-navy-850 border border-navy-500 flex flex-col min-h-[400px]"
              >
                {/* Column Header */}
                <div className="p-3 bg-navy-950 border-b border-navy-500 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gold-500" />
                    <span className="font-display text-sm tracking-wider text-cream-200">
                      {status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-450 bg-navy-800 px-1.5 py-0.5">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 bg-navy-800 border border-navy-600/70 hover:border-gold-500/60 transition-colors space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-gold-400 font-bold truncate">
                          {task.project}
                        </span>
                        <span
                          className={`px-1 py-0.2 font-bold ${
                            task.priority === 'Critical'
                              ? 'bg-red-500/20 text-red-400'
                              : 'text-slate-450'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-cream-200 line-clamp-2">
                        {task.name}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-450 pt-1 border-t border-navy-700/50">
                        <span>{task.actualHours}h logged</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedTaskForHistory(task)}
                            className="text-slate-450 hover:text-gold-400"
                            title="History"
                          >
                            <History className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingTask(task)}
                            className="text-slate-450 hover:text-cream-200"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Quick move status arrows */}
                      <div className="flex items-center justify-between pt-1">
                        {STATUS_ORDER.indexOf(task.status) > 0 ? (
                          <button
                            onClick={() => {
                              const prevIdx = STATUS_ORDER.indexOf(task.status) - 1;
                              handleQuickStatusChange(task, STATUS_ORDER[prevIdx]);
                            }}
                            className="text-[10px] font-mono text-slate-500 hover:text-gold-400 flex items-center"
                            title="Move back"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        ) : <div />}

                        {STATUS_ORDER.indexOf(task.status) < STATUS_ORDER.length - 1 ? (
                          <button
                            onClick={() => {
                              const nextIdx = STATUS_ORDER.indexOf(task.status) + 1;
                              handleQuickStatusChange(task, STATUS_ORDER[nextIdx]);
                            }}
                            className="text-[10px] font-mono text-slate-500 hover:text-gold-400 flex items-center"
                            title="Move forward"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : <div />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task History Modal */}
      {selectedTaskForHistory && (
        <TaskHistoryModal
          task={selectedTaskForHistory}
          onClose={() => setSelectedTaskForHistory(null)}
        />
      )}

      {/* Task Editor Modal */}
      {(editingTask || isCreateOpen) && (
        <TaskEditorModal
          task={editingTask}
          onClose={() => {
            setEditingTask(null);
            setIsCreateOpen(false);
          }}
        />
      )}
    </div>
  );
};

