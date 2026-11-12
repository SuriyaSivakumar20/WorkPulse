import React, { useState } from 'react';
import { WorkPulseProvider, useWorkPulse } from './context/WorkPulseContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { DailyLogsView } from './components/daily-log/DailyLogsView';
import { TaskManagerView } from './components/tasks/TaskManagerView';
import { CalendarView } from './components/calendar/CalendarView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { BlockersView } from './components/blockers/BlockersView';
import { LearningJournalView } from './components/learning/LearningJournalView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const AppContent: React.FC = () => {
  const { activeSection, toastMessage } = useWorkPulse();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-navy-950 text-cream-200 overflow-hidden font-body selection:bg-gold-500 selection:text-navy-950">
      {/* Desktop Sidebar Rail */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Header */}
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-navy-900/90 relative">
          {/* Subtle background sports editorial stripes */}
          <div className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none editorial-stripe" />

          <div className="max-w-7xl mx-auto">
            {activeSection === 'dashboard' && <DashboardView />}
            {activeSection === 'daily-logs' && <DailyLogsView />}
            {activeSection === 'tasks' && <TaskManagerView />}
            {activeSection === 'calendar' && <CalendarView />}
            {activeSection === 'analytics' && <AnalyticsView />}
            {activeSection === 'blockers' && <BlockersView />}
            {activeSection === 'learning' && <LearningJournalView />}
            {activeSection === 'reports' && <ReportsView />}
            {activeSection === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-navy-900 border-2 border-gold-500 text-cream-200 px-4 py-3 shadow-2xl font-mono text-xs flex items-center gap-3 chamfer-tr">
            <span className="w-2 h-2 bg-gold-500 rotate-45" />
            <span className="font-bold">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WorkPulseProvider>
      <AppContent />
    </WorkPulseProvider>
  );
};

export default App;

