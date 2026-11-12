import React from 'react';
import { Clock, User, Folder, CheckCircle, ArrowRight, AlertCircle, Plus } from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { TaskStatus } from '../../types';
import { CURRENT_DATE_STR } from '../../services/sampleData';

const getStatusBadge = (status: TaskStatus) => {
  switch (status) {
    case 'Completed':
    case 'Done':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    case 'In Progress':
      return 'bg-gold-500/20 text-gold-400 border-gold-500/50';
    case 'Debugging':
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'Testing':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    default:
      return 'bg-navy-600 text-slate-350 border-navy-500';
  }
};

export const DailyTimeline: React.FC = () => {
  const { todayReport, state, setActiveSection, setSelectedReportDate } = useWorkPulse();

  // If today has a report with task entries, use those; otherwise show active tasks
  const items = todayReport?.taskEntries && todayReport.taskEntries.length > 0
    ? todayReport.taskEntries.map(e => {
        const fullTask = state.tasks.find(t => t.id === e.taskId);
        return {
          id: e.taskId,
          name: e.taskName,
          assignedBy: e.assignedBy,
          project: e.project,
          status: e.status,
          timeSpent: e.actualHours,
          notes: e.progressNotes || fullTask?.latestNotes || 'Progress recorded in daily log.',
          isReportEntry: true
        };
      })
    : state.tasks.filter(t => !t.archived && t.status !== 'Done' && t.status !== 'Completed').slice(0, 5).map(t => ({
        id: t.id,
        name: t.name,
        assignedBy: t.assignedBy,
        project: t.project,
        status: t.status,
        timeSpent: t.actualHours,
        notes: t.latestNotes || 'Active task in current sprint.',
        isReportEntry: false
      }));

  const handleOpenReport = () => {
    setSelectedReportDate(CURRENT_DATE_STR);
    setActiveSection('daily-logs');
  };

  return (
    <div className="bg-navy-800 border border-navy-500 p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-navy-500 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-gold-500 rotate-45" />
          <h2 className="font-display text-xl tracking-wider text-cream-200">
            TODAY'S WORK TIMELINE
          </h2>
          <span className="text-xs font-mono text-slate-450 ml-1">({CURRENT_DATE_STR})</span>
        </div>

        <button
          onClick={handleOpenReport}
          className="text-xs font-mono text-gold-500 hover:text-gold-400 flex items-center gap-1 transition-colors"
        >
          <span>{todayReport ? 'EDIT LOG' : '+ LOG WORK'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline items */}
      {items.length === 0 ? (
        <div className="py-12 text-center text-slate-450 text-xs">
          <p>No tasks logged for today yet.</p>
          <button
            onClick={handleOpenReport}
            className="mt-3 px-3.5 py-1.5 bg-gold-500 text-navy-950 text-xs font-bold font-mono"
          >
            CREATE TODAY'S REPORT
          </button>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-500">
          {items.map((item, idx) => (
            <div key={item.id + idx} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 bg-navy-900 border-2 border-gold-500 transform rotate-45 group-hover:scale-125 transition-transform" />

              <div className="bg-navy-750/70 border border-navy-500/80 p-3.5 hover:border-gold-500/50 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-sm text-cream-200 group-hover:text-gold-400 transition-colors">
                    {item.name}
                  </h3>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${getStatusBadge(item.status)}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>

                {/* Metadata strip */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-350 font-mono my-2">
                  <span className="flex items-center gap-1 text-slate-350">
                    <Folder className="w-3 h-3 text-gold-500" />
                    {item.project}
                  </span>
                  <span className="flex items-center gap-1 text-slate-450">
                    <User className="w-3 h-3" />
                    {item.assignedBy}
                  </span>
                  <span className="flex items-center gap-1 text-gold-500/90 font-bold">
                    <Clock className="w-3 h-3" />
                    {item.timeSpent}h logged
                  </span>
                </div>

                {/* Progress note */}
                <p className="text-xs text-slate-350 bg-navy-850/60 p-2.5 border-l-2 border-gold-500/60 italic">
                  "{item.notes}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

