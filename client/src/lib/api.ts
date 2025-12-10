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

  const interceptorId = api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken()
      console.log('[API Interceptor] Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null')
      if (token) {
        if (!config.headers) {
          config.headers = {} as any
        }
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (err) {
      console.error('[API Interceptor] Error getting token:', err)
    }
    return config
  })

  ;(api.defaults as any)._authInterceptorSet = interceptorId
  console.log('[API Interceptor] Setup complete')
}

export default api
