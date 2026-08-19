import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppDataContext';
import {
  IndianRupee,
  Target,
  Bell,
  Sun,
  Volume2,
  Vibrate,
  Download,
  Upload,
  RotateCcw,
  User,
  ShieldAlert,
  Check,
  Calendar,
} from 'lucide-react';
import { getFutureDateStr } from '../utils/date';
import { motion, AnimatePresence } from 'framer-motion';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    resetData,
    seedSampleData,
  } = useApp();

  const [showResetModal, setShowResetModal] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content && importData(content)) {
          setImportSuccess(true);
          setTimeout(() => setImportSuccess(false), 3000);
        } else {
          alert('Failed to import data: Invalid JSON structure.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Customize target goals, unit values, themes, and backups
        </p>
      </div>

      {/* 1. Profile / User Name */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
          <User className="w-4 h-4 text-accent-500" /> Personal Details
        </h3>
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={settings.userName}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
      </div>

      {/* 2. Core Momentum Economics & Targets */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Target className="w-4 h-4 text-accent-500" /> Goals & Economics
        </h3>

        {/* Value per Momentum (₹) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Value per Momentum (₹)
            </label>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Default: ₹50
            </span>
          </div>
          <div className="relative">
            <IndianRupee className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min="1"
              max="10000"
              value={settings.valuePerMomentum}
              onChange={(e) => updateSettings({ valuePerMomentum: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Each momentum count earns ₹{settings.valuePerMomentum}.
          </span>
        </div>

        {/* Daily Goal */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Daily Target Goal
            </label>
            <span className="text-xs font-bold text-accent-600 dark:text-accent-400">
              {settings.dailyGoal} counts
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="1000"
            value={settings.dailyGoal}
            onChange={(e) => updateSettings({ dailyGoal: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        {/* Lifetime Goal */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Lifetime Target Goal
            </label>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              Default: 251 score
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="1000000"
            value={settings.lifetimeGoal ?? 251}
            onChange={(e) => updateSettings({ lifetimeGoal: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <span className="text-[11px] text-slate-400 block mt-1">
            Target total score fallback when no individual person targets are set.
          </span>
        </div>

        {/* Target Goal Due Date */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-accent-500" /> Target Goal Due Date
            </label>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {settings.dueDate || 'Not Set'}
            </span>
          </div>
          <input
            type="date"
            value={settings.dueDate || ''}
            onChange={(e) => updateSettings({ dueDate: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <div className="flex items-center space-x-1.5 pt-2">
            <span className="text-[10px] text-slate-400">Quick Presets:</span>
            {[
              { label: '+7 Days', days: 7 },
              { label: '+30 Days', days: 30 },
              { label: '+90 Days', days: 90 },
            ].map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => updateSettings({ dueDate: getFutureDateStr(preset.days) })}
                className="px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-500/20"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reminder Time */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
            Daily Goal Reminder Time
          </label>
          <div className="relative">
            <Bell className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => updateSettings({ reminderTime: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Appearance & Sensory Preferences */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-accent-500" /> Appearance & Feedback
        </h3>

        {/* Theme Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-2">
            Application Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['system', 'light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                className={`py-2 px-3 rounded-2xl text-xs font-semibold capitalize border transition-all ${
                  settings.theme === t
                    ? 'bg-accent-500 text-white border-accent-500 shadow-accent-glow'
                    : 'bg-slate-50 dark:bg-zinc-950 border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Sound & Haptics Toggles */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                Synthesized Click Audio
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-accent-500 focus:ring-accent-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Vibrate className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                Tactile Haptic Feedback
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.hapticsEnabled}
              onChange={(e) => updateSettings({ hapticsEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-accent-500 focus:ring-accent-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Data Management: Import, Export & Reset */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 p-5 border border-slate-200/80 dark:border-zinc-800/80 shadow-soft-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Download className="w-4 h-4 text-accent-500" /> Data Backup & Restore
        </h3>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={exportData}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON</span>
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {importSuccess && (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
            <Check className="w-4 h-4" />
            <span>Dataset imported successfully!</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2">
          <button
            onClick={seedSampleData}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-500/20 hover:bg-indigo-500/20 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Sample Data</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20 hover:bg-rose-500/20 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data (0)</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-zinc-800 space-y-4 shadow-floating"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Reset All Daily Data?
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  This action will permanently delete all momentum entries and reset your settings. This action cannot be undone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetData();
                    setShowResetModal(false);
                  }}
                  className="py-2.5 px-4 rounded-2xl bg-rose-500 text-white font-bold text-xs shadow-soft-sm hover:bg-rose-600 transition"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
