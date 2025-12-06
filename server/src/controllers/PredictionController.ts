import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import predictionService from '../services/PredictionService'
import { AppError } from '../utils/AppError'
import { PredictRequestSchema, HistoryParamsSchema } from '../../../shared/schemas/articleForecasterSchemas'

export async function analyze(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = PredictRequestSchema.parse(req.body)
    const result = await predictionService.generatePrediction(parsed)
    return res.status(200).json({ ok: true, data: result })
  } catch (err) {
    if (err instanceof ZodError) {
      return next(new AppError(400, err.flatten().formErrors.join('. ') || err.message))
    }
    next(err)
  }
}

export async function history(req: Request, res: Response, next: NextFunction) {
  try {
    const params = HistoryParamsSchema.parse(req.params)
    const rows = await predictionService.getHistory(params.articleId)
    return res.status(200).json({ ok: true, data: rows })
  } catch (err) {
    if (err instanceof ZodError) {
      return next(new AppError(400, err.flatten().formErrors.join('. ') || err.message))
    }
    next(err)
  }
}

export default { analyze, history }
