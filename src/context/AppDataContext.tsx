import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { MomentumEntry, AppSettings, TabType, DayLog, AnalyticsSummary } from '../types';
import { DEFAULT_SETTINGS, generateSeedEntries } from '../utils/mockData';
import { getLocalDateStr } from '../utils/date';
import { soundEffects } from '../utils/audio';
import { hapticLight, hapticMedium, hapticSuccess } from '../utils/haptics';
import confetti from 'canvas-confetti';

interface AppContextType {
  entries: MomentumEntry[];
  settings: AppSettings;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  todayDateStr: string;
  todayCount: number;
  lifetimeCount: number;
  todayValue: number;
  currentStreak: number;
  longestStreak: number;
  weeklyAverage: number;
  monthlyAverage: number;
  dayLogs: DayLog[];
  analytics: AnalyticsSummary;
  incrementMomentum: (amount?: number) => void;
  decrementMomentum: (amount?: number) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  deleteEntry: (id: string) => void;
  deleteDayEntries: (date: string) => void;
  undoLastDelete: () => void;
  canUndo: boolean;
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
  resetData: () => void;
  seedSampleData: () => void;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_ENTRIES_KEY = 'daily_counter_entries_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'daily_counter_settings_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<MomentumEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ENTRIES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [undoStack, setUndoStack] = useState<MomentumEntry[][]>([]);

