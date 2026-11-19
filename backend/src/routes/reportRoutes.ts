import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/calendar', reportController.getCalendar);
router.get('/trend', reportController.getTrend);
router.get('/macros', reportController.getMacroDistribution);
router.get('/summary', reportController.getSummary);

export default router;
