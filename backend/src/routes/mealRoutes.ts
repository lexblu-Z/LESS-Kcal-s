import { Router } from 'express';
import { mealController } from '../controllers/mealController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/daily', mealController.getDaily);
router.post('/items', mealController.addItem);
router.put('/items/:itemId', mealController.updateItem);
router.delete('/items/:itemId', mealController.deleteItem);

export default router;
