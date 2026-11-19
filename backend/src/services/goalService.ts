import { prisma } from '../config/prisma.js';
import { getTodayDateString, isValidDateString } from '../utils/dateUtils.js';

export interface SetGoalDTO {
  date?: string; // Formato YYYY-MM-DD (padrão: hoje)
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  waterMl?: number;
}

export class GoalService {
  async getGoalByDate(userId: string, dateStr?: string) {
    const targetDate = dateStr && isValidDateString(dateStr)
      ? dateStr
      : getTodayDateString();

    // 1. Tenta buscar a meta exata cadastrada para o dia solicitado
    const exactGoal = await prisma.dailyGoal.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate
        }
      }
    });

    if (exactGoal) {
      return exactGoal;
    }

    // 2. Se o dia não possui meta cadastrada diretamente, busca a meta vigente mais recente anterior a esta data
    const previousGoal = await prisma.dailyGoal.findFirst({
      where: {
        userId,
        date: { lte: targetDate }
      },
      orderBy: { date: 'desc' }
    });

    if (previousGoal) {
      return {
        ...previousGoal,
        id: `virtual-${targetDate}`,
        date: targetDate
      };
    }

    // 3. Fallback para padrão
    return {
      id: `default-${targetDate}`,
      userId,
      date: targetDate,
      calories: 2000,
      proteins: 150,
      carbs: 200,
      fats: 65,
      waterMl: 2000
    };
  }

  /**
   * Salva ou atualiza a meta de um dia específico.
   * Regra de Ouro: alterar hoje NUNCA altera os dias anteriores.
   */
  async setGoal(userId: string, data: SetGoalDTO) {
    const targetDate = data.date && isValidDateString(data.date)
      ? data.date
      : getTodayDateString();

    if (data.calories <= 0 || data.proteins < 0 || data.carbs < 0 || data.fats < 0) {
      throw new Error('Calorias e macronutrientes devem ser valores positivos.');
    }

    const updatedGoal = await prisma.dailyGoal.upsert({
      where: {
        userId_date: {
          userId,
          date: targetDate
        }
      },
      update: {
        calories: Number(data.calories),
        proteins: Number(data.proteins),
        carbs: Number(data.carbs),
        fats: Number(data.fats),
        waterMl: data.waterMl !== undefined ? Number(data.waterMl) : 2000
      },
      create: {
        userId,
        date: targetDate,
        calories: Number(data.calories),
        proteins: Number(data.proteins),
        carbs: Number(data.carbs),
        fats: Number(data.fats),
        waterMl: data.waterMl !== undefined ? Number(data.waterMl) : 2000
      }
    });

    return updatedGoal;
  }
}

export const goalService = new GoalService();
