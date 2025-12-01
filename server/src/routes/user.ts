import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { validate } from '../middleware/validate';
import * as controller from '../controllers/userController';
import { updateProfileSchema, toggleSavedSchema } from '../validation/userSchemas';

const router = Router();

// Protect all user operations
router.use(requireAuth);

router.get('/profile', controller.getProfile);
router.patch('/profile', validate(updateProfileSchema), controller.updateProfile);
router.post('/saved/:id', validate(toggleSavedSchema), controller.toggleSaved);

export default router;
