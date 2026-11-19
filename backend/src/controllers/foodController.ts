import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { foodService } from '../services/foodService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export const customFoodSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  category: z.string().optional(),
  baseUnit: z.enum(['g', 'ml']).default('g'),
  calories: z.number().min(0, 'Calorias não podem ser negativas.'),
  proteins: z.number().min(0, 'Proteínas não podem ser negativas.'),
  carbs: z.number().min(0, 'Carboidratos não podem ser negativos.'),
  fats: z.number().min(0, 'Gorduras não podem ser negativas.'),
  fibers: z.number().min(0).optional(),
  servingSize: z.number().positive().optional(),
  servingUnit: z.string().optional()
});

export const calculateSchema = z.object({
  foodId: z.string().min(1, 'ID do alimento é obrigatório.'),
  quantity: z.number().positive('Quantidade deve ser maior que zero.'),
  unit: z.string().default('g')
});

export class FoodController {
  async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || '';
      const category = req.query.category as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const userId = req.user?.userId;

      const foods = await foodService.searchFoods(q, category, userId, limit);
      res.json(foods);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const food = await foodService.getFoodById(req.params.id, req.user?.userId);
      res.json(food);
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await foodService.getCategories();
      res.json(categories);
    } catch (err) {
      next(err);
    }
  }

  async getFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const favorites = await foodService.getFavorites(req.user!.userId);
      res.json(favorites);
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await foodService.toggleFavorite(req.user!.userId, req.params.foodId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getRecent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const recent = await foodService.getRecentFoods(req.user!.userId, limit);
      res.json(recent);
    } catch (err) {
      next(err);
    }
  }

  async createCustom(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = customFoodSchema.parse(req.body);
      const food = await foodService.createCustomFood(req.user!.userId, data);
      res.status(201).json(food);
    } catch (err) {
      next(err);
    }
  }

  async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const { foodId, quantity, unit } = calculateSchema.parse(req.body);
      const result = await foodService.calculate(foodId, quantity, unit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const foodController = new FoodController();
