import { FoodEntryPayload } from './schemas/food';

export interface DailySummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function calculateMacros(grams: number, per100g: number): number {
  return Math.round((grams / 100) * per100g);
}

export function calculateDailySummary(entries: any[]): DailySummary {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + calculateMacros(entry.grams, entry.caloriesPer100g),
      protein: acc.protein + calculateMacros(entry.grams, entry.proteinPer100g),
      carbs: acc.carbs + calculateMacros(entry.grams, entry.carbsPer100g),
      fat: acc.fat + calculateMacros(entry.grams, entry.fatPer100g),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

// Fixed percentages for a balanced diet
export const MACRO_GOALS = {
  PROTEIN_PCT: 0.25, // 25%
  CARBS_PCT: 0.50,   // 50%
  FAT_PCT: 0.25,     // 25%
};

export function getMacroGoals(dailyCalorieGoal: number) {
  return {
    protein: Math.round((dailyCalorieGoal * MACRO_GOALS.PROTEIN_PCT) / 4), // 4 kcal per gram
    carbs: Math.round((dailyCalorieGoal * MACRO_GOALS.CARBS_PCT) / 4),
    fat: Math.round((dailyCalorieGoal * MACRO_GOALS.FAT_PCT) / 9), // 9 kcal per gram
  };
}
