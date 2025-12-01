import { Router } from 'express';
import { calculateMatches } from '../controllers/matchingController';
import { validate } from '../middleware/validate';
import { matchRequestSchema } from '../validation/matchingSchemas';

const router = Router();

router.post('/', validate(matchRequestSchema), calculateMatches);

export default router;
