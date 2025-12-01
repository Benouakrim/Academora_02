import { Router } from 'express';
import { getUniversities, getUniversityBySlug } from '../controllers/universityController';
import { validate } from '../middleware/validate';
import { searchUniversitiesSchema } from '../validation/universitySchemas';

const router = Router();

router.get('/', validate(searchUniversitiesSchema), getUniversities);
router.get('/:slug', getUniversityBySlug);

export default router;
