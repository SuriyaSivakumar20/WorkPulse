import React, { useState } from 'react';
import { X, Save, CheckSquare } from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { Task, TaskPriority, TaskStatus, TrackingFrequency } from '../../types';

interface TaskEditorModalProps {
  task?: Task | null;
  onClose: () => void;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ task, onClose }) => {
  const { createTask, updateTask } = useWorkPulse();

  const [name, setName] = useState(task?.name || '');
  const [project, setProject] = useState(task?.project || 'Core Engineering');
  const [assignedBy, setAssignedBy] = useState(task?.assignedBy || 'Self-Directed');
  const [trackingFrequency, setTrackingFrequency] = useState<TrackingFrequency>(
    task?.trackingFrequency || 'Daily'
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'Started');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'Medium');
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours || 8);
  const [actualHours, setActualHours] = useState(task?.actualHours || 0);
  const [latestNotes, setLatestNotes] = useState(task?.latestNotes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (task) {
      updateTask({
        ...task,
        name: name.trim(),
        project: project.trim(),
        assignedBy: assignedBy.trim(),
        trackingFrequency,
        status,
        priority,
        estimatedHours,
        actualHours,
        latestNotes: latestNotes.trim(),
        completedAt: (status === 'Completed' || status === 'Done') ? (task.completedAt || new Date().toISOString().split('T')[0]) : undefined
      });
    } else {
      createTask({
        name: name.trim(),
        project: project.trim(),
        assignedBy: assignedBy.trim(),
        trackingFrequency,
        status,
        priority,
        estimatedHours,
        actualHours,
        latestNotes: latestNotes.trim(),
        archived: false,
        completedAt: (status === 'Completed' || status === 'Done') ? new Date().toISOString().split('T')[0] : undefined
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-navy-900 border-2 border-navy-500 shadow-2xl my-8 overflow-hidden chamfer-tr">
        <div className="bg-navy-950 p-5 border-b border-navy-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-gold-500" />
            <h2 className="font-display text-xl tracking-wider text-cream-200">
              {task ? 'EDIT TASK DETAILS' : 'CREATE NEW TASK'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-350 hover:text-cream-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-350 uppercase mb-1">
              TASK NAME / OBJECTIVE
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Profiling memory consumption on mobile WebGL canvas..."
              className="w-full bg-navy-800 border border-navy-500 px-3 py-2 text-xs text-cream-200 focus:border-gold-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                PROJECT / CATEGORY
              </label>
              <input
                type="text"
                value={project}
                onChange={e => setProject(e.target.value)}
                className="w-full bg-navy-800 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                ASSIGNED BY
              </label>
              <input
                type="text"
                value={assignedBy}
                onChange={e => setAssignedBy(e.target.value)}
                className="w-full bg-navy-800 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                STATUS
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-navy-800 border border-navy-500 px-2 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
              >
                <option value="Started">Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Testing">Testing</option>
                <option value="Debugging">Debugging</option>
                <option value="Completed">Completed</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                PRIORITY
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-navy-800 border border-navy-500 px-2 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                FREQUENCY
              </label>
              <select
                value={trackingFrequency}
                onChange={e => setTrackingFrequency(e.target.value as TrackingFrequency)}
                className="w-full bg-navy-800 border border-navy-500 px-2 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                ESTIMATED HOURS
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={estimatedHours}
                onChange={e => setEstimatedHours(parseFloat(e.target.value) || 0)}
                className="w-full bg-navy-800 border border-navy-500 px-3 py-1.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
                TOTAL ACTUAL HOURS
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={actualHours}
                onChange={e => setActualHours(parseFloat(e.target.value) || 0)}
                className="w-full bg-navy-800 border border-navy-500 px-3 py-1.5 text-xs text-gold-500 font-bold focus:border-gold-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-450 uppercase mb-1">
              CURRENT PROGRESS NOTES
            </label>
            <textarea
              rows={2}
              value={latestNotes}
              onChange={e => setLatestNotes(e.target.value)}
              placeholder="Latest status update or milestone reached..."
              className="w-full bg-navy-800 border border-navy-500 p-2.5 text-xs text-cream-200 focus:border-gold-500 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-500">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-navy-800 text-slate-350 text-xs font-mono hover:text-cream-200"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black text-xs tracking-wider shadow-geometric-gold"
            >
              <Save className="w-4 h-4" />
              <span>{task ? 'SAVE CHANGES' : 'CREATE TASK'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

