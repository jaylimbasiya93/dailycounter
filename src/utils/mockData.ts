import type { MomentumEntry, AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  valuePerMomentum: 50,
  dailyGoal: 50,
  lifetimeGoal: 251,
  reminderTime: '20:00',
  theme: 'system',
  soundEnabled: true,
  hapticsEnabled: true,
  userName: 'Jay',
};

// Generate 60 days of realistic historical seed data
export function generateSeedEntries(): MomentumEntry[] {
  const entries: MomentumEntry[] = [];
  const today = new Date();
  
  // Base daily pattern for the past 60 days
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Vary daily count around 35 - 65, with weekend boost
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCount = isWeekend ? 58 : 42;
    const noise = Math.floor(Math.sin(i * 0.7) * 15) + (i % 5 === 0 ? -12 : 8);
    const dailyTotal = Math.max(12, baseCount + noise);

    // Split daily total into 3-5 entries throughout the day
    const entriesCount = 3 + (i % 3);
    let remaining = dailyTotal;
    
    const times = [9, 13, 16, 19, 21];
    for (let k = 0; k < entriesCount; k++) {
      const isLast = k === entriesCount - 1;
      const count = isLast ? remaining : Math.max(1, Math.floor(remaining / (entriesCount - k)));
      remaining -= count;
      
      const entryDate = new Date(d);
      entryDate.setHours(times[k % times.length], Math.floor(Math.random() * 59));
      
      entries.push({
        id: `seed-${dateStr}-${k}`,
        date: dateStr,
        timestamp: entryDate.getTime(),
        count: count,
        note: k % 2 === 0 ? 'Daily momentum focus' : undefined,
      });
    }
  }

  return entries;
}
