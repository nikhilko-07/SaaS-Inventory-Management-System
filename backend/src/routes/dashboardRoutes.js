import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticate, validateOrganization } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(validateOrganization);

router.get('/', getDashboardStats);

export default router;