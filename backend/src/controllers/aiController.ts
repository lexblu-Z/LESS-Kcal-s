import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiService } from '../services/aiService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export const parseTextSchema = z.object({
  text: z.string().min(2, 'O texto da refeição é obrigatório.')
});

export const confirmMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD.'),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'SUPPER']),
  items: z.array(
    z.object({
      foodId: z.string().optional(),
      name: z.string().min(1),
      quantity: z.number().positive(),
      unit: z.string().default('g')
    })
  ).min(1, 'Pelo menos um item deve ser confirmado.')
});

export class AiController {
  async parseText(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { text } = parseTextSchema.parse(req.body);
      const preview = await aiService.parseNaturalText(text, req.user?.userId);
      res.json(preview);
    } catch (err) {
      next(err);
    }
  }

  async parsePhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        // Se não foi enviado arquivo físico, permite base64 no body
        if (req.body.imageBase64) {
          const buffer = Buffer.from(req.body.imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
          const preview = await aiService.parsePlatePhoto(buffer, 'image/jpeg', req.user?.userId);
          res.json(preview);
          return;
        }
        res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
        return;
      }

      const preview = await aiService.parsePlatePhoto(req.file.buffer, req.file.mimetype, req.user?.userId);
      res.json(preview);
    } catch (err) {
      next(err);
    }
  }

  async confirmMeal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { date, mealType, items } = confirmMealSchema.parse(req.body);
      const result = await aiService.confirmAndSaveMeal(req.user!.userId, date, mealType, items);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AiController();
