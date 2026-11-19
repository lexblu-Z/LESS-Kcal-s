import { prisma } from '../config/prisma.js';
import { calculateNutritionalValues } from '../utils/nutritionCalculator.js';
import { goalService } from './goalService.js';
import { getTodayDateString, isValidDateString } from '../utils/dateUtils.js';
import { MealType, DailySummary, MealSummary, MealItemSummary } from '../types/index.js';

export const STANDARD_MEALS: { type: MealType; name: string }[] = [
  { type: 'BREAKFAST', name: 'Café da manhã' },
  { type: 'LUNCH', name: 'Almoço' },
  { type: 'AFTERNOON_SNACK', name: 'Lanche da tarde' },
  { type: 'DINNER', name: 'Jantar' },
  { type: 'SUPPER', name: 'Ceia' }
];

export interface AddItemDTO {
  date?: string;
  mealType: MealType;
  foodId?: string;
  name?: string;
  quantity: number;
  unit: string;
}

export interface UpdateItemDTO {
  quantity: number;
  unit?: string;
}

export class MealService {
  async getDailyOverview(userId: string, dateStr?: string): Promise<DailySummary> {
    const targetDate = dateStr && isValidDateString(dateStr)
      ? dateStr
      : getTodayDateString();

    // 1. Meta do dia solicitado (isolada por data)
    const goal = await goalService.getGoalByDate(userId, targetDate);

    // 2. Busca todas as refeições do usuário para esta data com seus itens
    const mealsFromDb = await prisma.meal.findMany({
      where: {
        userId,
        date: targetDate
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    const mealMap = new Map<string, any>();
    for (const m of mealsFromDb) {
      mealMap.set(m.mealType, m);
    }

    // 3. Monta a estrutura garantindo a presença das 5 refeições padrão
    const mealsSummary: MealSummary[] = STANDARD_MEALS.map(({ type, name }) => {
      const existing = mealMap.get(type);
      const items: MealItemSummary[] = existing
        ? existing.items.map((item: any) => ({
            id: item.id,
            foodId: item.foodId,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            gramsEquivalent: item.gramsEquivalent,
            calories: item.calories,
            proteins: item.proteins,
            carbs: item.carbs,
            fats: item.fats,
            fibers: item.fibers
          }))
        : [];

      // Subtotais da refeição
      const subtotals = items.reduce(
        (acc, it) => ({
          calories: Math.round((acc.calories + it.calories) * 10) / 10,
          proteins: Math.round((acc.proteins + it.proteins) * 10) / 10,
          carbs: Math.round((acc.carbs + it.carbs) * 10) / 10,
          fats: Math.round((acc.fats + it.fats) * 10) / 10,
          fibers: Math.round((acc.fibers + it.fibers) * 10) / 10
        }),
        { calories: 0, proteins: 0, carbs: 0, fats: 0, fibers: 0 }
      );

      return {
        id: existing ? existing.id : `virtual-${type}`,
        date: targetDate,
        mealType: type,
        name: existing ? existing.name : name,
        notes: existing ? existing.notes : null,
        items,
        ...subtotals
      };
    });

    // 4. Totais consumidos no dia
    const consumed = mealsSummary.reduce(
      (acc, meal) => ({
        calories: Math.round((acc.calories + meal.calories) * 10) / 10,
        proteins: Math.round((acc.proteins + meal.proteins) * 10) / 10,
        carbs: Math.round((acc.carbs + meal.carbs) * 10) / 10,
        fats: Math.round((acc.fats + meal.fats) * 10) / 10,
        fibers: Math.round((acc.fibers + meal.fibers) * 10) / 10
      }),
      { calories: 0, proteins: 0, carbs: 0, fats: 0, fibers: 0 }
    );

    // 5. Restante no dia
    const remaining = {
      calories: Math.round((goal.calories - consumed.calories) * 10) / 10,
      proteins: Math.round((goal.proteins - consumed.proteins) * 10) / 10,
      carbs: Math.round((goal.carbs - consumed.carbs) * 10) / 10,
      fats: Math.round((goal.fats - consumed.fats) * 10) / 10
    };

    // 6. Porcentagens concluídas
    const percentages = {
      calories: goal.calories > 0 ? Math.round((consumed.calories / goal.calories) * 1000) / 10 : 0,
      proteins: goal.proteins > 0 ? Math.round((consumed.proteins / goal.proteins) * 1000) / 10 : 0,
      carbs: goal.carbs > 0 ? Math.round((consumed.carbs / goal.carbs) * 1000) / 10 : 0,
      fats: goal.fats > 0 ? Math.round((consumed.fats / goal.fats) * 1000) / 10 : 0
    };

    return {
      date: targetDate,
      goal: {
        id: goal.id,
        date: targetDate,
        calories: goal.calories,
        proteins: goal.proteins,
        carbs: goal.carbs,
        fats: goal.fats,
        waterMl: goal.waterMl || 2000
      },
      consumed,
      remaining,
      percentages,
      meals: mealsSummary
    };
  }

  async addItem(userId: string, data: AddItemDTO) {
    const targetDate = data.date && isValidDateString(data.date)
      ? data.date
      : getTodayDateString();

    if (!data.quantity || data.quantity <= 0) {
      throw new Error('A quantidade deve ser um número maior que zero.');
    }

    // 1. Localiza o alimento
    let foodName = data.name || 'Alimento';
    let foodRef = null;

    if (data.foodId) {
      foodRef = await prisma.food.findUnique({
        where: { id: data.foodId }
      });
      if (foodRef) {
        foodName = foodRef.name;
      }
    }

    if (!foodRef) {
      // Se não encontrou pelo ID, tenta pelo nome
      if (data.name) {
        foodRef = await prisma.food.findFirst({
          where: { name: { equals: data.name } }
        });
      }
    }

    if (!foodRef) {
      throw new Error('Alimento não encontrado na base nutricional.');
    }

    // 2. Calcula os valores proporcionais exatos
    const calc = calculateNutritionalValues(foodRef, data.quantity, data.unit || 'g');

    // 3. Obtém ou cria a Meal para esta data e tipo
    let meal = await prisma.meal.findFirst({
      where: {
        userId,
        date: targetDate,
        mealType: data.mealType
      }
    });

    if (!meal) {
      const standardMeal = STANDARD_MEALS.find((m) => m.type === data.mealType);
      meal = await prisma.meal.create({
        data: {
          userId,
          date: targetDate,
          mealType: data.mealType,
          name: standardMeal ? standardMeal.name : data.mealType
        }
      });
    }

    // 4. Cria o MealItem com snapshot dos cálculos
    const item = await prisma.mealItem.create({
      data: {
        mealId: meal.id,
        foodId: foodRef.id,
        name: foodName,
        quantity: data.quantity,
        unit: data.unit || 'g',
        gramsEquivalent: calc.gramsEquivalent,
        calories: calc.calories,
        proteins: calc.proteins,
        carbs: calc.carbs,
        fats: calc.fats,
        fibers: calc.fibers
      }
    });

    return item;
  }

  async updateItem(userId: string, itemId: string, data: UpdateItemDTO) {
    if (!data.quantity || data.quantity <= 0) {
      throw new Error('A quantidade deve ser maior que zero.');
    }

    const item = await prisma.mealItem.findUnique({
      where: { id: itemId },
      include: {
        meal: true,
        food: true
      }
    });

    if (!item || item.meal.userId !== userId) {
      throw new Error('Item de refeição não encontrado.');
    }

    const unit = data.unit || item.unit;
    let calc;

    if (item.food) {
      calc = calculateNutritionalValues(item.food, data.quantity, unit);
    } else {
      // Proporcional baseado no snapshot existente
      const ratio = item.gramsEquivalent > 0 ? (data.quantity / item.quantity) : 1;
      calc = {
        gramsEquivalent: data.quantity,
        calories: Math.round(item.calories * ratio * 100) / 100,
        proteins: Math.round(item.proteins * ratio * 100) / 100,
        carbs: Math.round(item.carbs * ratio * 100) / 100,
        fats: Math.round(item.fats * ratio * 100) / 100,
        fibers: Math.round(item.fibers * ratio * 100) / 100
      };
    }

    const updated = await prisma.mealItem.update({
      where: { id: itemId },
      data: {
        quantity: data.quantity,
        unit,
        gramsEquivalent: calc.gramsEquivalent,
        calories: calc.calories,
        proteins: calc.proteins,
        carbs: calc.carbs,
        fats: calc.fats,
        fibers: calc.fibers
      }
    });

    return updated;
  }

  async deleteItem(userId: string, itemId: string) {
    const item = await prisma.mealItem.findUnique({
      where: { id: itemId },
      include: { meal: true }
    });

    if (!item || item.meal.userId !== userId) {
      throw new Error('Item não encontrado ou você não tem permissão para excluí-lo.');
    }

    await prisma.mealItem.delete({
      where: { id: itemId }
    });

    return { success: true, message: 'Item removido da refeição.' };
  }
}

export const mealService = new MealService();
