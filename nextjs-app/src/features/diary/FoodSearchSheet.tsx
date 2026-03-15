'use client';

import { useState } from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import { useFoodSearch } from '@/lib/hooks/useFoodSearch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus } from 'lucide-react';

interface FoodSearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
}

export default function FoodSearchSheet({ isOpen, onClose, date }: FoodSearchSheetProps) {
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);

  const { data: results, isLoading, error } = useFoodSearch(query);

  const handleClose = () => {
    setQuery('');
    setSelectedFood(null);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Add Food">
      {selectedFood ? (
        <FoodServingAdjuster
          food={selectedFood}
          date={date}
          onBack={() => setSelectedFood(null)}
          onClose={handleClose}
        />
      ) : (
        <div className="flex flex-col gap-4 h-full">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search OpenFoodFacts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-100/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all text-slate-800 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isLoading && query.length > 1 ? (
              <div className="py-12 text-center text-slate-400 animate-pulse">Searching global database...</div>
            ) : error ? (
              <div className="py-8 text-center text-amber-600 bg-amber-50 rounded-2xl border border-amber-100/50">
                <p className="font-semibold">Search unavailable.</p>
                <p className="text-sm mt-1">Please try again later or add custom food.</p>
              </div>
            ) : results?.length === 0 && query.length > 1 ? (
              <div className="py-12 text-center text-slate-500">
                No results found for "{query}".
              </div>
            ) : (
              <ul className="space-y-3">
                {results?.map((food: any) => (
                  <li key={food.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedFood(food)}
                      className="w-full text-left bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex gap-4 items-center active:scale-[0.98] transition-all hover:border-primary/30 group"
                    >
                      {food.image ? (
                        <img src={food.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400 font-medium">
                          {food.name.charAt(0)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate leading-tight group-hover:text-primary transition-colors">
                          {food.name}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 truncate mt-0.5">
                          {food.brand && `${food.brand} • `}{food.caloriesPer100g} kcal/100g
                        </p>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                        <Plus size={18} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function FoodServingAdjuster({ food, date, onBack, onClose }: any) {
  const [grams, setGrams] = useState<number>(100);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/food-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to log food');
      return res.json();
    },
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ['diary', date] });
      const previous = queryClient.getQueryData(['diary', date]);
      
      // Optimistic update
      queryClient.setQueryData(['diary', date], (old: any) => [...(old || []), newEntry]);
      
      return { previous };
    },
    onError: (err, newEntry, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['diary', date], context.previous);
      }
      alert('Failed to log food. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['diary', date] });
    }
  });

  const handleLog = () => {
    // Client-generated UUID for idempotency
    const payload = {
      id: crypto.randomUUID(),
      date,
      name: food.name,
      brand: food.brand,
      grams,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      carbsPer100g: food.carbsPer100g,
      fatPer100g: food.fatPer100g,
      isCustom: false,
    };

    mutation.mutate(payload);
    // Vibrate success
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]);
    onClose();
  };

  const calculatedCals = Math.round((grams / 100) * food.caloriesPer100g);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-8">
        {food.image ? (
          <img src={food.image} alt="" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-brand text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {food.name.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-bold text-xl text-slate-800 leading-tight">{food.name}</h3>
          <p className="text-slate-500 font-medium">{food.brand || 'Generic'}</p>
        </div>
      </div>

      <div className="glass rounded-[2rem] p-6 mb-8 border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <span className="text-slate-500 font-semibold tracking-wide uppercase text-sm">Serving Size</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value) || 0)}
              className="w-20 text-right text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-primary outline-none px-1"
              min="1"
              max="5000"
            />
            <span className="text-slate-500 font-medium text-lg">g</span>
          </div>
        </div>

        <div className="h-px bg-slate-100 w-full mb-6" />

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Calories</span>
            <span className="text-4xl font-black text-primary tracking-tight">{calculatedCals}</span>
          </div>
          <div className="flex gap-4 text-sm font-semibold text-slate-500">
            <span>P: {Math.round((grams / 100) * food.proteinPer100g)}g</span>
            <span>C: {Math.round((grams / 100) * food.carbsPer100g)}g</span>
            <span>F: {Math.round((grams / 100) * food.fatPer100g)}g</span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleLog}
          disabled={mutation.isPending || grams <= 0}
          className="flex-[2] py-4 font-bold text-white bg-gradient-brand rounded-2xl shadow-lg shadow-blue-500/30 hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
        >
          {mutation.isPending ? 'Logging...' : 'Log Food'}
        </button>
      </div>
    </div>
  );
}
