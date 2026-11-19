import { Router } from 'express';
import { foodController } from '../controllers/foodController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Rotas públicas ou com auth opcional
router.get('/categories', foodController.getCategories);
router.post('/calculate', foodController.calculate);

// Rotas que usam autenticação
router.use(authMiddleware);

router.get('/search', foodController.search);
router.get('/favorites', foodController.getFavorites);
router.post('/favorites/:foodId', foodController.toggleFavorite);
router.get('/recent', foodController.getRecent);
router.post('/custom', foodController.createCustom);
router.get('/:id', foodController.getById);

export default router;
