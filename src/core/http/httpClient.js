import { env } from '../config/env'

// Simple in-memory cache for GET requests with different TTLs
const requestCache = new Map()
const CACHE_TTL = {
  products: 5 * 60 * 1000,      // 5 minutes for products
  categories: 10 * 60 * 1000,   // 10 minutes for categories (rarely change)
  user: 1 * 60 * 1000,          // 1 minute for user data
  default: 2 * 60 * 1000,        // 2 minutes default
}

const withTimeout = async (promise, timeoutMs) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await promise(controller.signal)
  } finally {
    clearTimeout(timer)
  }
}

// Retry logic for failed requests
const retryRequest = async (fn, retries = 2, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && !error.message.includes('aborted')) {
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

// Generate cache key from URL and options
const getCacheKey = (url, options) => {
  if (options.method && options.method !== 'GET') return null
  return `${url}${JSON.stringify(options.body || {})}`
}

// Get cache TTL based on endpoint
const getCacheTTL = (path) => {
  if (path.includes('/v1/products')) return CACHE_TTL.products
  if (path.includes('/v1/categories')) return CACHE_TTL.categories
  if (path.includes('/v1/user') || path.includes('/v1/cart')) return CACHE_TTL.user
  return CACHE_TTL.default
}

export const httpClient = async (path, options = {}) => {
  const url = `${env.apiBaseUrl}${path}`
  const accessToken = localStorage.getItem('junhye.auth.token') || ''
  const method = options.method || 'GET'
  
  // Disable retry for logout requests
  const isLogoutRequest = path.includes('/auth/logout')
  const shouldRetry = !isLogoutRequest

  // Check cache for GET requests
  const cacheKey = getCacheKey(url, options)
  if (cacheKey && requestCache.has(cacheKey)) {
    const cached = requestCache.get(cacheKey)
    const ttl = getCacheTTL(path)
    if (Date.now() - cached.timestamp < ttl) {
      return cached.data
    }
    requestCache.delete(cacheKey)
  }

  const makeRequest = async (signal) => {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
      },
      signal,
      ...options,
    })

    const data = response.status === 204 ? null : await response.json().catch(() => null)

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('junhye.auth.token')
        localStorage.removeItem('junhye.auth.user')
      }
      throw new Error(data?.message || `Request failed: ${response.status}`)
    }

    // Cache successful GET requests
    if (cacheKey && method === 'GET' && response.ok) {
      // Don't cache if response indicates no-cache
      const cacheControl = response.headers.get('Cache-Control')
      if (!cacheControl || !cacheControl.includes('no-cache')) {
        requestCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        })
      }
    }

    return data
  }

  try {
    if (shouldRetry) {
      const result = await retryRequest(
        () => withTimeout((signal) => makeRequest(signal), env.timeout),
        2, // Retry up to 2 times
      )
      return result
    } else {
      // No retry for logout - just make the request once
      return await withTimeout((signal) => makeRequest(signal), env.timeout)
    }
  } catch (error) {
    // Enhanced error handling
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.')
    }
    throw error
  }
}

// Clear cache utility (useful for logout or after mutations)
export const clearHttpCache = () => {
  requestCache.clear()
}

// Clear specific cache by pattern
export const clearCacheByPattern = (pattern) => {
  for (const key of requestCache.keys()) {
    if (key.includes(pattern)) {
      requestCache.delete(key)
    }
  }
}
