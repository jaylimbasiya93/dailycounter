import React from 'react';
import { useApp } from '../../context/AppDataContext';
import type { TabType } from '../../types';
import { LayoutDashboard, BarChart3, History, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-50/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-zinc-800/80 pb-safe pt-1.5 px-4">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center py-2 px-1 rounded-2xl transition-colors outline-none select-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-accent-500/10 dark:bg-accent-500/20 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div
                className={`relative z-10 flex flex-col items-center transition-colors ${
                  isActive
                    ? 'text-accent-600 dark:text-accent-400 font-semibold'
                    : 'text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300'
                }`}
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                </motion.div>
                <span className="text-[11px] leading-tight font-medium tracking-tight">
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
