import { api } from '@/lib/api'
import type { PredictRequest, PredictionResult } from '../../../shared/types/articleForecaster'

/**
 * Legacy article forecasting - predicts article performance
 */
export async function postAnalyzeArticle(data: PredictRequest): Promise<PredictionResult> {
  const res = await api.post('/predictions/analyze', data)
  return res.data.data as PredictionResult
}

// ============================================================================
// NEW: Transient Simulation/Prediction APIs (Scenario 2)
// ============================================================================

export interface SimulateMatchScoreRequest {
  userId: string;
  universityId: string;
  universityData: Record<string, unknown>;
}

export interface SimulateMatchScoreResponse {
  success: boolean;
  matchScore: number;
  message?: string;
}

/**
 * Simulate match score without persisting changes
 * 
 * This calls a backend service that calculates how a student would match
 * with the given university data WITHOUT saving anything to the database.
 * Useful for What-If analysis and exploration.
 */
export async function simulateMatchScore(
  request: SimulateMatchScoreRequest
): Promise<SimulateMatchScoreResponse> {
  const response = await api.post<SimulateMatchScoreResponse>(
    '/prediction/simulate/match',
    request
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Simulation failed');
  }

  return response.data;
}

/**
 * Batch simulate match scores for multiple scenarios
 * Useful for comparing multiple universities or scenarios at once
 */
export interface BatchSimulateRequest {
  userId: string;
  scenarios: Array<{
    universityId: string;
    universityData: Record<string, unknown>;
    label?: string;
  }>;
}

export interface BatchSimulateResponse {
  success: boolean;
  results: Array<{
    universityId: string;
    matchScore: number;
    label?: string;
  }>;
}

export async function batchSimulateMatchScores(
  request: BatchSimulateRequest
): Promise<BatchSimulateResponse> {
  const response = await api.post<BatchSimulateResponse>(
    '/prediction/simulate/match/batch',
    request
  );

  if (!response.data.success) {
    throw new Error('Batch simulation failed');
  }

  return response.data;
}
