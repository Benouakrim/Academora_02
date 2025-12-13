import { Router } from 'express'
import PredictionController from '../controllers/PredictionController'

const router = Router()

// Legacy article forecasting routes
router.post('/analyze', PredictionController.analyze)
router.get('/:articleId/history', PredictionController.history)
router.post('/batch', PredictionController.batchAnalyze)

// NEW: Scenario 2 - Transient Simulation Routes
// POST /prediction/simulate/match - Single match score prediction
router.post('/simulate/match', PredictionController.simulateMatchScore)

// POST /prediction/simulate/match/batch - Batch match score predictions
router.post('/simulate/match/batch', PredictionController.batchSimulateMatchScores)

export default router
