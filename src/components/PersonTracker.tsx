import React, { useState } from 'react';
import { useApp } from '../context/AppDataContext';
import {
  UserPlus,
  RotateCcw,
  Trash2,
  Edit2,
  Users,
  Shuffle,
  CheckCircle2,
  Sparkles,
  X,
  Calendar,
  TrendingUp,
  Target,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFutureDateStr, getDaysDifference } from '../utils/date';

export const PersonTracker: React.FC = () => {
  const {
    persons,
    totalPersonTarget,
    totalPersonScore,
    daysRemainingToDueDate,
    requiredDailyPace,
    weeklyAverage,
    analytics,
    todayCount,
    todayDateStr,
    settings,
    addPerson,
    clearPerson,
    deletePerson,
    updatePerson,
  } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState<number | ''>(10);
  const [newDueDate, setNewDueDate] = useState<string>(getFutureDateStr(30));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTargetValue, setEditTargetValue] = useState<number>(10);
  const [editDueDateValue, setEditDueDateValue] = useState<string>(getFutureDateStr(30));

  // Status state for showing animated toast message when credits are redistributed
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const targetVal = typeof newTarget === 'number' && newTarget > 0 ? newTarget : 10;
    const dueVal = newDueDate || getFutureDateStr(30);
    addPerson(newName.trim(), targetVal, dueVal);
    setNewName('');
    setNewTarget(10);
    setNewDueDate(getFutureDateStr(30));
    setIsAdding(false);
  };

  const handleClearPerson = (id: string, name: string, score: number) => {
    if (score > 0 && persons.length > 1) {
      showNotification(`Cleared ${name}'s ${score} credits and redistributed randomly to remaining team!`);
    } else if (score > 0) {
      showNotification(`Cleared ${name}'s ${score} credits!`);
    }
    clearPerson(id);
  };

  const handleDeletePerson = (id: string, name: string, score: number) => {
    if (confirm(`Remove ${name}? ${score > 0 ? `Their ${score} credits will be redistributed randomly.` : ''}`)) {
      deletePerson(id, true);
    }
  };

  const handleSavePersonEdits = (id: string) => {
    if (editTargetValue > 0) {
      updatePerson(id, {
        target: editTargetValue,
        dueDate: editDueDateValue || getFutureDateStr(30),
      });
    }
    setEditingId(null);
  };

  // Determine active overall daily pace
  const activePace = Math.max(1, todayCount, weeklyAverage, analytics.dailyAverage);

  return (
    <div className="space-y-3">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-3 rounded-2xl bg-indigo-600 text-white text-xs font-semibold flex items-center justify-between shadow-soft-lg"
          >
            <div className="flex items-center space-x-2">
              <Shuffle className="w-4 h-4 shrink-0 animate-spin" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-indigo-700 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              Person Score Allocation
              {persons.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                  {persons.length} Active
                </span>
              )}
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-soft-sm transition active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isAdding ? 'Close' : '+ Add Person'}</span>
        </button>
      </div>

      {/* Combined Persons Total Goal Banner */}
      {persons.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-4 shadow-soft-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-indigo-300" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200 block leading-tight">
                  Combined Persons Total Score & Goal
                </span>
                <span className="text-sm font-extrabold text-white">
                  Score: {totalPersonScore} / {totalPersonTarget}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-white/10 text-indigo-200 text-xs font-bold border border-white/20">
              {persons.length} Person Goals
            </span>
          </div>

          {/* Combined Progress & Pace Stats */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-indigo-700/40 text-center">
            <div className="p-2 rounded-2xl bg-white/10">
              <span className="text-[10px] font-medium text-indigo-200 block mb-0.5">Earliest Deadline</span>
              <span className="text-xs font-black text-white block">{daysRemainingToDueDate} days</span>
            </div>

            <div className="p-2 rounded-2xl bg-white/10">
              <span className="text-[10px] font-medium text-indigo-200 block mb-0.5">Current Daily Pace</span>
              <span className="text-xs font-black text-white block">{activePace} / day</span>
            </div>

            <div className="p-2 rounded-2xl bg-white/10">
              <span className="text-[10px] font-medium text-indigo-200 block mb-0.5">Total Req. Pace</span>
              <span className="text-xs font-black text-amber-300 block">{requiredDailyPace} / day</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Person Form Drawer with Person-Wise Due Date */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddPerson}
            className="overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 p-4 border border-indigo-200 dark:border-indigo-900/50 shadow-soft-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> New Person Goal
              </span>
              <span className="text-[10px] text-slate-400">Set individual target & due date</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
                  Person Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul, Priya, Alex"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1">
                  Target Score
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="10"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500" /> Person Due Date
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Save Person
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {persons.length === 0 && !isAdding && (
        <div className="rounded-3xl bg-white/60 dark:bg-zinc-900/60 p-5 border border-dashed border-slate-300 dark:border-zinc-800 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mx-auto">
            <Shuffle className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">No Person Goals Set Yet</h4>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Add team members or family members with custom targets & due dates. When you tap <span className="font-bold text-indigo-600 dark:text-indigo-400">+</span> or <span className="font-bold text-indigo-600 dark:text-indigo-400">-</span>, counts will be automatically allocated to them!
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-1 px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-soft-sm hover:bg-indigo-700 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add First Person</span>
          </button>
        </div>
      )}

      {/* Person List Cards with Person-Wise Due Date & Live Expected Analytics */}
      {persons.length > 0 && (
        <div className="space-y-2.5">
          {persons.map((person) => {
            const completionPercentage = Math.min(
              100,
              Math.round((person.score / Math.max(1, person.target)) * 100)
            );
            const isCompleted = person.score >= person.target;

            // Person-Specific Due Date calculations
            const personDueDate = person.dueDate || settings.dueDate || getFutureDateStr(30);
            const personDaysRemaining = getDaysDifference(personDueDate, todayDateStr);

            // Live Expected Individual Daily Analytics
            const personShare =
              totalPersonTarget > 0 ? person.target / totalPersonTarget : 1 / persons.length;
            const expectedIndividualDailyAvg = Math.round(activePace * personShare * 10) / 10;
            const expectedIndividualScoreByDueDate =
              person.score + Math.round(expectedIndividualDailyAvg * personDaysRemaining);
            const requiredIndividualDailyPace = Math.max(
              0,
              Math.round(
                ((person.target - person.score) / Math.max(1, personDaysRemaining)) * 10
              ) / 10
            );
            const isOnTrack =
              isCompleted || expectedIndividualScoreByDueDate >= person.target;

            const isEditingThis = editingId === person.id;

            return (
              <motion.div
                key={person.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white dark:bg-zinc-900 p-4 border border-slate-200/80 dark:border-zinc-800 shadow-soft-sm space-y-3"
              >
                {/* Person Header (Left: Name & Target/Due, Right: Actions) */}
                <div className="flex items-center justify-between">
                  {/* Left Side: Person Name & Score Badge */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-2xl flex items-center justify-center font-black text-xs ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {person.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {person.name}
                        </span>
                        {isCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                        <span>
                          Score:{' '}
                          <strong className="text-slate-900 dark:text-white font-extrabold">
                            {person.score}
                          </strong>{' '}
                          / {person.target}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                          <Calendar className="w-3 h-3 inline" /> Due: {personDueDate} ({personDaysRemaining}d left)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Clear Icon & Target Edit */}
                  <div className="flex items-center space-x-1">
                    {/* Edit Target button / inline */}
                    {isEditingThis ? (
                      <button
                        onClick={() => handleSavePersonEdits(person.id)}
                        className="px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-[11px] font-bold"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(person.id);
                          setEditTargetValue(person.target);
                          setEditDueDateValue(personDueDate);
                        }}
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition"
                        title="Edit Target Goal & Due Date"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Clear Button (Right Corner Clear Icon) */}
                    <button
                      onClick={() => handleClearPerson(person.id, person.name, person.score)}
                      className="p-1.5 rounded-xl hover:bg-amber-500/10 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition flex items-center gap-1"
                      title={`Clear score (${person.score} credits will be redistributed randomly)`}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Delete Option */}
                    <button
                      onClick={() => handleDeletePerson(person.id, person.name, person.score)}
                      className="p-1.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                      title="Delete person"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Editing Controls for Person Target & Due Date */}
                <AnimatePresence>
                  {isEditingThis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-2xl bg-indigo-50 dark:bg-zinc-950 border border-indigo-200 dark:border-indigo-900/50 space-y-2 text-xs"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                            Target Score
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editTargetValue}
                            onChange={(e) => setEditTargetValue(parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 rounded-xl border border-indigo-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                            Person Due Date
                          </label>
                          <input
                            type="date"
                            value={editDueDateValue}
                            onChange={(e) => setEditDueDateValue(e.target.value)}
                            className="w-full px-2 py-1 rounded-xl border border-indigo-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Bar Below Name */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-zinc-500 px-0.5">
                    <span>Progress: {completionPercentage}%</span>
                    <span>
                      {isCompleted ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Goal Achieved! 🎉</span>
                      ) : (
                        <span>{Math.max(0, person.target - person.score)} points needed</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Live Expected Individual Analytics Breakdown Card */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-zinc-800/80 pb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-indigo-500" /> Expected Individual Analytics
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        isOnTrack
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isOnTrack ? 'On Track 🎉' : `Needs +${requiredIndividualDailyPace}/day`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                    {/* Expected Daily Pace */}
                    <div className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800">
                      <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 block mb-0.5">
                        Exp. Daily Pace
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                        {expectedIndividualDailyAvg}
                      </span>
                      <span className="text-[9px] text-slate-400 block">counts/day</span>
                    </div>

                    {/* Expected Score by Person Due Date */}
                    <div className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800">
                      <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 block mb-0.5">
                        Exp. Score on Due
                      </span>
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 block">
                        {expectedIndividualScoreByDueDate}
                      </span>
                      <span className="text-[9px] text-slate-400 block">/ {person.target} target</span>
                    </div>

                    {/* Required Daily Pace for Person Due Date */}
                    <div className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800">
                      <span className="text-[9px] font-medium text-slate-400 dark:text-zinc-500 block mb-0.5">
                        Req. Daily Pace
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                        {requiredIndividualDailyPace}
                      </span>
                      <span className="text-[9px] text-slate-400 block">counts/day</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Random Allocation & Persistent Totals Helper Note */}
          <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 text-[11px] text-slate-600 dark:text-zinc-400 flex items-start space-x-2">
            <Shuffle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Each person has their own target goal & due date! Counts from <span className="font-bold text-slate-900 dark:text-white">+</span> and <span className="font-bold text-slate-900 dark:text-white">-</span> automatically recalculate live expected scores for each person!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
