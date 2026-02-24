import { env } from '../config/env'

const withTimeout = async (promise, timeoutMs) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await promise(controller.signal)
  } finally {
    clearTimeout(timer)
  }
}

export const httpClient = async (path, options = {}) => {
  const url = `${env.apiBaseUrl}${path}`
  const accessToken = localStorage.getItem('junhye.auth.token') || ''

  const response = await withTimeout(
    (signal) =>
      fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(options.headers || {}),
        },
        signal,
        ...options,
      }),
    env.timeout,
  )

  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`)
  }

  return data
}
