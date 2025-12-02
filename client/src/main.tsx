import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import { ClerkProvider } from '@clerk/clerk-react'
import { HelmetProvider } from 'react-helmet-async'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthProvider from '@/components/auth/AuthProvider'
import MissingClerkKey from '@/components/auth/MissingClerkKey'

const clerkPk = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {clerkPk ? (
      <HelmetProvider>
        <ClerkProvider publishableKey={clerkPk}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </AuthProvider>
          </QueryClientProvider>
        </ClerkProvider>
      </HelmetProvider>
    ) : (
      <MissingClerkKey />
    )}
  </StrictMode>,
)
