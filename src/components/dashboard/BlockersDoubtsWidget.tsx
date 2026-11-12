import React from 'react';
import { AlertCircle, HelpCircle, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';

export const BlockersDoubtsWidget: React.FC = () => {
  const { state, setActiveSection } = useWorkPulse();

  const unresolvedBlockers = state.blockers.filter(b => b.status !== 'Resolved');
  const unresolvedDoubts = state.doubts.filter(d => d.status !== 'Resolved');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Unresolved Blockers (Red Accent) */}
      <div className="bg-navy-800 border border-navy-500 p-5 relative overflow-hidden">
        {/* Red accent border top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />

        <div className="flex items-center justify-between pb-3 border-b border-navy-500 mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h3 className="font-display text-lg tracking-wider text-cream-200">
              UNRESOLVED BLOCKERS
            </h3>
            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold">
              {unresolvedBlockers.length} ACTIVE
            </span>
          </div>

          <button
            onClick={() => setActiveSection('blockers')}
            className="text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
          >
            <span>VIEW ALL</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {unresolvedBlockers.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-450 flex flex-col items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Zero active blockers reported. Path is clear.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {unresolvedBlockers.slice(0, 3).map(blocker => (
              <div
                key={blocker.id}
                onClick={() => setActiveSection('blockers')}
                className="p-3 bg-navy-750 border-l-2 border-l-red-500 border border-navy-600/50 hover:bg-navy-700/60 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-cream-200">
                    {blocker.title}
                  </h4>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 shrink-0 ${
                    blocker.severity === 'Critical' 
                      ? 'bg-red-500 text-cream-200 font-bold' 
                      : 'bg-navy-600 text-slate-350'
                  }`}>
                    {blocker.severity}
                  </span>
                </div>
                {blocker.relatedTaskName && (
                  <div className="text-[10px] font-mono text-slate-450 mt-1 truncate">
                    TASK: {blocker.relatedTaskName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Unresolved Doubts & Questions (Gold Accent) */}
      <div className="bg-navy-800 border border-navy-500 p-5 relative overflow-hidden">
        {/* Gold accent border top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gold-500" />

        <div className="flex items-center justify-between pb-3 border-b border-navy-500 mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-gold-500" />
            <h3 className="font-display text-lg tracking-wider text-cream-200">
              QUESTIONS TO DISCUSS
            </h3>
            <span className="px-1.5 py-0.5 bg-gold-500/20 text-gold-400 border border-gold-500/40 text-[10px] font-mono font-bold">
              {unresolvedDoubts.length} OPEN
            </span>
          </div>

          <button
            onClick={() => setActiveSection('blockers')}
            className="text-xs font-mono text-gold-500 hover:text-gold-400 flex items-center gap-1 transition-colors"
          >
            <span>VIEW ALL</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {unresolvedDoubts.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-450 flex flex-col items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-gold-500" />
            <span>No pending discussion items or architecture questions.</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {unresolvedDoubts.slice(0, 3).map(doubt => (
              <div
                key={doubt.id}
                onClick={() => setActiveSection('blockers')}
                className="p-3 bg-navy-750 border-l-2 border-l-gold-500 border border-navy-600/50 hover:bg-navy-700/60 cursor-pointer transition-colors"
              >
                <h4 className="text-xs font-bold text-cream-200 line-clamp-2">
                  {doubt.question}
                </h4>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-450 mt-1.5">
                  <span className="text-gold-400">{doubt.topic}</span>
                  <span className="text-slate-500">{doubt.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

