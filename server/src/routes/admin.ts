import { Router } from 'express'
import { getStats } from '../controllers/adminController'
import { requireAdmin } from '../middleware/requireAdmin'

const router = Router()

router.get('/stats', requireAdmin, getStats)

export default router
