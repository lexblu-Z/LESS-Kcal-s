export interface FoodNutritionalBase {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fibers?: number;
  baseUnit?: string;
  baseQuantity?: number;
  servingSize?: number | null;
  servingUnit?: string | null;
}

export interface CalculationResult {
  gramsEquivalent: number;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fibers: number;
}

/**
 * Calcula os valores nutricionais proporcionais exatos com base no alimento,
 * na quantidade digitada e na unidade selecionada (g, ml, unidade, porção).
 */
export function calculateNutritionalValues(
  food: FoodNutritionalBase,
  quantity: number,
  unit: string = 'g'
): CalculationResult {
  if (quantity <= 0 || !Number.isFinite(quantity)) {
    throw new Error('A quantidade deve ser um número positivo maior que zero.');
  }

  const baseQty = food.baseQuantity && food.baseQuantity > 0 ? food.baseQuantity : 100;
  let gramsEquivalent = quantity;

  const normalizedUnit = unit.trim().toLowerCase();

  if (normalizedUnit === 'unidade' || normalizedUnit === 'porção' || normalizedUnit === 'porcao') {
    // Se o alimento tiver uma porção definida (ex: 1 ovo = 50g, 1 fatia = 25g, 1 concha = 130g)
    if (food.servingSize && food.servingSize > 0) {
      gramsEquivalent = quantity * food.servingSize;
    } else {
      // Fallback padrão se não houver servingSize cadastrado: assume 1 unidade = baseQty (100g/ml)
      gramsEquivalent = quantity * baseQty;
    }
  } else if (normalizedUnit === 'colher de sopa' || normalizedUnit === 'cs') {
    gramsEquivalent = quantity * (food.servingSize || 15);
  } else if (normalizedUnit === 'concha') {
    gramsEquivalent = quantity * (food.servingSize || 130);
  } else if (normalizedUnit === 'scoop') {
    gramsEquivalent = quantity * (food.servingSize || 30);
  } else if (normalizedUnit === 'fatia') {
    gramsEquivalent = quantity * (food.servingSize || 25);
  } else if (normalizedUnit === 'xícara' || normalizedUnit === 'xicara') {
    gramsEquivalent = quantity * 150;
  } else {
    // 'g' ou 'ml' ou padrão
    gramsEquivalent = quantity;
  }

  // Fator proporcional em relação à base (normalmente 100g ou 100ml)
  const factor = gramsEquivalent / baseQty;

  const roundToTwoDecimals = (val: number): number => {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  };

  return {
    gramsEquivalent: roundToTwoDecimals(gramsEquivalent),
    calories: roundToTwoDecimals(food.calories * factor),
    proteins: roundToTwoDecimals(food.proteins * factor),
    carbs: roundToTwoDecimals(food.carbs * factor),
    fats: roundToTwoDecimals(food.fats * factor),
    fibers: roundToTwoDecimals((food.fibers || 0) * factor)
  };
}
