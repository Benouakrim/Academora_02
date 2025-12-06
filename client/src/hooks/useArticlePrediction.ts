import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { postAnalyzeArticle } from '../api/predictionApi'
import type { PredictRequest, PredictionResult } from '../../../shared/types/articleForecaster'

export function useArticlePrediction() {
  return useMutation<PredictionResult, Error, PredictRequest>({
    mutationFn: async (data) => {
      try {
        return await postAnalyzeArticle(data)
      } catch (err: any) {
        toast.error('Prediction failed.')
        throw err
      }
    },
  })
}

