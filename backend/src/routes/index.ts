import { Router } from 'express';
import authRoutes from './authRoutes.js';
import goalRoutes from './goalRoutes.js';
import foodRoutes from './foodRoutes.js';
import mealRoutes from './mealRoutes.js';
import reportRoutes from './reportRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LESS-Kcal-s Backend API'
  });
});

router.use('/auth', authRoutes);
router.use('/goals', goalRoutes);
router.use('/foods', foodRoutes);
router.use('/meals', mealRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);

export default router;
