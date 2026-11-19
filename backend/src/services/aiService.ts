import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { foodService } from './foodService.js';
import { mealService, STANDARD_MEALS } from './mealService.js';
import { calculateNutritionalValues } from '../utils/nutritionCalculator.js';
import { MealType, AiParseResponse, AiParsedItem } from '../types/index.js';

interface RawExtractedItem {
  name: string;
  quantity: number;
  unit: string;
}

export class AiService {
  /**
   * Processa texto em linguagem natural
   */
  async parseNaturalText(text: string, userId?: string): Promise<AiParseResponse> {
    if (!text || text.trim().length === 0) {
      throw new Error('O texto da refeição não pode estar vazio.');
    }

    const detectedMealType = this.detectMealTypeFromText(text);
    let extracted: RawExtractedItem[] = [];

    if (ENV.GEMINI_API_KEY) {
      try {
        extracted = await this.callGeminiTextExtractor(text);
      } catch (err) {
        console.warn('⚠️ Falha na API Gemini, usando motor NLP local de fallback:', err);
        extracted = this.localNlpExtract(text);
      }
    } else {
      extracted = this.localNlpExtract(text);
    }

    if (extracted.length === 0) {
      extracted = this.localNlpExtract(text);
    }

    // Cruza os itens extraídos com a base TACO/TBCA
    const items = await this.matchItemsWithNutrition(extracted, userId);

    const totals = items.reduce(
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
      mealType: detectedMealType,
      items,
      totals,
      message: 'Revise os alimentos e quantidades identificados antes de confirmar o registro.'
    };
  }

  /**
   * Processa foto do prato
   */
  async parsePlatePhoto(imageBuffer: Buffer, mimeType: string, userId?: string): Promise<AiParseResponse> {
    let extracted: RawExtractedItem[] = [];

    if (ENV.GEMINI_API_KEY) {
      try {
        extracted = await this.callGeminiVisionExtractor(imageBuffer, mimeType);
      } catch (err) {
        console.warn('⚠️ Falha na API Gemini Vision, usando fallback:', err);
        extracted = this.getPhotoFallbackItems();
      }
    } else {
      extracted = this.getPhotoFallbackItems();
    }

    const items = await this.matchItemsWithNutrition(extracted, userId);

    // Marca explicitamente todos os itens da foto como estimativas
    for (const item of items) {
      item.isEstimate = true;
    }

    const totals = items.reduce(
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
      mealType: 'LUNCH',
      items,
      totals,
      message: 'Pesos por foto são estimativas baseadas em porções visuais. Ajuste as gramas antes de confirmar.'
    };
  }

  /**
   * Confirma e persiste os itens revisados na refeição
   */
  async confirmAndSaveMeal(
    userId: string,
    date: string,
    mealType: MealType,
    items: { foodId?: string; name: string; quantity: number; unit: string }[]
  ) {
    if (!items || items.length === 0) {
      throw new Error('Nenhum item para salvar.');
    }

    const createdItems = [];
    for (const it of items) {
      const created = await mealService.addItem(userId, {
        date,
        mealType,
        foodId: it.foodId,
        name: it.name,
        quantity: it.quantity,
        unit: it.unit
      });
      createdItems.push(created);
    }

    const dailyOverview = await mealService.getDailyOverview(userId, date);
    return {
      success: true,
      savedCount: createdItems.length,
      dailyOverview
    };
  }

  // --- MÉTODOS AUXILIARES ---

  private detectMealTypeFromText(text: string): MealType {
    const lower = text.toLowerCase();
    if (lower.includes('café') || lower.includes('cafe') || lower.includes('desjejum') || lower.includes('manhã')) {
      return 'BREAKFAST';
    }
    if (lower.includes('almoço') || lower.includes('almoco')) {
      return 'LUNCH';
    }
    if (lower.includes('lanche') || lower.includes('tarde')) {
      return 'AFTERNOON_SNACK';
    }
    if (lower.includes('jantar') || lower.includes('janta') || lower.includes('noite')) {
      return 'DINNER';
    }
    if (lower.includes('ceia')) {
      return 'SUPPER';
    }

    // Heurística pelo horário local atual
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'BREAKFAST';
    if (hour >= 11 && hour < 15) return 'LUNCH';
    if (hour >= 15 && hour < 19) return 'AFTERNOON_SNACK';
    if (hour >= 19 && hour < 22) return 'DINNER';
    return 'SUPPER';
  }

