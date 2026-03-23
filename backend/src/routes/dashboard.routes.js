import { Router } from 'express';

import { getSummary } from '../controllers/dashboard.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/summary', protect, getSummary);

export const dashboardRoutes = router;

