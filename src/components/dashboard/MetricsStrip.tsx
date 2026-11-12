import React from 'react';
import { CheckCircle, Clock, Zap, Star, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';

export const MetricsStrip: React.FC = () => {
  const { state, setActiveSection } = useWorkPulse();

  const totalTasks = state.tasks.filter(t => !t.archived).length;
  const completedTasks = state.tasks.filter(t => !t.archived && (t.status === 'Completed' || t.status === 'Done')).length;
  const inProgressTasks = state.tasks.filter(t => !t.archived && t.status === 'In Progress').length;
  const pendingTasks = state.tasks.filter(t => !t.archived && (t.status === 'Started' || t.status === 'Testing' || t.status === 'Debugging')).length;

  const validRatings = state.dailyReports.map(r => r.performanceRating).filter(Boolean);
  const avgRating = validRatings.length > 0 
    ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1) 
    : '0.0';

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* 1. Total Tasks */}
      <div 
        onClick={() => setActiveSection('tasks')}
        className="bg-navy-800 border border-navy-500 p-4 relative cursor-pointer hover:border-gold-500/70 transition-colors group"
      >
        <div className="flex items-center justify-between text-slate-350 text-xs font-mono mb-1">
          <span>TOTAL TASKS</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gold-500" />
        </div>
        <div className="font-display text-4xl text-cream-200 tracking-tight">
          {totalTasks}
        </div>
        <div className="mt-2 text-[11px] text-slate-450 font-mono">
          Across {new Set(state.tasks.map(t => t.project)).size} projects
        </div>
        <div className="absolute top-0 right-0 w-2 h-2 bg-navy-500 group-hover:bg-gold-500 transition-colors" />
      </div>

      {/* 2. Completed Tasks (Gold Highlight) */}
      <div 
        onClick={() => setActiveSection('tasks')}
        className="bg-navy-800 border-l-4 border-l-gold-500 border-t border-r border-b border-navy-500 p-4 relative cursor-pointer hover:border-gold-500 transition-colors group"
      >
        <div className="flex items-center justify-between text-gold-500 text-xs font-mono font-bold mb-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" />
            COMPLETED
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gold-500" />
        </div>
        <div className="font-display text-4xl text-gold-500 tracking-tight">
          {completedTasks}
        </div>
        <div className="mt-2 text-[11px] text-gold-400/80 font-mono">
          {completionRate}% of active workload
        </div>
      </div>

      {/* 3. In Progress */}
      <div 
        onClick={() => setActiveSection('tasks')}
        className="bg-navy-800 border border-navy-500 p-4 relative cursor-pointer hover:border-gold-500/70 transition-colors group"
      >
        <div className="flex items-center justify-between text-slate-350 text-xs font-mono mb-1">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-gold-500" />
            IN PROGRESS
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gold-500" />
        </div>
        <div className="font-display text-4xl text-cream-200 tracking-tight">
          {inProgressTasks}
        </div>
        <div className="mt-2 text-[11px] text-slate-450 font-mono">
          Actively moving
        </div>
      </div>

      {/* 4. Pending / Testing / Debugging */}
      <div 
        onClick={() => setActiveSection('tasks')}
        className="bg-navy-800 border border-navy-500 p-4 relative cursor-pointer hover:border-gold-500/70 transition-colors group"
      >
        <div className="flex items-center justify-between text-slate-350 text-xs font-mono mb-1">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-450" />
            PENDING / QA
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gold-500" />
        </div>
        <div className="font-display text-4xl text-cream-200 tracking-tight">
          {pendingTasks}
        </div>
        <div className="mt-2 text-[11px] text-slate-450 font-mono">
          Testing & Debugging
        </div>
      </div>

      {/* 5. Average Performance Rating (Editorial Accent) */}
      <div 
        onClick={() => setActiveSection('analytics')}
        className="col-span-2 md:col-span-1 bg-navy-750 border-r-4 border-r-gold-500 border-t border-l border-b border-navy-500 p-4 relative cursor-pointer hover:border-gold-500 transition-colors group shadow-subtle-glow"
      >
        <div className="flex items-center justify-between text-gold-500 text-xs font-mono font-bold mb-1">
          <span className="flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-gold-500" />
            AVG RATING
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-gold-500" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl text-cream-200 tracking-tight">
            {avgRating}
          </span>
          <span className="text-xs text-slate-450 font-mono">/ 5.0</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-350 font-mono">
          Across {validRatings.length} daily logs
        </div>
      </div>
    </div>
  );
};

