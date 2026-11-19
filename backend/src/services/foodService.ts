import { prisma } from '../config/prisma.js';
import { calculateNutritionalValues } from '../utils/nutritionCalculator.js';

export interface CreateCustomFoodDTO {
  name: string;
  category?: string;
  baseUnit?: 'g' | 'ml';
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fibers?: number;
  servingSize?: number;
  servingUnit?: string;
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export class FoodService {
  async searchFoods(query: string = '', category?: string, userId?: string, limit: number = 30) {
    const cleanQuery = query.trim();
    const normalizedQuery = removeAccents(cleanQuery);

    // Busca alimentos da base TACO/TBCA (userId: null) ou cadastrados pelo próprio usuário
    const foods = await prisma.food.findMany({
      where: {
        AND: [
          userId
            ? {
                OR: [{ userId: null }, { userId }]
              }
            : { userId: null },
          category ? { category } : {}
        ]
      },
      orderBy: { name: 'asc' }
    });

    // Filtra e pontua por relevância com normalização de acentos
    let filtered = cleanQuery
      ? foods.filter((f: any) => {
          const normName = removeAccents(f.name);
          const normCat = removeAccents(f.category);
          return normName.includes(normalizedQuery) || normCat.includes(normalizedQuery);
        })
      : foods;

    // Se temos query, ordenar por relevância (começa com > contém)
    if (cleanQuery) {
      filtered.sort((a: any, b: any) => {
        const aNorm = removeAccents(a.name);
        const bNorm = removeAccents(b.name);
        const aStarts = aNorm.startsWith(normalizedQuery);
        const bStarts = bNorm.startsWith(normalizedQuery);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aNorm.localeCompare(bNorm);
      });
    }

    const sliced = filtered.slice(0, limit);

    // Se userId fornecido, busca os IDs favoritos do usuário
    let favoriteIds = new Set<string>();
    if (userId) {
      const favorites = await prisma.favoriteFood.findMany({
        where: { userId },
        select: { foodId: true }
      });
      favoriteIds = new Set(favorites.map((f: any) => f.foodId));
    }

    return sliced.map((f: any) => ({
      ...f,
      isFavorite: favoriteIds.has(f.id)
    }));
  }

  async getFoodById(foodId: string, userId?: string) {
    const food = await prisma.food.findUnique({
      where: { id: foodId }
    });

    if (!food) {
      throw new Error('Alimento não encontrado.');
    }

    let isFavorite = false;
    if (userId) {
      const fav = await prisma.favoriteFood.findUnique({
        where: {
          userId_foodId: {
            userId,
            foodId
          }
        }
      });
      isFavorite = !!fav;
    }

    return {
      ...food,
      isFavorite
    };
  }

  async getCategories() {
    const foods = await prisma.food.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });
    return foods.map((f: any) => f.category);
  }

  async getFavorites(userId: string) {
    const favorites = await prisma.favoriteFood.findMany({
      where: { userId },
      include: {
        food: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return favorites.map((fav: any) => ({
      ...fav.food,
      isFavorite: true
    }));
  }

  async toggleFavorite(userId: string, foodId: string) {
    const existing = await prisma.favoriteFood.findUnique({
      where: {
        userId_foodId: {
          userId,
          foodId
        }
      }
    });

    if (existing) {
      await prisma.favoriteFood.delete({
        where: { id: existing.id }
      });
      return { isFavorite: false, message: 'Removido dos favoritos.' };
    } else {
      await prisma.favoriteFood.create({
        data: {
          userId,
          foodId
        }
      });
      return { isFavorite: true, message: 'Adicionado aos favoritos.' };
    }
  }

  async getRecentFoods(userId: string, limit: number = 10) {
    // Busca os últimos MealItems do usuário agrupando por alimento
    const recentItems = await prisma.mealItem.findMany({
      where: {
        meal: { userId },
        foodId: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        food: true
      }
    });

    const seenFoodIds = new Set<string>();
    const recentFoods = [];

    for (const item of recentItems) {
      if (item.food && !seenFoodIds.has(item.food.id)) {
        seenFoodIds.add(item.food.id);
        recentFoods.push(item.food);
        if (recentFoods.length >= limit) break;
      }
    }

    // Marca favoritos
    const favorites = await prisma.favoriteFood.findMany({
      where: { userId },
      select: { foodId: true }
    });
    const favoriteIds = new Set(favorites.map((f: any) => f.foodId));

    return recentFoods.map((f: any) => ({
      ...f,
      isFavorite: favoriteIds.has(f.id)
    }));
  }

  async createCustomFood(userId: string, data: CreateCustomFoodDTO) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('O nome do alimento é obrigatório.');
    }

    if (data.calories < 0 || data.proteins < 0 || data.carbs < 0 || data.fats < 0) {
      throw new Error('Calorias e macronutrientes não podem ser negativos.');
    }

    const food = await prisma.food.create({
      data: {
        name: data.name.trim(),
        category: data.category?.trim() || 'Personalizados',
        source: 'CUSTOM',
        baseUnit: data.baseUnit || 'g',
        baseQuantity: 100,
        calories: Number(data.calories),
        proteins: Number(data.proteins),
        carbs: Number(data.carbs),
        fats: Number(data.fats),
        fibers: data.fibers ? Number(data.fibers) : 0,
        servingSize: data.servingSize ? Number(data.servingSize) : null,
        servingUnit: data.servingUnit?.trim() || 'porção',
        isCustom: true,
        userId
      }
    });

    return food;
  }

  async calculate(foodId: string, quantity: number, unit: string = 'g') {
    const food = await prisma.food.findUnique({
      where: { id: foodId }
    });

    if (!food) {
      throw new Error('Alimento não encontrado.');
    }

    const calculated = calculateNutritionalValues(food, quantity, unit);

    return {
      food: {
        id: food.id,
        name: food.name,
        category: food.category,
        baseUnit: food.baseUnit
      },
      input: {
        quantity,
        unit
      },
      calculated
    };
  }
}

export const foodService = new FoodService();
