export type MealType = 'BREAKFAST' | 'LUNCH' | 'AFTERNOON_SNACK' | 'DINNER' | 'SUPPER';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface DailyGoal {
  id?: string;
  userId?: string;
  date: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  waterMl?: number;
}

export interface NutritionalValues {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fibers: number;
}

export interface MealItemSummary extends NutritionalValues {
  id: string;
  foodId: string | null;
  name: string;
  quantity: number;
  unit: string;
  gramsEquivalent: number;
}

export interface MealSummary extends NutritionalValues {
  id: string;
  date: string;
  mealType: MealType;
  name: string;
  notes: string | null;
  items: MealItemSummary[];
}

export interface DailySummary {
  date: string;
  goal: {
    id?: string;
    date: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    waterMl: number;
  };
  consumed: NutritionalValues;
  remaining: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
  percentages: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
  meals: MealSummary[];
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  source: string;
  baseUnit: string;
  baseQuantity: number;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fibers: number;
  servingSize?: number | null;
  servingUnit?: string | null;
  isCustom: boolean;
  isFavorite?: boolean;
}

export interface AiParsedItem {
  name: string;
  quantity: number;
  unit: string;
  matchedFoodId?: string;
  matchedFoodName?: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fibers: number;
  isEstimate: boolean;
  confidence?: 'high' | 'medium' | 'low';
}

export interface AiParseResponse {
  mealType: MealType;
  items: AiParsedItem[];
  totals: NutritionalValues;
  message?: string;
}

export interface CalendarDay {
  date: string;
  calories: number;
  itemsCount: number;
  goalCalories: number;
  hasLogs: boolean;
  completedRatio: number;
}

export interface CalorieTrendItem {
  date: string;
  dayOfWeek: string;
  consumedCalories: number;
  goalCalories: number;
  difference: number;
}

export interface MacroDistributionItem {
  date: string;
  dayOfWeek: string;
  proteins: number;
  carbs: number;
  fats: number;
}

export interface SummaryStats {
  weeklyAverageCalories: number;
  monthlyAverageCalories: number;
  totalTrackedDays7: number;
  totalTrackedDays30: number;
}
