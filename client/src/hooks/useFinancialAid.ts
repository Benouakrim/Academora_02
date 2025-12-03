import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface PredictCostPayload {
  universityId: string;
  familyIncome: number;
  gpa: number;
  satScore?: number;
  residency: 'in-state' | 'out-of-state' | 'international';
  
  // Extended Financial Fields
  savings?: number;
  investments?: number;
  familySize?: number;
}

export interface PredictCostResult {
  tuition: number;
  housing: number;
  grossCost: number;
  efc: number;
  needAid: number;
  meritAid: number;
  totalAid: number;
  netPrice: number;
  breakdown: string;
}

export function useFinancialAid() {
  const mutation = useMutation<PredictCostResult, Error, PredictCostPayload>({
    mutationFn: async (payload) => {
      const body = {
        universityId: payload.universityId,
        familyIncome: payload.familyIncome,
        gpa: payload.gpa,
        satScore: payload.satScore,
        // Map residency enum to inState boolean for backward compatibility
        inState: payload.residency === 'in-state',
        // Include new fields
        savings: payload.savings,
        investments: payload.investments,
        familySize: payload.familySize,
      };
      const { data } = await api.post('/aid/predict', body);
      return data as PredictCostResult;
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    data: mutation.data,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
