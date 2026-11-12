import React from 'react';
import { ArrowRight, CheckCircle2, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { CURRENT_DATE_STR } from '../../services/sampleData';

export const DashboardHero: React.FC = () => {
  const { isTodayReportSubmitted, setActiveSection, setSelectedReportDate, state, missedStats } = useWorkPulse();

  const activeDailySchedule = state.schedules.find(s => s.isActive && s.frequency === 'Daily');
  const missedCount = missedStats.missed.length;

  const handleCreateReport = () => {
    setSelectedReportDate(CURRENT_DATE_STR);
    setActiveSection('daily-logs');
  };

  return (
    <div className="relative bg-navy-850 border border-navy-500 overflow-hidden chamfer-tr">
      {/* Geometric line composition on the background */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none gold-diagonal-stripe" />
      <div className="absolute -top-12 right-20 w-32 h-64 border-r-2 border-gold-500/30 transform rotate-12 pointer-events-none" />
      <div className="absolute -bottom-8 right-40 w-48 h-32 border-t-2 border-red-500/20 transform -rotate-6 pointer-events-none" />
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-gold-500 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500 pointer-events-none" />

      <div className="p-6 md:p-8 relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Editorial Headline */}
        <div className="max-w-2xl">
          {/* Status pill & Active schedule */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            {isTodayReportSubmitted ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold-500/15 border border-gold-500 text-gold-400 text-[11px] font-bold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" />
                REPORT SUBMITTED FOR TODAY
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/15 border border-red-500 text-red-400 text-[11px] font-bold font-mono animate-pulse">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                DAILY REPORT PENDING
              </span>
            )}

            {activeDailySchedule && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-navy-800 border border-navy-500 text-slate-350 text-[11px] font-mono">
                <Calendar className="w-3.5 h-3.5 text-gold-500" />
                TRACK: {activeDailySchedule.name.toUpperCase()} (MON–FRI)
              </span>
            )}

            {missedCount > 0 && (
              <button
                onClick={() => setActiveSection('daily-logs')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-950/80 border border-red-500 text-red-300 text-[11px] font-mono hover:bg-red-900 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                {missedCount} MISSED {missedCount === 1 ? 'DAY' : 'DAYS'} TO BACKFILL
              </button>
            )}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-cream-200 tracking-tight leading-none">
            MAKE EVERY <span className="text-gold-500 underline decoration-red-500 decoration-4 underline-offset-8">DAY COUNT.</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-350 font-normal max-w-xl">
            "Your work. Your progress. Your growth." Record deep-work milestones, document friction points, and build deliberate velocity.
          </p>
        </div>

        {/* Right Column: High-contrast Action & Micro Stat */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3">
          <button
            onClick={handleCreateReport}
            className="flex items-center gap-3 px-6 py-3.5 bg-gold-500 hover:bg-gold-400 text-navy-950 font-black tracking-wider text-sm transition-all shadow-geometric-gold active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>{isTodayReportSubmitted ? 'VIEW / EDIT DAILY LOG' : 'CREATE DAILY REPORT'}</span>
            <ArrowRight className="w-4 h-4 text-navy-950" />
          </button>

          <div className="text-[11px] font-mono text-slate-450 flex items-center gap-2">
            <span className="w-2 h-2 bg-gold-500" />
            <span>SESSION DATE: {CURRENT_DATE_STR}</span>
          </div>
        </div>
      </div>

      {/* Bottom gold separator line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-gold-500 via-navy-500 to-red-500" />
    </div>
  );
};

