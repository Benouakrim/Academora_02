import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import AuthProvider from '@/components/auth/AuthProvider'
import MissingClerkKey from '@/components/auth/MissingClerkKey'
import App from './App.tsx'
import './styles/globals.css'
import './styles/article-content.css'
import './i18n/i18n.ts'

// Environment-aware Clerk publishable key selection
const clerkPk = import.meta.env.PROD
  ? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY_PROD ?? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  : import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (import.meta.env.PROD && clerkPk?.startsWith('pk_test_')) {
  console.warn('[Clerk] A test (pk_test_) key is being used in production. Replace with pk_live_ to remove development limits.')
}

// Production-ready Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Increased: Data remains "fresh" for 10 minutes (no refetching)
      staleTime: 1000 * 60 * 10, 
      // Increased: Cache remains in memory for 60 minutes
      gcTime: 1000 * 60 * 60,
      // Disable auto-refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Retry failed requests twice
      retry: 2,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {clerkPk ? (
      <ClerkProvider publishableKey={clerkPk}>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </ClerkProvider>
    ) : (
      <MissingClerkKey />
    )}
  </StrictMode>,
)
