import React from 'react';
import { AppProvider, useApp } from './context/AppDataContext';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { DashboardView } from './views/DashboardView';
import { AnalyticsView } from './views/AnalyticsView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { motion, AnimatePresence } from 'framer-motion';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors duration-300">
      <Header />
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'history' && <HistoryView />}
            {activeTab === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNavigation />
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
