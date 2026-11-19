export type MealType = 'BREAKFAST' | 'LUNCH' | 'AFTERNOON_SNACK' | 'DINNER' | 'SUPPER';

export interface JwtUserPayload {
  userId: string;
  email: string;
  name: string;
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
  mealType: string;
  name: string;
  notes: string | null;
  items: MealItemSummary[];
}

export interface DailySummary {
  date: string;
  goal: {
    id?: string;
    date?: string;
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
