import { Router } from 'express'
import PredictionController from '../controllers/PredictionController'

const router = Router()

router.post('/analyze', PredictionController.analyze)
router.get('/:articleId/history', PredictionController.history)

export default router
