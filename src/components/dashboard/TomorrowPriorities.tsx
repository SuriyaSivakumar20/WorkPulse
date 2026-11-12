import React from 'react';
import { ArrowRight, Calendar, CheckSquare, FastForward } from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { CURRENT_DATE_STR } from '../../services/sampleData';

export const TomorrowPriorities: React.FC = () => {
  const { todayReport, state, setActiveSection, setSelectedReportDate } = useWorkPulse();

  // If today's report has a next-day plan, show that
  const nextDayPlanText = todayReport?.nextDayPlan;

  // Active tasks carried forward
  const activeCarriedTasks = state.tasks.filter(
    t => !t.archived && (t.status === 'In Progress' || t.status === 'Started' || t.status === 'Debugging')
  ).slice(0, 4);

  // Tomorrow date calculation
  const todayObj = new Date(CURRENT_DATE_STR + 'T12:00:00');
  const tomorrowObj = new Date(todayObj.getTime() + 86400000);
  const tomorrowYyyy = tomorrowObj.getFullYear();
  const tomorrowMm = String(tomorrowObj.getMonth() + 1).padStart(2, '0');
  const tomorrowDd = String(tomorrowObj.getDate()).padStart(2, '0');
  const tomorrowDateStr = `${tomorrowYyyy}-${tomorrowMm}-${tomorrowDd}`;
  const tomorrowLabel = tomorrowObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();

  const handleOpenNextDay = () => {
    setSelectedReportDate(tomorrowDateStr);
    setActiveSection('daily-logs');
  };

  return (
    <div className="bg-navy-800 border border-navy-500 p-5 relative">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-navy-500 mb-4">
        <div className="flex items-center gap-2">
          <FastForward className="w-4 h-4 text-gold-500" />
          <h3 className="font-display text-xl tracking-wider text-cream-200">
            NEXT-DAY PRIORITIES & PIPELINE
          </h3>
          <span className="text-xs font-mono text-slate-450 ml-1">
            (PLANNED FOR {tomorrowLabel})
          </span>
        </div>

        <button
          onClick={handleOpenNextDay}
          className="text-xs font-mono text-gold-500 hover:text-gold-400 flex items-center gap-1 transition-colors"
        >
          <span>PLANNER WORKSPACE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Editorial Next-Day Strategy */}
        <div className="lg:col-span-1 bg-navy-750 p-4 border border-navy-600/50 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-gold-500 font-bold uppercase mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              RECORDED STRATEGY
            </div>
            <p className="text-xs text-cream-200 leading-relaxed italic">
              {nextDayPlanText 
                ? `"${nextDayPlanText}"` 
                : 'No plan recorded yet for tomorrow. Document your priorities in today\'s daily log to maintain momentum.'}
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedReportDate(CURRENT_DATE_STR);
              setActiveSection('daily-logs');
            }}
            className="mt-4 text-[11px] font-mono text-slate-350 hover:text-gold-400 text-left underline"
          >
            Update next-day reflection in Today's Log →
          </button>
        </div>

        {/* Carried Forward Task Cards */}
        {activeCarriedTasks.length === 0 ? (
          <div className="lg:col-span-2 p-6 bg-navy-850/80 border border-navy-500/70 text-center flex flex-col items-center justify-center text-slate-450 text-xs">
            <CheckSquare className="w-5 h-5 text-slate-500 mb-1.5" />
            <span>No active in-progress tasks. Create your first task to see carried pipeline items here.</span>
          </div>
        ) : (
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeCarriedTasks.map(task => (
              <div
                key={task.id}
                onClick={() => setActiveSection('tasks')}
                className="p-3 bg-navy-850/80 border border-navy-500/70 hover:border-gold-500/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-gold-400 font-bold">{task.project}</span>
                  <span className="text-slate-450">{task.actualHours}h logged</span>
                </div>
                <h4 className="text-xs font-bold text-cream-200 truncate">
                  {task.name}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-450">
                  <span>Priority: {task.priority}</span>
                  <span className="text-gold-500 font-bold uppercase">{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

