export interface MomentumEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number; // Unix timestamp ms
  count: number; // Delta (e.g. +1, +5, -1)
  note?: string;
}

export interface PersonTarget {
  id: string;
  name: string;
  score: number;
  target: number;
  createdAt: number;
}

export interface DayLog {
  date: string;
  totalCount: number;
  entries: MomentumEntry[];
}

export interface AppSettings {
  valuePerMomentum: number; // Default ₹50
  dailyGoal: number; // Default 50
  lifetimeGoal: number; // Default 251
  dueDate?: string; // Target due date YYYY-MM-DD
  reminderTime: string; // "20:00"
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  userName: string;
}

export type TabType = 'dashboard' | 'analytics' | 'history' | 'settings';

export interface HourlyStat {
  hour: number; // 0..23
  timeLabel: string; // e.g. "9 AM", "4 PM"
  totalCount: number;
  avgCount: number;
  entryCount: number;
}

export interface WeekdayStat {
  dayName: string; // "Sun", "Mon", ...
  totalCount: number;
  avgCount: number;
  daysCount: number;
}

export interface AnalyticsSummary {
  bestDay: { date: string; count: number };
  worstDay: { date: string; count: number };
  dailyAverage: number;
  consistencyScore: number;
  trendPercentage: number;
  projected10DayTotal: number;
  projectedMonthlyTotal: number;

  totalDaysLogged: number;
  daysGoalAchieved: number;
  peakHour: { hour: number; timeLabel: string; avgCount: number; totalCount: number };
  lowestHour: { hour: number; timeLabel: string; avgCount: number; totalCount: number };
  bestWeekday: { dayName: string; avgCount: number };
  weekdayStats: WeekdayStat[];
  allTimeHourlyStats: HourlyStat[];
  positiveEntriesCount: number;
  negativeEntriesCount: number;
  positivePercentage: number;
  totalEntriesCount: number;
  weekdayAvg: number;
  weekendAvg: number;
}
