import express from 'express';
import { protect } from '../../middlewares/authMiddleware';
import * as documentController from '../../controllers/documentController';

const router = express.Router();

router.use(protect as any); // All document routes require auth

router.post('/', documentController.create as any);
router.get('/', documentController.list as any);
router.get('/:id', documentController.get as any);
router.put('/:id/share', documentController.share as any);

export default router;
