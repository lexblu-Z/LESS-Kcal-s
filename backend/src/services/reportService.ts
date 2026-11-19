import { prisma } from '../config/prisma.js';
import { goalService } from './goalService.js';
import { getTodayDateString, getLastNDays, getMonthDateRange } from '../utils/dateUtils.js';

export class ReportService {
  /**
   * Retorna os dias do mês com resumo calórico e status para o calendário
   */
  async getMonthlyCalendar(userId: string, yearMonth?: string) {
    const ym = yearMonth || getTodayDateString().substring(0, 7);
    const { startDate, endDate } = getMonthDateRange(ym);

    // Busca todas as refeições do mês
    const meals = await prisma.meal.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: true
      }
    });

    // Agrupa totais por data
    const dailyTotals = new Map<string, { calories: number; itemsCount: number }>();

    for (const meal of meals) {
      const current = dailyTotals.get(meal.date) || { calories: 0, itemsCount: 0 };
      for (const item of meal.items) {
        current.calories += item.calories;
        current.itemsCount += 1;
      }
      dailyTotals.set(meal.date, current);
    }

    // Busca metas cadastradas para o mês
    const goals = await prisma.dailyGoal.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    const goalMap = new Map<string, number>();
    for (const g of goals) {
      goalMap.set(g.date, g.calories);
    }

    const result = [];
    for (const [date, data] of dailyTotals.entries()) {
      const goalCal = goalMap.get(date) || 2000;
      const roundedCal = Math.round(data.calories);
      result.push({
        date,
        calories: roundedCal,
        itemsCount: data.itemsCount,
        goalCalories: goalCal,
        hasLogs: data.itemsCount > 0,
        completedRatio: Math.min(Math.round((roundedCal / goalCal) * 100), 100)
      });
    }

    return {
      month: ym,
      days: result
    };
  }

  /**
   * Retorna evolução dos últimos N dias (ex: 7 dias) com meta para o gráfico de linhas
   */
  async getCalorieTrend(userId: string, daysCount: number = 7) {
    const dates = getLastNDays(daysCount);

    const meals = await prisma.meal.findMany({
      where: {
        userId,
        date: { in: dates }
      },
      include: {
        items: true
      }
    });

    const dayTotals = new Map<string, number>();
    for (const m of meals) {
      const sum = m.items.reduce((acc: number, it: any) => acc + it.calories, 0);
      dayTotals.set(m.date, (dayTotals.get(m.date) || 0) + sum);
    }

    const trend = [];
    for (const date of dates) {
      const goal = await goalService.getGoalByDate(userId, date);
      const consumed = Math.round((dayTotals.get(date) || 0) * 10) / 10;
      trend.push({
        date,
        dayOfWeek: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
        consumedCalories: consumed,
        goalCalories: Math.round(goal.calories),
        difference: Math.round((consumed - goal.calories) * 10) / 10
      });
    }

    return trend;
  }

  /**
   * Retorna distribuição de macronutrientes dos últimos N dias
   */
  async getMacroDistribution(userId: string, daysCount: number = 7) {
    const dates = getLastNDays(daysCount);

    const meals = await prisma.meal.findMany({
      where: {
        userId,
        date: { in: dates }
      },
      include: {
        items: true
      }
    });

    const distribution = dates.map((date) => {
      const dayMeals = meals.filter((m: any) => m.date === date);
      let proteins = 0;
      let carbs = 0;
      let fats = 0;

      for (const m of dayMeals) {
        for (const item of m.items) {
          proteins += item.proteins;
          carbs += item.carbs;
          fats += item.fats;
        }
      }

      return {
        date,
        dayOfWeek: new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
        proteins: Math.round(proteins * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
        fats: Math.round(fats * 10) / 10
      };
    });

    return distribution;
  }

  /**
   * Estatísticas gerais (médias semanal, mensal e totais)
   */
  async getSummaryStats(userId: string) {
    const last7Days = getLastNDays(7);
    const last30Days = getLastNDays(30);

    const [meals7, meals30] = await Promise.all([
      prisma.meal.findMany({
        where: { userId, date: { in: last7Days } },
        include: { items: true }
      }),
      prisma.meal.findMany({
        where: { userId, date: { in: last30Days } },
        include: { items: true }
      })
    ]);

    const calcAverage = (meals: any[], daysList: string[]) => {
      const dateCalories = new Map<string, number>();
      for (const m of meals) {
        const sum = m.items.reduce((acc: number, it: any) => acc + it.calories, 0);
        dateCalories.set(m.date, (dateCalories.get(m.date) || 0) + sum);
      }
      // Considera apenas dias que tiveram algum registro para média real de consumo
      const loggedDays = Array.from(dateCalories.values()).filter((c) => c > 0);
      if (loggedDays.length === 0) return 0;
      const total = loggedDays.reduce((a, b) => a + b, 0);
      return Math.round((total / loggedDays.length) * 10) / 10;
    };

    const weeklyAvg = calcAverage(meals7, last7Days);
    const monthlyAvg = calcAverage(meals30, last30Days);

    return {
      weeklyAverageCalories: weeklyAvg,
      monthlyAverageCalories: monthlyAvg,
      totalTrackedDays7: new Set(meals7.map((m: any) => m.date)).size,
      totalTrackedDays30: new Set(meals30.map((m: any) => m.date)).size
    };
  }
}

export const reportService = new ReportService();
