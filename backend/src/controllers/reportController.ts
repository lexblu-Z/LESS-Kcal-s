import { Response, NextFunction } from 'express';
import { reportService } from '../services/reportService.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export class ReportController {
  async getCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const month = req.query.month as string | undefined;
      const data = await reportService.getMonthlyCalendar(req.user!.userId, month);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getTrend(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const data = await reportService.getCalorieTrend(req.user!.userId, days);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getMacroDistribution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const data = await reportService.getMacroDistribution(req.user!.userId, days);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getSummaryStats(req.user!.userId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export const reportController = new ReportController();
