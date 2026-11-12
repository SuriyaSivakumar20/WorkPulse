import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Star,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { useWorkPulse } from '../../context/WorkPulseContext';

const COLORS = ['#FFAA00', '#FF001E', '#343957', '#464E72', '#F4F2EA', '#202744'];

export const AnalyticsView: React.FC = () => {
  const { state } = useWorkPulse();

  const totalTasks = state.tasks.filter(t => !t.archived).length;
  const completedTasks = state.tasks.filter(t => !t.archived && (t.status === 'Completed' || t.status === 'Done')).length;
  const carriedForward = state.tasks.filter(t => !t.archived && t.history.length > 1).length;
  const blockersCount = state.blockers.length;

  const validRatings = state.dailyReports.map(r => r.performanceRating);
  const avgRating = validRatings.length > 0
    ? (validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length).toFixed(1)
    : '0.0';

  const weeklyCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const monthlyCompletionRate = Math.min(100, Math.round(weeklyCompletionRate * 0.95 + 5));

  // 1. Daily Task Completion & Hours (Chronological)
  const dailyCompletionData = [...state.dailyReports]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(r => ({
      date: r.date.slice(5), // MM-DD
      tasksCount: r.taskEntries.length,
      hours: r.taskEntries.reduce((sum, e) => sum + (e.actualHours || 0), 0),
      rating: r.performanceRating
    }));

  // 2. Performance Rating Distribution (1 to 5)
  const ratingDistribution = [1, 2, 3, 4, 5].map(score => ({
    rating: `${score}★`,
    count: state.dailyReports.filter(r => r.performanceRating === score).length
  }));

  // 3. Project-wise Task Distribution
  const projectMap = new Map<string, number>();
  state.tasks.forEach(t => {
    projectMap.set(t.project, (projectMap.get(t.project) || 0) + 1);
  });
  const projectDistribution = Array.from(projectMap.entries()).map(([name, count]) => ({
    name,
    count
  }));

  // 4. Weekly Productivity Trend (Grouped by sprint days)
  const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayStats: Record<string, { completed: number; hours: number }> = {
    Mon: { completed: 0, hours: 0 },
    Tue: { completed: 0, hours: 0 },
    Wed: { completed: 0, hours: 0 },
    Thu: { completed: 0, hours: 0 },
    Fri: { completed: 0, hours: 0 },
  };

  state.dailyReports.forEach(r => {
    const d = new Date(r.date + 'T12:00:00');
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    if (dayStats[day]) {
      const completed = r.taskEntries.filter(e => e.status === 'Completed' || e.status === 'Done').length;
      const hours = r.taskEntries.reduce((sum, e) => sum + (e.actualHours || 0), 0);
      dayStats[day].completed += completed;
      dayStats[day].hours += hours;
    }
  });

  const weeklyTrendData = dayNamesShort.map(day => ({
    day,
    completed: dayStats[day].completed,
    hours: Number(dayStats[day].hours.toFixed(1))
  }));

  // Best day computation
  const bestDay = [...dayNamesShort].sort((a, b) => dayStats[b].hours - dayStats[a].hours)[0];
  const hasLoggedWork = state.dailyReports.length > 0;

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-900 border border-navy-500 p-3 shadow-xl font-mono text-xs">
          <div className="font-display text-sm text-cream-200 tracking-wider">
            {label}
          </div>
          {payload.map((p: any, idx: number) => (
            <div key={idx} style={{ color: p.color || '#FFAA00' }} className="mt-1">
              {p.name}: {p.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-gold-500" />
            <h1 className="font-display text-3xl tracking-wider text-cream-200">
              PERFORMANCE ANALYTICS
            </h1>
          </div>
          <p className="text-xs text-slate-350 mt-1">
            Empirical velocity metrics, deep-work output, and blocker severity diagnostics.
          </p>
        </div>
      </div>

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-navy-800 border border-navy-500 p-4">
          <div className="text-[10px] font-mono text-slate-450 uppercase mb-1">TOTAL TASKS</div>
          <div className="font-display text-3xl text-cream-200">{totalTasks}</div>
        </div>

        <div className="bg-navy-800 border-l-4 border-l-gold-500 border-t border-r border-b border-navy-500 p-4">
          <div className="text-[10px] font-mono text-gold-500 uppercase font-bold mb-1">COMPLETED</div>
          <div className="font-display text-3xl text-gold-500">{completedTasks}</div>
        </div>

        <div className="bg-navy-800 border border-navy-500 p-4">
          <div className="text-[10px] font-mono text-slate-450 uppercase mb-1">CARRIED FORWARD</div>
          <div className="font-display text-3xl text-cream-200">{carriedForward}</div>
        </div>

        <div className="bg-navy-800 border border-navy-500 p-4">
          <div className="text-[10px] font-mono text-gold-400 uppercase font-bold mb-1">AVG RATING</div>
          <div className="font-display text-3xl text-cream-200">{avgRating}<span className="text-xs font-mono text-slate-500">/5</span></div>
        </div>

        <div className="bg-navy-800 border border-navy-500 p-4">
          <div className="text-[10px] font-mono text-slate-450 uppercase mb-1">WEEKLY RATE</div>
          <div className="font-display text-3xl text-cream-200">{weeklyCompletionRate}%</div>
        </div>

        <div className="bg-navy-800 border-l-4 border-l-red-500 border-t border-r border-b border-navy-500 p-4">
          <div className="text-[10px] font-mono text-red-400 uppercase font-bold mb-1">BLOCKERS</div>
          <div className="font-display text-3xl text-red-400">{blockersCount}</div>
        </div>
      </div>

      {/* Row 1 Charts: Daily Completion Trend & Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Daily Task Completion & Hours Logged */}
        <div className="lg:col-span-7 bg-navy-800 border border-navy-500 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-navy-500 mb-4">
            <h3 className="font-display text-lg tracking-wider text-cream-200">
              1. DAILY TASK VOLUME & HOURS LOGGED
            </h3>
            <span className="text-xs font-mono text-slate-450">CHRONOLOGICAL</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCompletionData}>
                <CartesianGrid stroke="#1F2643" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#A7ADC3" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#A7ADC3" fontSize={11} fontFamily="monospace" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tasksCount" name="Tasks Logged" fill="#FFAA00" radius={[0, 0, 0, 0]} />
                <Bar dataKey="hours" name="Hours Spent" fill="#343957" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Performance Rating Distribution */}
        <div className="lg:col-span-5 bg-navy-800 border border-navy-500 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-navy-500 mb-4">
            <h3 className="font-display text-lg tracking-wider text-cream-200">
              2. PERFORMANCE RATING DISTRIBUTION
            </h3>
            <span className="text-xs font-mono text-gold-500 font-bold">1–5 SCALE</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingDistribution} layout="vertical">
                <CartesianGrid stroke="#1F2643" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#A7ADC3" fontSize={11} fontFamily="monospace" allowDecimals={false} />
                <YAxis dataKey="rating" type="category" stroke="#FFAA00" fontSize={12} fontFamily="monospace" fontStyle="bold" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Frequency" fill="#FFAA00">
                  {ratingDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index >= 3 ? '#FFAA00' : index === 2 ? '#343957' : '#FF001E'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Weekly Trend & Project Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Weekly Productivity Trend */}
        <div className="lg:col-span-6 bg-navy-800 border border-navy-500 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-navy-500 mb-4">
            <h3 className="font-display text-lg tracking-wider text-cream-200">
              3. WEEKLY SPRINT VELOCITY TREND
            </h3>
            <span className="text-xs font-mono text-slate-450">HOURS & OUTPUT</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData}>
                <CartesianGrid stroke="#1F2643" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="#A7ADC3" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#A7ADC3" fontSize={11} fontFamily="monospace" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="hours"
                  name="Hours"
                  stroke="#FFAA00"
                  strokeWidth={3}
                  dot={{ fill: '#FFAA00', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#F4F2EA"
                  strokeWidth={2}
                  dot={{ fill: '#F4F2EA', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Project-wise Distribution */}
        <div className="lg:col-span-6 bg-navy-800 border border-navy-500 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-navy-500 mb-4">
            <h3 className="font-display text-lg tracking-wider text-cream-200">
              4. PROJECT-WISE TASK ALLOCATION
            </h3>
            <span className="text-xs font-mono text-slate-450">{projectDistribution.length} TRACKS</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectDistribution} layout="vertical">
                <CartesianGrid stroke="#1F2643" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#A7ADC3" fontSize={11} fontFamily="monospace" allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#A7ADC3" fontSize={10} width={130} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Tasks" fill="#FFAA00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Empirical Insights from Real Records */}
      <div className="bg-navy-800 border border-navy-500 p-6 relative">
        <div className="flex items-center gap-2 pb-3 border-b border-navy-500 mb-4">
          <Award className="w-5 h-5 text-gold-500" />
          <h3 className="font-display text-xl tracking-wider text-cream-200">
            COMPUTED PERFORMANCE INSIGHTS
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-navy-750 border border-navy-600/60">
            <div className="text-xs font-mono font-bold text-gold-500 uppercase mb-1">
              PEAK VELOCITY WINDOWS
            </div>
            <p className="text-xs text-slate-350 leading-relaxed">
              {hasLoggedWork
                ? `${bestDay}days lead with the highest cumulative output and focus hours logged across your sprint cadences.`
                : 'No work logs recorded yet. Once you submit daily reports, your personal peak velocity and deep work days will appear here.'}
            </p>
          </div>

          <div className="p-4 bg-navy-750 border border-navy-600/60">
            <div className="text-xs font-mono font-bold text-red-400 uppercase mb-1">
              FREQUENT IMPEDIMENTS
            </div>
            <p className="text-xs text-slate-350 leading-relaxed">
              {blockersCount > 0
                ? `${blockersCount} total blockers have been logged. Tracking and categorizing blockers enables rapid systemic resolution.`
                : 'Zero active blockers reported. As you document friction points, common bottlenecks will be highlighted here.'}
            </p>
          </div>

          <div className="p-4 bg-navy-750 border border-navy-600/60">
            <div className="text-xs font-mono font-bold text-cream-200 uppercase mb-1">
              CONTINUITY & DRIFT
            </div>
            <p className="text-xs text-slate-350 leading-relaxed">
              {carriedForward > 0
                ? `${carriedForward} tasks span multiple working days. Carried forward tasks preserve complete progress history.`
                : 'No multi-day task drift detected. All active tasks are current or newly scheduled.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

