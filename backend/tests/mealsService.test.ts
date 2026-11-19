import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

import { describe, it, expect, beforeEach } from 'vitest';
import { mealService } from '../src/services/mealService.js';
import { foodService } from '../src/services/foodService.js';
import { prisma } from '../src/config/prisma.js';

describe('Serviço de Refeições e Cálculos Proporcionais (MealService)', () => {
  let testUserId = '';
  let arrozFoodId = '';

  beforeEach(async () => {
    // 1. Usuário de teste
    let user = await prisma.user.findUnique({
      where: { email: 'test_meals@lesskcals.com' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test_meals@lesskcals.com',
          name: 'Usuário Teste Refeições',
          password: 'hashedpassword'
        }
      });
    }
    testUserId = user.id;

    // 2. Localiza o arroz branco na base TACO
    let arroz = await prisma.food.findFirst({
      where: { name: { contains: 'Arroz branco' } }
    });

    if (!arroz) {
      arroz = await prisma.food.create({
        data: {
          name: 'Arroz branco cozido',
          category: 'Cereais e derivados',
          calories: 128,
          proteins: 2.5,
          carbs: 28.1,
          fats: 0.2,
          fibers: 1.6,
          baseUnit: 'g',
          baseQuantity: 100,
          servingSize: 25,
          servingUnit: 'colher de sopa'
        }
      });
    }
    arrozFoodId = arroz.id;

    // 3. Limpa refeições antigas do usuário de teste
    await prisma.meal.deleteMany({
      where: { userId: testUserId }
    });
  });

  it('deve adicionar um item à refeição com snapshot proporcional exato', async () => {
    const testDate = '2026-11-19';

    // Adiciona 150g de arroz no almoço (1.5x)
    const item = await mealService.addItem(testUserId, {
      date: testDate,
      mealType: 'LUNCH',
      foodId: arrozFoodId,
      quantity: 150,
      unit: 'g'
    });

    expect(item).toBeDefined();
    expect(item.quantity).toBe(150);
    expect(item.calories).toBe(192); // 128 * 1.5 = 192
    expect(item.proteins).toBe(3.75); // 2.5 * 1.5 = 3.75
    expect(item.carbs).toBe(42.15); // 28.1 * 1.5 = 42.15
  });

  it('deve atualizar a quantidade e recalcular o snapshot nutricional imediatamente', async () => {
    const testDate = '2026-11-19';

    // Cria com 100g
    const item = await mealService.addItem(testUserId, {
      date: testDate,
      mealType: 'LUNCH',
      foodId: arrozFoodId,
      quantity: 100,
      unit: 'g'
    });

    expect(item.calories).toBe(128);

    // Atualiza para 200g (deve dobrar calorias para 256)
    const updated = await mealService.updateItem(testUserId, item.id, {
      quantity: 200,
      unit: 'g'
    });

    expect(updated.quantity).toBe(200);
    expect(updated.calories).toBe(256);
    expect(updated.proteins).toBe(5);
  });

  it('deve excluir um item da refeição com sucesso', async () => {
    const testDate = '2026-11-19';

    const item = await mealService.addItem(testUserId, {
      date: testDate,
      mealType: 'DINNER',
      foodId: arrozFoodId,
      quantity: 100,
      unit: 'g'
    });

    const res = await mealService.deleteItem(testUserId, item.id);
    expect(res.success).toBe(true);

    const check = await prisma.mealItem.findUnique({
      where: { id: item.id }
    });
    expect(check).toBeNull();
  });

  it('deve retornar o resumo diário com as 5 refeições estruturadas e cálculos de saldo', async () => {
    const testDate = '2026-11-19';

    // Registra 150g no Almoço
    await mealService.addItem(testUserId, {
      date: testDate,
      mealType: 'LUNCH',
      foodId: arrozFoodId,
      quantity: 150,
      unit: 'g'
    });

    const daily = await mealService.getDailyOverview(testUserId, testDate);

    expect(daily.date).toBe(testDate);
    expect(daily.meals).toHaveLength(5); // Café, Almoço, Lanche, Jantar, Ceia

    const lunch = daily.meals.find((m) => m.mealType === 'LUNCH');
    expect(lunch).toBeDefined();
    expect(lunch?.calories).toBe(192);
    expect(lunch?.items).toHaveLength(1);

    expect(daily.consumed.calories).toBe(192);
    expect(daily.remaining.calories).toBe(daily.goal.calories - 192);
  });
});
