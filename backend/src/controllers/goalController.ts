import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { goalService } from '../services/goalService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export const setGoalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use YYYY-MM-DD.').optional(),
  calories: z.number().positive('As calorias devem ser maiores que zero.'),
  proteins: z.number().min(0, 'Proteínas não podem ser negativas.'),
  carbs: z.number().min(0, 'Carboidratos não podem ser negativos.'),
  fats: z.number().min(0, 'Gorduras não podem ser negativas.'),
  waterMl: z.number().int().min(0).optional()
});

export class GoalController {
  async getGoal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const date = req.query.date as string | undefined;
      const goal = await goalService.getGoalByDate(req.user!.userId, date);
      res.json(goal);
    } catch (err) {
      next(err);
    }
  }

  async setGoal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = setGoalSchema.parse(req.body);
      const goal = await goalService.setGoal(req.user!.userId, data);
      res.json(goal);
    } catch (err) {
      next(err);
    }
  }
}

export const goalController = new GoalController();
