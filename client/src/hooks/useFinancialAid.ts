import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface PredictCostPayload {
  universityId: string;
  income: number;
  gpa: number;
  sat?: number;
  inState: boolean;
}

export interface PredictCostResult {
  netPrice: number;
  stickerPrice: number;
  meritAid: number;
  needAid: number;
  efc: number;
}

export function useFinancialAid() {
  const mutation = useMutation<PredictCostResult, Error, PredictCostPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post('/aid/predict', payload);
      return data;
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
