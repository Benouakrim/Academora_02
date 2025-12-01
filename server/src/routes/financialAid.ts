import { Router } from 'express';
import { validate } from '../middleware/validate';
import { predictRequestSchema } from '../validation/financialAidSchemas';
import * as controller from '../controllers/financialAidController';

const router = Router();

router.post('/predict', validate(predictRequestSchema), controller.predict);

export default router;
