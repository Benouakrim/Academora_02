import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'

/**
 * Hook to initiate the Stripe Checkout session.
 */
export function useCheckoutSubscription() {
  return useMutation({
    mutationFn: async () => {
      // POST request to the backend endpoint created in Prompt 21
      const { data } = await api.post<{ status: string, url: string }>('/billing/checkout')
      return data.url
    },
    onSuccess: (url) => {
      // Redirect the user to the Stripe Checkout page
      toast.info('Redirecting to secure payment...', { duration: 2000 })
      window.location.href = url
    },
    onError: (error) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to start payment process. Please try again.'
      toast.error('Subscription Error', { description: message })
    },
  })
}
