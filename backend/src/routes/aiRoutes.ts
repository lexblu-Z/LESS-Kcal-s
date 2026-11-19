import { Router } from 'express';
import multer from 'multer';
import { aiController } from '../controllers/aiController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

const router = Router();

router.use(authMiddleware);

router.post('/parse-text', aiController.parseText);
router.post('/parse-photo', upload.single('image'), aiController.parsePhoto);
router.post('/confirm-meal', aiController.confirmMeal);

export default router;
