import { Router } from 'express';
import { goalController } from '../controllers/goalController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', goalController.getGoal);
router.post('/', goalController.setGoal);

export default router;
