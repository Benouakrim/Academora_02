import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ToggleHelpfulResponse {
  status: string;
  data: {
    id: string;
    helpfulCount: number;
    verified: boolean;
  };
}

/**
 * Hook to toggle the "helpful" vote on a review.
 * Sends a POST request to the engagement endpoint and optimistically updates the UI.
 */
export function useToggleHelpful(universityId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ToggleHelpfulResponse, 
    Error, 
    string,
    { previousData: unknown }
  >({
    mutationFn: async (reviewId: string) => {
      const { data } = await api.post(`/engagement/reviews/${reviewId}/helpful`);
      return data as ToggleHelpfulResponse;
    },
    onMutate: async (reviewId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reviews', universityId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['reviews', universityId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['reviews', universityId], (old: unknown) => {
        const oldData = old as { data?: Array<{ id: string; helpfulCount?: number }> };
        if (!oldData?.data) return old;
        
        return {
          ...oldData,
          data: oldData.data.map((review) =>
            review.id === reviewId
              ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
              : review
          ),
        };
      });

      // Return context with the snapshot
      return { previousData };
    },
    onError: (_err, _reviewId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['reviews', universityId], context.previousData);
      }
      toast.error('Failed to mark review as helpful');
    },
    onSuccess: () => {
      toast.success('Thanks for your feedback!');
    },
    onSettled: () => {
      // Always refetch after error or success to sync with server
      queryClient.invalidateQueries({ queryKey: ['reviews', universityId] });
    },
  });
}

/**
 * Hook to fetch the helpful status for the current user on a specific review.
 * This is a placeholder for future implementation when we track individual votes.
 */
export function useReviewStatus(_reviewId: string) {
  // Mock implementation - in production, this would query a ReviewHelpful junction table
  return {
    hasVoted: false,
    helpfulCount: 0,
  };
}
