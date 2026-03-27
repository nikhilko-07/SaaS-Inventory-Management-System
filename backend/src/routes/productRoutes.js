import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustStock,
  deleteProduct
} from '../controllers/productController.js';
import { authenticate, validateOrganization } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { productSchema, stockAdjustmentSchema } from '../middleware/validation.js';

const router = express.Router();

router.use(authenticate);
router.use(validateOrganization);

router.get('/', getProducts);
router.post('/', validate(productSchema), createProduct);
router.get('/:id', getProduct);
router.put('/:id', validate(productSchema), updateProduct);
router.patch('/:id/adjust-stock', validate(stockAdjustmentSchema), adjustStock);
router.delete('/:id', deleteProduct);

export default router;