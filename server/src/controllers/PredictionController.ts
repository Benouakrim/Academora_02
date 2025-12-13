import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import predictionService from '../services/PredictionService'
import { MatchScoreService } from '../services/MatchScoreService'
import { AppError } from '../utils/AppError'
import { PredictRequestSchema, HistoryParamsSchema } from '../../../shared/schemas/articleForecasterSchemas'

export async function batchAnalyze(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({ articleIds: z.array(z.string()) })
    const { articleIds } = schema.parse(req.body)
    const results = await predictionService.runBatchPredictions(articleIds)
    return res.status(200).json({ ok: true, data: results })
  } catch (err) {
    if (err instanceof ZodError) {
      return next(new AppError(400, err.flatten().formErrors.join('. ') || err.message))
    }
    next(err)
  }
}

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

// ============================================================================
// NEW: Scenario 2 - Transient Simulation (Non-Persisting Prediction)
// ============================================================================

/**
 * Simulate match score WITHOUT persisting changes
 * 
 * Scenario 2 implementation: Takes temporary university data and calculates
 * how a student would match without modifying the database.
 * Perfect for What-If analysis and scenario exploration.
 */
export async function simulateMatchScore(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      userId: z.string(),
      universityId: z.string().optional(),
      universityData: z.record(z.unknown()),
    })

    const { userId, universityId, universityData } = schema.parse(req.body)

    if (!userId || !universityData) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId or universityData for simulation.',
      })
    }

    // SCENARIO 2 Backend Logic: Call service with transient data instead of DB
    const result = await MatchScoreService.calculateTransientMatchScore(
      userId,
      universityData
    )

    // Tracking (Scenario 5/Tracking solution): Log the simulation event
    // await AnalyticsTrackingService.track('simulation_run', {
    //   userId,
    //   universityId,
    //   matchScore: result.matchScore,
    //   timestamp: new Date(),
    // })

    res.status(200).json({
      success: true,
      matchScore: result.matchScore,
      details: result.details,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return next(
        new AppError(400, err.flatten().formErrors.join('. ') || err.message)
      )
    }
    if (err instanceof AppError) {
      return next(err)
    }
    // This is a transient error, safe to expose
    next(
      new AppError(500, err instanceof Error ? err.message : 'Simulation failed')
    )
  }
}

/**
 * Batch simulate match scores for multiple scenarios
 * Useful for comparing universities side-by-side
 */
export async function batchSimulateMatchScores(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const schema = z.object({
      userId: z.string(),
      scenarios: z.array(
        z.object({
          universityId: z.string().optional(),
          universityData: z.record(z.unknown()),
          label: z.string().optional(),
        })
      ),
    })

    const { userId, scenarios } = schema.parse(req.body)

    if (!userId || !scenarios || scenarios.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing userId or scenarios for batch simulation.',
      })
    }

    // Call batch calculation service
    const results = await MatchScoreService.calculateBatchMatchScores(
      userId,
      scenarios
    )

    res.status(200).json({
      success: true,
      results,
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return next(
        new AppError(400, err.flatten().formErrors.join('. ') || err.message)
      )
    }
    if (err instanceof AppError) {
      return next(err)
    }
    next(
      new AppError(
        500,
        err instanceof Error ? err.message : 'Batch simulation failed'
      )
    )
  }
}

export default { analyze, history, batchAnalyze, simulateMatchScore, batchSimulateMatchScores }
