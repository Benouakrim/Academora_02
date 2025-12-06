import { api } from '@/lib/api'
import type { PredictRequest, PredictionResult } from '../../../shared/types/articleForecaster'

export async function postAnalyzeArticle(data: PredictRequest): Promise<PredictionResult> {
  const res = await api.post('/predictions/analyze', data)
  return res.data.data as PredictionResult
}
