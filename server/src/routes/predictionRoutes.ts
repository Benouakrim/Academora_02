import { Router } from 'express'
import PredictionController from '../controllers/PredictionController'

const router = Router()

router.post('/analyze', PredictionController.analyze)
router.get('/:articleId/history', PredictionController.history)
router.post('/batch', PredictionController.batchAnalyze)

export default router
