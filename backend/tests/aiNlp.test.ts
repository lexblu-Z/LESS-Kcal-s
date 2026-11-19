import { describe, it, expect } from 'vitest';
import { aiService } from '../src/services/aiService.js';

describe('Processamento de Texto Natural com IA (Local NLP & Preview)', () => {
  it('deve extrair itens, unidades e gramas de texto em linguagem natural', async () => {
    const text = 'Comi 150g de arroz branco cozido, 120g de frango grelhado e 2 ovos';
    const result = await aiService.parseNaturalText(text);

    expect(result.items).toBeDefined();
    expect(result.items.length).toBeGreaterThanOrEqual(2);

    // O preview nunca salva automaticamente, retorna sempre prévia editável
    expect(result.totals).toBeDefined();
    expect(result.totals.calories).toBeGreaterThan(0);
    expect(result.totals.proteins).toBeGreaterThan(0);

    const arrozItem = result.items.find((i) => i.name.toLowerCase().includes('arroz'));
    expect(arrozItem).toBeDefined();
    expect(arrozItem?.quantity).toBe(150);
  });

  it('deve detectar o tipo de refeição com base no texto', async () => {
    const cafeText = 'No café da manhã comi 2 fatias de pão de forma e 1 xícara de café';
    const cafeResult = await aiService.parseNaturalText(cafeText);
    expect(cafeResult.mealType).toBe('BREAKFAST');

    const almocoText = 'Almoço: 150g de arroz e 1 concha de feijão';
    const almocoResult = await aiService.parseNaturalText(almocoText);
    expect(almocoResult.mealType).toBe('LUNCH');
  });
});
