import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthProvider from '@/components/auth/AuthProvider'
import MissingClerkKey from '@/components/auth/MissingClerkKey'

const clerkPk = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {clerkPk ? (
      <ClerkProvider publishableKey={clerkPk}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </ClerkProvider>
    ) : (
      <MissingClerkKey />
    )}
  </StrictMode>,
)
