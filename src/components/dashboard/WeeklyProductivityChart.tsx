import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { useWorkPulse } from '../../context/WorkPulseContext';
import { CURRENT_DATE_STR } from '../../services/sampleData';

interface DayData {
  dayName: string;
  dateStr: string;
  completedTasks: number;
  hoursSpent: number;
  isMissed: boolean;
  isToday: boolean;
  isFuture: boolean;
  hasReport: boolean;
}

export const WeeklyProductivityChart: React.FC = () => {
  const { state, missedStats } = useWorkPulse();

  // Dynamically compute the Monday-to-Sunday week containing CURRENT_DATE_STR
  const weekDays = React.useMemo(() => {
    const curr = new Date(CURRENT_DATE_STR + 'T00:00:00');
    const dayOfWeek = curr.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(curr.getTime() + diffToMon * 86400000);
    const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    return dayNames.map((dayName, idx) => {
      const d = new Date(monday.getTime() + idx * 86400000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return { dayName, dateStr: `${yyyy}-${mm}-${dd}` };
    });
  }, []);

  const missedDateSet = new Set(missedStats.missed.map(m => m.date));

  const chartData: DayData[] = weekDays.map(({ dayName, dateStr }) => {
    const report = state.dailyReports.find(r => r.date === dateStr);
    const isMissed = missedDateSet.has(dateStr);
    const isToday = dateStr === CURRENT_DATE_STR;
    const isFuture = dateStr > CURRENT_DATE_STR;

    let completedTasks = 0;
    let hoursSpent = 0;

    if (report) {
      completedTasks = report.taskEntries.filter(e => e.status === 'Completed' || e.status === 'Done').length;
      if (completedTasks === 0 && report.taskEntries.length > 0) {
        // If tasks were worked on but none finished, count total active entries
        completedTasks = report.taskEntries.length;
      }
      hoursSpent = report.taskEntries.reduce((acc, e) => acc + (e.actualHours || 0), 0);
    }

    return {
      dayName,
      dateStr,
      completedTasks: isMissed ? 1 : completedTasks, // show minimal red bar for missed
      hoursSpent,
      isMissed,
      isToday,
      isFuture,
      hasReport: Boolean(report),
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DayData = payload[0].payload;
      return (
        <div className="bg-navy-900 border border-navy-500 p-3 shadow-xl font-mono text-xs">
          <div className="font-display text-sm text-cream-200 tracking-wider">
            {data.dayName} ({data.dateStr})
          </div>
          {data.isFuture ? (
            <div className="text-slate-450 mt-1">Upcoming schedule</div>
          ) : data.isMissed ? (
            <div className="text-red-400 font-bold mt-1">Missed Reporting Period</div>
          ) : data.hasReport ? (
            <div className="space-y-1 mt-1 text-slate-350">
              <div className="text-gold-400 font-bold">
                Tasks Logged: {data.completedTasks}
              </div>
              <div className="text-slate-350">
                Total Hours: {data.hoursSpent}h
              </div>
            </div>
          ) : (
            <div className="text-slate-450 mt-1">
              {data.isToday ? 'Today (Pending Report)' : 'No report submitted'}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-navy-800 border border-navy-500 p-5 relative">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-navy-500 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-gold-500 rotate-45" />
          <h2 className="font-display text-xl tracking-wider text-cream-200">
            WEEKLY PRODUCTIVITY VELOCITY
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-350">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-gold-500 inline-block" />
            COMPLETED WORK
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 inline-block" />
            MISSED PERIOD
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-navy-600 inline-block" />
            UPCOMING
          </span>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="dayName"
              stroke="#A7ADC3"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#343957' }}
            />
            <YAxis
              stroke="#A7ADC3"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={{ stroke: '#343957' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(52, 57, 87, 0.3)' }} />
            <Bar dataKey="completedTasks" radius={[0, 0, 0, 0]}>
              {chartData.map((entry, index) => {
                let fillColor = '#FFAA00'; // Gold for completed
                if (entry.isMissed) {
                  fillColor = '#FF001E'; // Red for missed
                } else if (entry.isFuture) {
                  fillColor = '#202744'; // Muted navy for future
                } else if (!entry.hasReport && entry.isToday) {
                  fillColor = '#FFAA00'; // Today outline
                } else if (!entry.hasReport) {
                  fillColor = '#29314F';
                }

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fillColor}
                    stroke={entry.isToday ? '#FFAA00' : 'none'}
                    strokeWidth={entry.isToday ? 2 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-navy-500/60 flex items-center justify-between text-xs font-mono text-slate-450">
        <span>CURRENT SPRINT WEEK: NOV 09 – NOV 15</span>
        <span className="text-gold-500 font-bold">TARGET: 100% ON-TIME REPORTING</span>
      </div>
    </div>
  );
};

