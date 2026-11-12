import React from 'react';
import { DashboardHero } from './DashboardHero';
import { MetricsStrip } from './MetricsStrip';
import { DailyTimeline } from './DailyTimeline';
import { WeeklyProductivityChart } from './WeeklyProductivityChart';
import { ActivityHeatmap } from './ActivityHeatmap';
import { BlockersDoubtsWidget } from './BlockersDoubtsWidget';
import { TomorrowPriorities } from './TomorrowPriorities';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Section */}
      <DashboardHero />

      {/* 2. Key Productivity Metrics */}
      <MetricsStrip />

      {/* 3. Editorial Two-Column: Daily Timeline & Weekly Productivity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 xl:col-span-5">
          <DailyTimeline />
        </div>
        <div className="lg:col-span-6 xl:col-span-7">
          <WeeklyProductivityChart />
        </div>
      </div>

      {/* 4. Activity Heatmap */}
      <ActivityHeatmap />

      {/* 5. Blockers & Unresolved Doubts */}
      <BlockersDoubtsWidget />

      {/* 6. Tomorrow's Priorities */}
      <TomorrowPriorities />
    </div>
  );
};