  // Sync entries to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ENTRIES_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save entries to localStorage', e);
    }
  }, [entries]);

  // Sync settings to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }

    soundEffects.setEnabled(settings.soundEnabled);
  }, [settings]);

  // Theme Sync
  useEffect(() => {
    const root = document.documentElement;
    const applyDark = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (settings.theme === 'dark') {
      applyDark(true);
    } else if (settings.theme === 'light') {
      applyDark(false);
    } else {
      // System mode
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyDark(systemDark);
    }
  }, [settings.theme]);

  // Dynamic Today Date string (YYYY-MM-DD in local timezone)
  const [todayDateStr, setTodayDateStr] = useState<string>(() => getLocalDateStr());

  // Midnight (00:00:00) Rollover Detector & Tab Focus Refresh
  useEffect(() => {
    const checkDateChange = () => {
      const currentLocal = getLocalDateStr();
      setTodayDateStr((prev) => (prev !== currentLocal ? currentLocal : prev));
    };

    const interval = setInterval(checkDateChange, 5000);
    window.addEventListener('focus', checkDateChange);
    document.addEventListener('visibilitychange', checkDateChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkDateChange);
      document.removeEventListener('visibilitychange', checkDateChange);
    };
  }, []);

  // Group entries into day logs sorted newest date first
  const dayLogs = useMemo(() => {
    const map: Record<string, MomentumEntry[]> = {};
    entries.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });

    const dates = Object.keys(map).sort((a, b) => b.localeCompare(a));
    return dates.map((date) => {
      const dayEntries = map[date];
      const totalCount = dayEntries.reduce((acc, cur) => acc + cur.count, 0);
      return {
        date,
        totalCount: Math.max(0, totalCount),
        entries: dayEntries.sort((a, b) => b.timestamp - a.timestamp),
      };
    });
  }, [entries]);

  // Derived key statistics
  const todayCount = useMemo(() => {
    const log = dayLogs.find((l) => l.date === todayDateStr);
    return log ? log.totalCount : 0;
  }, [dayLogs, todayDateStr]);

  const lifetimeCount = useMemo(() => {
    return dayLogs.reduce((sum, day) => sum + day.totalCount, 0);
  }, [dayLogs]);

  const todayValue = useMemo(() => {
    return todayCount * settings.valuePerMomentum;
  }, [todayCount, settings.valuePerMomentum]);

  // Streak computations
  const { currentStreak, longestStreak } = useMemo(() => {
    if (dayLogs.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    let streak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Map date string -> total count
    const countMap = new Map<string, number>();
    dayLogs.forEach((l) => countMap.set(l.date, l.totalCount));

    // Calculate current active streak backwards from today or yesterday
    let checkDate = new Date(today);
    let checkStr = getLocalDateStr(checkDate);
    
    // If today hasn't hit goal yet, check yesterday to continue streak
    if ((countMap.get(checkStr) || 0) < 1) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = getLocalDateStr(checkDate);
    }

    while (countMap.has(checkStr) && (countMap.get(checkStr) || 0) > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = getLocalDateStr(checkDate);
    }

    // Calculate longest historical streak
    const sortedDates = Array.from(countMap.keys()).sort();
    let prevTimestamp: number | null = null;

    for (const dStr of sortedDates) {
      const cnt = countMap.get(dStr) || 0;
      if (cnt > 0) {
        const curTs = new Date(dStr).getTime();
        if (prevTimestamp && curTs - prevTimestamp === 86400000) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        prevTimestamp = curTs;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      }
    }

    return { currentStreak: streak, longestStreak: Math.max(streak, maxStreak) };
  }, [dayLogs]);

  // Weekly & Monthly Averages
  const weeklyAverage = useMemo(() => {
    const last7Days = dayLogs.slice(0, 7);
    if (last7Days.length === 0) return 0;
    const sum = last7Days.reduce((acc, d) => acc + d.totalCount, 0);
    return Math.round((sum / 7) * 10) / 10;
  }, [dayLogs]);

  const monthlyAverage = useMemo(() => {
    const last30Days = dayLogs.slice(0, 30);
    if (last30Days.length === 0) return 0;
    const sum = last30Days.reduce((acc, d) => acc + d.totalCount, 0);
    return Math.round((sum / 30) * 10) / 10;
  }, [dayLogs]);

  // Advanced Analytics
  const analytics: AnalyticsSummary = useMemo(() => {
    if (dayLogs.length === 0) {
      return {
        bestDay: { date: todayDateStr, count: 0 },
        worstDay: { date: todayDateStr, count: 0 },
        dailyAverage: 0,
        consistencyScore: 0,
        trendPercentage: 0,
        projected10DayTotal: 0,
        projectedMonthlyTotal: 0,
      };
    }

    let best = { date: dayLogs[0].date, count: dayLogs[0].totalCount };
    let worst = { date: dayLogs[0].date, count: dayLogs[0].totalCount };
    let sum = 0;
    let daysMeetingGoal = 0;

    dayLogs.forEach((l) => {
      sum += l.totalCount;
      if (l.totalCount > best.count) best = { date: l.date, count: l.totalCount };
      if (l.totalCount < worst.count && l.totalCount > 0) worst = { date: l.date, count: l.totalCount };
      if (l.totalCount >= settings.dailyGoal) daysMeetingGoal++;
    });

    const avg = sum / dayLogs.length;
    const consistency = Math.round((daysMeetingGoal / dayLogs.length) * 100);

    // Trend %: compare recent 7 days vs previous 7 days
    const recent7 = dayLogs.slice(0, 7).reduce((a, b) => a + b.totalCount, 0);
    const prev7 = dayLogs.slice(7, 14).reduce((a, b) => a + b.totalCount, 0);
    const trend = prev7 > 0 ? Math.round(((recent7 - prev7) / prev7) * 100) : 15;

    const projected10Day = Math.round(avg * 10);
    const projectedMonthly = Math.round(avg * 30);

    return {
      bestDay: best,
      worstDay: worst,
      dailyAverage: Math.round(avg * 10) / 10,
      consistencyScore: consistency,
      trendPercentage: trend,
      projected10DayTotal: projected10Day,
      projectedMonthlyTotal: projectedMonthly,
    };
  }, [dayLogs, settings.dailyGoal, todayDateStr]);

  // Confetti trigger for daily goal celebration
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
    });
  };

  // Increment Momentum (+1)
  const incrementMomentum = (amount = 1) => {
    const now = Date.now();
    const newEntry: MomentumEntry = {
      id: `entry-${now}`,
      date: todayDateStr,
      timestamp: now,
      count: amount,
    };

    setEntries((prev) => [newEntry, ...prev]);

    if (settings.soundEnabled) soundEffects.playIncrement();
    if (settings.hapticsEnabled) hapticLight();

    // Check if goal was just reached
    if (todayCount + amount >= settings.dailyGoal && todayCount < settings.dailyGoal) {
      if (settings.soundEnabled) soundEffects.playGoalComplete();
      if (settings.hapticsEnabled) hapticSuccess();
      triggerConfetti();
    }
  };

  // Decrement Momentum (-1)
  const decrementMomentum = (amount = 1) => {
    if (todayCount <= 0) return;

    const now = Date.now();
    const newEntry: MomentumEntry = {
      id: `entry-dec-${now}`,
      date: todayDateStr,
      timestamp: now,
      count: -amount,
    };

    setEntries((prev) => [newEntry, ...prev]);

    if (settings.soundEnabled) soundEffects.playDecrement();
    if (settings.hapticsEnabled) hapticMedium();
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const deleteEntry = (id: string) => {
    const toRemove = entries.filter((e) => e.id === id);
    setUndoStack((prev) => [toRemove, ...prev]);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const deleteDayEntries = (date: string) => {
    const toRemove = entries.filter((e) => e.date === date);
    setUndoStack((prev) => [toRemove, ...prev]);
    setEntries((prev) => prev.filter((e) => e.date !== date));
  };

  const undoLastDelete = () => {
    if (undoStack.length === 0) return;
    const lastDeleted = undoStack[0];
    setUndoStack((prev) => prev.slice(1));
    setEntries((prev) => [...lastDeleted, ...prev]);
  };

  const exportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      entries,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-counter-backup-${todayDateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.entries)) {
        setEntries(parsed.entries);
        if (parsed.settings) {
          setSettings((prev) => ({ ...prev, ...parsed.settings }));
        }
        return true;
      }
    } catch {
      // Invalid format
    }
    return false;
  };

  const resetData = () => {
    setEntries([]);
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(LOCAL_STORAGE_ENTRIES_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SETTINGS_KEY);
  };

  const seedSampleData = () => {
    setEntries(generateSeedEntries());
  };

  return (
    <AppContext.Provider
      value={{
        entries,
        settings,
        activeTab,
        setActiveTab,
        todayDateStr,
        todayCount,
        lifetimeCount,
        todayValue,
        currentStreak,
        longestStreak,
        weeklyAverage,
        monthlyAverage,
        dayLogs,
        analytics,
        incrementMomentum,
        decrementMomentum,
        updateSettings,
        deleteEntry,
        deleteDayEntries,
        undoLastDelete,
        canUndo: undoStack.length > 0,
        exportData,
        importData,
        resetData,
        seedSampleData,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
