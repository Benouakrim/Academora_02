import { AlertTriangle, RefreshCw, LogIn, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'

interface AuthErrorProps {
  type: 'unauthorized' | 'network' | 'token' | 'server' | 'unknown'
  message?: string
  onRetry?: () => void
}

export default function AuthError({ type, message, onRetry }: AuthErrorProps) {
  const navigate = useNavigate()
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    console.log('[AuthError] User requested sign out')
    await signOut()
    navigate('/sign-in')
  }

  const getErrorConfig = () => {
    switch (type) {
      case 'unauthorized':
        return {
          title: 'Authentication Required',
          description: message || 'Your session has expired or you are not logged in. Please sign in again to continue.',
          icon: <LogIn className="h-12 w-12 text-orange-500" />,
          actions: (
            <>
              <Button onClick={() => navigate('/sign-in')} className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </>
          )
        }
      
      case 'token':
        return {
          title: 'Authentication Token Issue',
          description: message || 'There was a problem with your authentication token. This might be due to a synchronization issue between your browser and our servers. Try signing out and back in.',
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
          actions: (
            <>
              <Button onClick={handleSignOut} variant="destructive">
                Sign Out & Sign In Again
              </Button>
              {onRetry && (
                <Button variant="outline" onClick={onRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
            </>
          )
        }
      
      case 'network':
        return {
          title: 'Connection Error',
          description: message || 'Unable to connect to the server. Please check your internet connection and try again.',
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          actions: (
            <>
              {onRetry && (
                <Button onClick={onRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry Connection
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </>
          )
        }
      
      case 'server':
        return {
          title: 'Server Error',
          description: message || 'The server encountered an error while processing your request. Our team has been notified. Please try again later.',
          icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
          actions: (
            <>
              {onRetry && (
                <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              <Button onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </>
          )
        }
      
      default:
        return {
          title: 'Something Went Wrong',
          description: message || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
          icon: <AlertTriangle className="h-12 w-12 text-gray-500" />,
          actions: (
            <>
              {onRetry && (
                <Button onClick={onRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </>
          )
        }
    }
  }

  const config = getErrorConfig()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          {config.icon}
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {config.title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {config.description}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {config.actions}
        </div>
        
        {/* Technical Details for Debugging */}
        {process.env.NODE_ENV === 'development' && message && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Technical Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
              {message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
