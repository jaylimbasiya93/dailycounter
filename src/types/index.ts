export interface MomentumEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number; // Unix timestamp ms
  count: number; // Delta (e.g. +1, +5, -1)
  note?: string;
}

export interface DayLog {
  date: string;
  totalCount: number;
  entries: MomentumEntry[];
}

export interface AppSettings {
  valuePerMomentum: number; // Default ₹50
  dailyGoal: number; // Default 50
  reminderTime: string; // "20:00"
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  userName: string;
}

export type TabType = 'dashboard' | 'analytics' | 'history' | 'settings';

export interface AnalyticsSummary {
  bestDay: { date: string; count: number };
  worstDay: { date: string; count: number };
  dailyAverage: number;
  consistencyScore: number;
  trendPercentage: number;
  projected10DayTotal: number;
  projectedMonthlyTotal: number;
}
