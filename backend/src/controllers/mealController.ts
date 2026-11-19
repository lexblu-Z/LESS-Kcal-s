import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { mealService } from '../services/mealService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export const addItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use YYYY-MM-DD.').optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'SUPPER']),
  foodId: z.string().optional(),
  name: z.string().optional(),
  quantity: z.number().positive('Quantidade deve ser maior que zero.'),
  unit: z.string().default('g')
});

export const updateItemSchema = z.object({
  quantity: z.number().positive('Quantidade deve ser maior que zero.'),
  unit: z.string().optional()
});

export class MealController {
  async getDaily(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const daily = await mealService.getDailyOverview(req.user!.userId, date);
      res.json(daily);
    } catch (err) {
      next(err);
    }
  }

  async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = addItemSchema.parse(req.body);
      const item = await mealService.addItem(req.user!.userId, data);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = updateItemSchema.parse(req.body);
      const updated = await mealService.updateItem(req.user!.userId, req.params.itemId, data);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await mealService.deleteItem(req.user!.userId, req.params.itemId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const mealController = new MealController();
