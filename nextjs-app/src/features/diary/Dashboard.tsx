'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayStr } from '@/lib/date';
import { useState } from 'react';
import CalorieRing from '@/components/ui/CalorieRing';
import MacroBar from '@/components/ui/MacroBar';
import { calculateDailySummary, getMacroGoals } from '@/lib/nutrition-math';
import { Trash2, Plus } from 'lucide-react';
import { motion, PanInfo } from 'framer-motion';
import FoodSearchSheet from './FoodSearchSheet';

export default function Dashboard({ initialDate }: { initialDate: string }) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(initialDate);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // In a real app we'd fetch settings. We'll assume a 2000 goal for now, or fetch it.
  const { data: settings } = useQuery({
    queryKey: ['settings', 'current'], // Session ID is handled on backend, we just want the response
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) return { dailyCalorieGoal: 2000 };
      return res.json();
    },
    initialData: { dailyCalorieGoal: 2000 }
  });

  const dailyCalorieGoal = settings.dailyCalorieGoal || 2000;
  const macroGoals = getMacroGoals(dailyCalorieGoal);

  const { data: entries, isLoading } = useQuery({
    queryKey: ['diary', date],
    queryFn: async () => {
      const res = await fetch(`/api/food-entries?date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    initialData: [], // Assume SSR hydrated it
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/food-entries?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['diary', date] });
      const previousEntries = queryClient.getQueryData(['diary', date]);
      queryClient.setQueryData(['diary', date], (old: any) => 
        old?.filter((entry: any) => entry.id !== deletedId)
      );
      return { previousEntries };
    },
    onError: (err, deletedId, context) => {
      // Revert if API fails
      if (context?.previousEntries) {
        queryClient.setQueryData(['diary', date], context.previousEntries);
      }
      // Trigger Haptic Error here in the future
      alert("Network error: Failed to delete.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['diary', date] });
    }
  });

  const summary = calculateDailySummary(entries || []);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading && !entries?.length) {
    return <div className="p-4 text-center text-slate-500 animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-6 pb-24 max-w-lg mx-auto">
      
      {/* Date Navigator Placeholder */}
      <div className="flex justify-between items-center px-2">
        <h1 className="text-xl font-bold text-slate-800">Today</h1>
        <span className="text-sm font-medium text-slate-500">{date}</span>
      </div>

      {/* Hero Bento: Calorie Ring & Macros */}
      <div className="glass rounded-[2rem] p-6 flex flex-col sm:flex-row items-center gap-8">
        <CalorieRing consumed={summary.calories} goal={dailyCalorieGoal} />
        
        <div className="flex flex-col gap-4 w-full">
          <MacroBar label="Protein" consumed={summary.protein} goal={macroGoals.protein} colorVar="--color-protein" />
          <MacroBar label="Carbs" consumed={summary.carbs} goal={macroGoals.carbs} colorVar="--color-carbs" />
          <MacroBar label="Fat" consumed={summary.fat} goal={macroGoals.fat} colorVar="--color-fat" />
        </div>
      </div>

      {/* Meals Bento */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Diary</h2>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 text-primary font-bold text-sm bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
          >
            <Plus size={16} strokeWidth={3} /> Add Food
          </button>
        </div>
        
        <div className="glass rounded-[2rem] p-4 flex flex-col gap-2">
          {entries?.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <p className="font-medium">No food logged yet.</p>
              <p className="text-sm">Tap the + button to search.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {entries?.map((entry: any) => (
                <FoodRow key={entry.id} entry={entry} onDelete={() => handleDelete(entry.id)} />
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <FoodSearchSheet isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} date={date} />
    </div>
  );
}

// Subcomponent for Swipe-to-delete
function FoodRow({ entry, onDelete }: { entry: any; onDelete: () => void }) {
  const handleDragEnd = (event: any, info: PanInfo) => {
    // If swiped far enough left, delete
    if (info.offset.x < -80) {
      onDelete();
      // Optional: trigger haptics
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50]);
    }
  };

  const macros = calculateDailySummary([entry]); // Reusing math lib

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-100/50">
      {/* Background Delete Action */}
      <div className="absolute inset-y-0 right-0 w-full flex items-center justify-end px-6 bg-red-500 text-white rounded-2xl">
        <Trash2 size={20} className="mr-2" />
        <span className="font-semibold text-sm tracking-wide">Delete</span>
      </div>

      {/* Draggable Surface */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.1 }}
        onDragEnd={handleDragEnd}
        className="relative bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center active:bg-slate-50 transition-colors"
      >
        <div className="flex flex-col pr-4">
          <span className="font-bold text-slate-800 text-sm leading-tight truncate">{entry.name}</span>
          <span className="text-xs font-medium text-slate-500 mt-0.5">
            {entry.brand && `${entry.brand} • `}{entry.grams}g
          </span>
        </div>
        
        <div className="flex flex-col items-end shrink-0">
          <span className="font-bold text-primary text-base">{macros.calories}</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">kcal</span>
        </div>
      </motion.div>
    </div>
  );
}
