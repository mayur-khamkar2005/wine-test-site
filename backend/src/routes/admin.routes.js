import { Router } from 'express';

import {
  getOverview,
  getRecords,
  getUsers,
} from '../controllers/admin.controller.js';
import { USER_ROLES } from '../constants/roles.js';
import { authorize, protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect, authorize(USER_ROLES.ADMIN));
router.get('/overview', getOverview);
router.get('/users', getUsers);
router.get('/records', getRecords);

export const adminRoutes = router;
