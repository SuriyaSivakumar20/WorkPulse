import React from 'react';
import { X, Calendar, Clock, User, Folder, CheckCircle, AlertCircle, History } from 'lucide-react';
import { Task } from '../../types';

interface TaskHistoryModalProps {
  task: Task;
  onClose: () => void;
}

export const TaskHistoryModal: React.FC<TaskHistoryModalProps> = ({ task, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-navy-900 border-2 border-navy-500 shadow-2xl my-8 overflow-hidden chamfer-tr">
        {/* Header */}
        <div className="bg-navy-950 p-5 border-b border-navy-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500 text-navy-950 flex items-center justify-center font-display text-lg font-bold">
              <History className="w-4 h-4 text-navy-950" />
            </div>
            <div>
              <h2 className="font-display text-xl tracking-wider text-cream-200">
                TASK AUDIT TRAIL & EVOLUTION
              </h2>
              <div className="text-xs font-mono text-slate-450">
                ID: {task.id} • CREATED: {task.createdAt}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-350 hover:text-cream-200 hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Summary info box */}
          <div className="p-4 bg-navy-800 border border-navy-500 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-base text-cream-200">
                {task.name}
              </h3>
              <span className="px-2 py-0.5 bg-gold-500/15 border border-gold-500 text-gold-400 font-mono text-xs font-bold">
                {task.status.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-350 pt-2 border-t border-navy-700/60">
              <span className="flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-gold-500" />
                {task.project}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {task.assignedBy}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {task.actualHours}h logged / {task.estimatedHours}h est
              </span>
            </div>
          </div>

          {/* History entries timeline */}
          <div>
            <div className="text-xs font-mono font-bold text-gold-500 uppercase mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              CHRONOLOGICAL WORK LOGS ({task.history.length})
            </div>

            {task.history.length === 0 ? (
              <div className="text-xs text-slate-450 p-4 bg-navy-800 text-center">
                No recorded updates yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-500">
                {task.history.map((hist, idx) => (
                  <div key={hist.id || idx} className="relative">
                    {/* Node marker */}
                    <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 bg-gold-500 transform rotate-45" />

                    <div className="p-3.5 bg-navy-800 border border-navy-600/70">
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="font-bold text-cream-200">
                          {hist.date}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-gold-400 font-bold">
                            {hist.timeSpentHours}h
                          </span>
                          <span className="px-1.5 py-0.2 bg-navy-900 border border-navy-500 text-slate-350 text-[10px]">
                            {hist.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-350 italic mt-1.5">
                        "{hist.notes}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-navy-950 border-t border-navy-500 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-navy-800 hover:bg-navy-700 text-cream-200 text-xs font-mono"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

