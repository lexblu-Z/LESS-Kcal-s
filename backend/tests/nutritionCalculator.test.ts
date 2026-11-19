import { describe, it, expect } from 'vitest';
import { calculateNutritionalValues } from '../src/utils/nutritionCalculator.js';

describe('Calculadora Nutricional Proporcional (Regra de Ouro)', () => {
  const arrozBranco = {
    name: 'Arroz branco cozido',
    calories: 128,
    proteins: 2.5,
    carbs: 28.1,
    fats: 0.2,
    fibers: 1.6,
    baseUnit: 'g',
    baseQuantity: 100,
    servingSize: 25,
    servingUnit: 'colher de sopa cheia'
  };

  const frangoGrelhado = {
    name: 'Peito de frango grelhado sem pele',
    calories: 159,
    proteins: 32.0,
    carbs: 0.0,
    fats: 2.5,
    fibers: 0.0,
    baseUnit: 'g',
    baseQuantity: 100,
    servingSize: 120,
    servingUnit: 'filé médio'
  };

  const ovoCozido = {
    name: 'Ovo de galinha inteiro cozido',
    calories: 146,
    proteins: 13.3,
    carbs: 0.6,
    fats: 9.5,
    fibers: 0.0,
    baseUnit: 'g',
    baseQuantity: 100,
    servingSize: 50,
    servingUnit: 'unidade'
  };

  const azeite = {
    name: 'Azeite de oliva extravirgem',
    calories: 884,
    proteins: 0.0,
    carbs: 0.0,
    fats: 100.0,
    fibers: 0.0,
    baseUnit: 'ml',
    baseQuantity: 100,
    servingSize: 13,
    servingUnit: 'colher de sopa'
  };

  it('deve calcular valores exatos para porção base de 100g', () => {
    const res = calculateNutritionalValues(arrozBranco, 100, 'g');
    expect(res.gramsEquivalent).toBe(100);
    expect(res.calories).toBe(128);
    expect(res.proteins).toBe(2.5);
    expect(res.carbs).toBe(28.1);
    expect(res.fats).toBe(0.2);
    expect(res.fibers).toBe(1.6);
  });

  it('deve calcular proporcionalmente para 150g de arroz (exatamente 1.5x)', () => {
    const res = calculateNutritionalValues(arrozBranco, 150, 'g');
    expect(res.gramsEquivalent).toBe(150);
    expect(res.calories).toBe(192); // 128 * 1.5 = 192
    expect(res.proteins).toBe(3.75); // 2.5 * 1.5 = 3.75
    expect(res.carbs).toBe(42.15); // 28.1 * 1.5 = 42.15
    expect(res.fats).toBe(0.3); // 0.2 * 1.5 = 0.3
    expect(res.fibers).toBe(2.4); // 1.6 * 1.5 = 2.4
  });

  it('deve calcular proporcionalmente para 120g de frango grelhado (1.2x)', () => {
    const res = calculateNutritionalValues(frangoGrelhado, 120, 'g');
    expect(res.gramsEquivalent).toBe(120);
    expect(res.calories).toBe(190.8); // 159 * 1.2 = 190.8
    expect(res.proteins).toBe(38.4); // 32 * 1.2 = 38.4
    expect(res.carbs).toBe(0);
    expect(res.fats).toBe(3); // 2.5 * 1.2 = 3
  });

  it('deve calcular corretamente por unidades caseiras (ex: 2 ovos de 50g cada = 100g)', () => {
    const res = calculateNutritionalValues(ovoCozido, 2, 'unidade');
    expect(res.gramsEquivalent).toBe(100);
    expect(res.calories).toBe(146);
    expect(res.proteins).toBe(13.3);
    expect(res.carbs).toBe(0.6);
    expect(res.fats).toBe(9.5);
  });

  it('deve calcular corretamente colher de sopa de azeite (1 colher = 13ml)', () => {
    const res = calculateNutritionalValues(azeite, 1, 'colher de sopa');
    expect(res.gramsEquivalent).toBe(13);
    expect(res.calories).toBe(114.92); // 884 * 0.13 = 114.92
    expect(res.fats).toBe(13); // 100 * 0.13 = 13
  });

  it('deve rejeitar quantidade menor ou igual a zero', () => {
    expect(() => calculateNutritionalValues(arrozBranco, 0, 'g')).toThrow();
    expect(() => calculateNutritionalValues(arrozBranco, -50, 'g')).toThrow();
  });
});
