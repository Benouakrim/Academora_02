import axios from 'axios'

const resolveBaseURL = () => {
  // 1) Explicit override from env
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) return envUrl

  // 2) If we're running in the browser, prefer same-origin in production
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1')

    if (!isLocal) {
      // Assume the API is reverse-proxied at /api in prod
      return `${origin}/api`
    }

    // Local development fallback
    return 'http://localhost:3001/api'
  }

  // SSR/unknown context fallback
  return 'http://localhost:3001/api'
}

const baseURL = resolveBaseURL()

export const api = axios.create({
  baseURL,
})

type GetTokenFn = () => Promise<string | null>

export function setupInterceptors(getToken: GetTokenFn) {
  // Avoid adding multiple interceptors if called more than once
  const alreadySet = (api.defaults as any)._authInterceptorSet
  if (alreadySet) return

  const interceptorId = api.interceptors.request.use(
    async (config) => {
      try {
        console.log('[API Interceptor] Requesting token for:', config.url)
        // Get token from Clerk - try without template first for compatibility
        const token = await getToken()
        
        if (token) {
          console.log('[API Interceptor] ✅ Token retrieved successfully:', `${token.substring(0, 20)}...`)
          if (!config.headers) {
            config.headers = {} as any
          }
          config.headers.Authorization = `Bearer ${token}`
        } else {
          console.warn('[API Interceptor] ⚠️ No token returned from Clerk. User might not be authenticated.')
        }
      } catch (err) {
        console.error('[API Interceptor] ❌ Error getting token:', err)
      }
      return config
    },
    (error) => {
      console.error('[API Interceptor] ❌ Request interceptor error:', error)
      return Promise.reject(error)
    }
  )

  // Add response interceptor for better error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status
      const url = error?.config?.url
      
      if (status === 401) {
        console.error('[API Response] ❌ 401 Unauthorized:', {
          url,
          message: error?.response?.data?.message || error?.response?.data?.error,
          hasToken: !!error?.config?.headers?.Authorization
        })
      } else if (status === 403) {
        console.error('[API Response] ❌ 403 Forbidden:', {
          url,
          message: error?.response?.data?.message || error?.response?.data?.error
        })
      } else if (error?.code === 'ERR_NETWORK') {
        console.error('[API Response] ❌ Network Error - Server might be down:', {
          url,
          baseURL: error?.config?.baseURL
        })
      }
      
      return Promise.reject(error)
    }
  )

  ;(api.defaults as any)._authInterceptorSet = interceptorId
  console.log('[API Interceptor] Setup complete with enhanced logging')
}

export default api
