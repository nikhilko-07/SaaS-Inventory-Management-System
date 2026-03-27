import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { authenticate, validateOrganization } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { settingSchema } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);
router.use(validateOrganization);

router.get('/', getSettings);
router.put('/', validate(settingSchema), updateSettings);

export default router;