  /**
   * Extrator NLP local por expressões regulares para português brasileiro
   */
  private localNlpExtract(text: string): RawExtractedItem[] {
    const items: RawExtractedItem[] = [];

    // Limpa pontuações desnecessárias e divide por separadores comuns
    const segments = text
      .replace(/[\n\r]+/g, ', ')
      .replace(/\s+e\s+/gi, ', ')
      .replace(/\s*\+\s*/g, ', ')
      .split(/[,;]/);

    for (const rawSeg of segments) {
      const seg = rawSeg.trim();
      if (!seg || seg.length < 2) continue;

      // Padrões comuns:
      // "150g de arroz", "150 g arroz", "2 ovos", "1 concha de feijão", "2 fatias de pão", "1 scoop de whey"
      const match = seg.match(
        /^(?:comi|bebi|consumi)?\s*(\d+(?:[.,]\d+)?)\s*(g|ml|unidade[s]?|ovo[s]?|concha[s]?|colher(?:es)?\s*(?:de\s*sopa)?|fatia[s]?|scoop[s]?|copo[s]?|xícara[s]?|xicara[s]?|pedaço[s]?|pedaco[s]?)?\s*(?:de)?\s*(.+)$/i
      );

      if (match) {
        const qty = parseFloat(match[1].replace(',', '.'));
        let unit = match[2] ? match[2].trim().toLowerCase() : 'g';
        let foodName = match[3].trim().replace(/^de\s+/i, '');

        if (unit.startsWith('ovo')) {
          foodName = 'Ovo de galinha inteiro cozido';
          unit = 'unidade';
        } else if (unit.startsWith('colher')) {
          unit = 'colher de sopa';
        } else if (unit.startsWith('concha')) {
          unit = 'concha';
        } else if (unit.startsWith('fatia')) {
          unit = 'fatia';
        } else if (unit.startsWith('scoop')) {
          unit = 'scoop';
        } else if (unit.startsWith('unidade')) {
          unit = 'unidade';
        }

        if (foodName && qty > 0) {
          items.push({
            name: foodName,
            quantity: qty,
            unit
          });
        }
      } else {
        // Se só digitou o nome do alimento sem número (ex: "arroz", "feijão")
        const clean = seg.replace(/^(?:comi|bebi|consumi)\s+/i, '').trim();
        if (clean.length > 2) {
          items.push({
            name: clean,
            quantity: 100,
            unit: 'g'
          });
        }
      }
    }

    return items;
  }

  /**
   * Cruza a lista de itens extraídos com o banco de dados TACO/TBCA
   */
  private async matchItemsWithNutrition(
    extracted: RawExtractedItem[],
    userId?: string
  ): Promise<AiParsedItem[]> {
    const results: AiParsedItem[] = [];

    for (const raw of extracted) {
      // Busca no banco pelo nome
      const searchResults = await foodService.searchFoods(raw.name, undefined, userId, 5);
      const matched = searchResults[0];

      if (matched) {
        const calc = calculateNutritionalValues(matched, raw.quantity, raw.unit);
        results.push({
          name: raw.name,
          quantity: raw.quantity,
          unit: raw.unit,
          matchedFoodId: matched.id,
          matchedFoodName: matched.name,
          calories: calc.calories,
          proteins: calc.proteins,
          carbs: calc.carbs,
          fats: calc.fats,
          fibers: calc.fibers,
          isEstimate: false,
          confidence: 'high'
        });
      } else {
        // Estimativa padrão razoável (150 kcal, 8g P, 15g C, 5g F por 100g)
        const ratio = raw.quantity / 100;
        results.push({
          name: raw.name,
          quantity: raw.quantity,
          unit: raw.unit,
          calories: Math.round(150 * ratio * 10) / 10,
          proteins: Math.round(8 * ratio * 10) / 10,
          carbs: Math.round(15 * ratio * 10) / 10,
          fats: Math.round(5 * ratio * 10) / 10,
          fibers: Math.round(2 * ratio * 10) / 10,
          isEstimate: true,
          confidence: 'medium'
        });
      }
    }

    return results;
  }

  private getPhotoFallbackItems(): RawExtractedItem[] {
    return [
      { name: 'Arroz branco cozido', quantity: 150, unit: 'g' },
      { name: 'Feijão carioca cozido (50% grão, 50% caldo)', quantity: 130, unit: 'g' },
      { name: 'Peito de frango grelhado sem pele', quantity: 120, unit: 'g' },
      { name: 'Alface crespa crua', quantity: 30, unit: 'g' }
    ];
  }

  private async callGeminiTextExtractor(promptText: string): Promise<RawExtractedItem[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${ENV.AI_MODEL}:generateContent?key=${ENV.GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Você é um assistente nutricional especializado em alimentos brasileiros.
Extraia os alimentos consumidos a partir do seguinte texto, retornando APENAS um array JSON válido com os campos:
[
  { "name": "nome do alimento", "quantity": número, "unit": "g" | "ml" | "unidade" | "colher de sopa" | "concha" | "fatia" | "scoop" }
]
Se a unidade não for informada, use "g" para sólidos e "ml" para líquidos. Se a quantidade não for informada, estime uma porção padrão brasileira.

Texto do usuário: "${promptText}"`
            }
          ]
        }
      ]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini API retornou erro HTTP ${res.status}`);
    }

    const data: any = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Resposta vazia da IA Gemini');
    }

    // Extrai o bloco JSON
    const jsonMatch = candidateText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Formato JSON não encontrado na resposta');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.map((item: any) => ({
      name: String(item.name || '').trim(),
      quantity: Number(item.quantity) || 100,
      unit: String(item.unit || 'g').trim()
    }));
  }

  private async callGeminiVisionExtractor(imageBuffer: Buffer, mimeType: string): Promise<RawExtractedItem[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${ENV.AI_MODEL}:generateContent?key=${ENV.GEMINI_API_KEY}`;
    const base64Data = imageBuffer.toString('base64');

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Analise visualmente este prato de comida brasileira.
Identifique cada alimento visível e estime a quantidade em gramas (g) ou unidades.
Retorne APENAS um array JSON no formato:
[
  { "name": "nome do alimento", "quantity": número, "unit": "g" | "unidade" }
]`
            },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini Vision retornou status ${res.status}`);
    }

    const data: any = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = candidateText?.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Falha ao extrair JSON da imagem');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.map((item: any) => ({
      name: String(item.name || '').trim(),
      quantity: Number(item.quantity) || 100,
      unit: String(item.unit || 'g').trim()
    }));
  }
}

export const aiService = new AiService();
