import dotenv from 'dotenv';
dotenv.config();

import { describe, it, expect, beforeEach } from 'vitest';
import { goalService } from '../src/services/goalService.js';
import { prisma } from '../src/config/prisma.js';

describe('Versionamento e Isolamento de Metas Diárias', () => {
  let testUserId = '';

  beforeEach(async () => {
    // Cria ou recupera usuário de teste temporário
    let user = await prisma.user.findUnique({
      where: { email: 'test_goals@lesskcals.com' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test_goals@lesskcals.com',
          name: 'Usuário Teste Metas',
          password: 'hashedpassword'
        }
      });
    }

    testUserId = user.id;

    // Limpa metas existentes desse usuário de teste
    await prisma.dailyGoal.deleteMany({
      where: { userId: testUserId }
    });
  });

  it('deve salvar meta em um dia específico sem alterar a meta de dias anteriores (Regra Crítica)', async () => {
    const yesterday = '2026-11-18';
    const today = '2026-11-19';

    // 1. Cadastra meta do dia anterior
    await goalService.setGoal(testUserId, {
      date: yesterday,
      calories: 1800,
      proteins: 130,
      carbs: 180,
      fats: 50,
      waterMl: 2000
    });

    // 2. Cadastra nova meta hoje (ex: aumentou calorias para 2500)
    await goalService.setGoal(testUserId, {
      date: today,
      calories: 2500,
      proteins: 180,
      carbs: 250,
      fats: 80,
      waterMl: 3000
    });

    // 3. Consulta meta de ontem: DEVE continuar 1800 kcal intacta!
    const goalYesterday = await goalService.getGoalByDate(testUserId, yesterday);
    expect(goalYesterday.calories).toBe(1800);
    expect(goalYesterday.proteins).toBe(130);
    expect(goalYesterday.carbs).toBe(180);
    expect(goalYesterday.fats).toBe(50);

    // 4. Consulta meta de hoje: DEVE ser 2500 kcal
    const goalToday = await goalService.getGoalByDate(testUserId, today);
    expect(goalToday.calories).toBe(2500);
    expect(goalToday.proteins).toBe(180);
    expect(goalToday.carbs).toBe(250);
    expect(goalToday.fats).toBe(80);
  });

  it('deve herdar a última meta válida se o dia específico não tiver meta gravada', async () => {
    const baseDate = '2026-11-10';
    const futureDate = '2026-11-15';

    await goalService.setGoal(testUserId, {
      date: baseDate,
      calories: 2200,
      proteins: 160,
      carbs: 210,
      fats: 70
    });

    const goalFuture = await goalService.getGoalByDate(testUserId, futureDate);
    expect(goalFuture.calories).toBe(2200);
    expect(goalFuture.proteins).toBe(160);
  });
});
