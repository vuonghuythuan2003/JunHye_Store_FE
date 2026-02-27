import { authApi } from './auth.api'
import { env } from '../../core/config/env'
import { clearHttpCache } from '../../core/http/httpClient'

const AUTH_TOKEN_KEY = 'junhye.auth.token'
const AUTH_USER_KEY = 'junhye.auth.user'

const SOCIAL_URL_BY_PROVIDER = {
  google: env.oauthGoogleUrl,
  facebook: env.oauthFacebookUrl,
  apple: env.oauthAppleUrl,
}

const unwrapApiData = (payload) => {
  if (!payload) return null
  if (typeof payload === 'object' && 'data' in payload) return payload.data
  return payload
}

const getMessage = (payload, fallback) => {
  if (!payload) return fallback
  if (typeof payload === 'object' && payload.message) return payload.message
  return fallback
}

const extractToken = (payload) => {
  const data = unwrapApiData(payload)
  if (!data || typeof data !== 'object') return ''

  return (
    data.accessToken ||
    data.token ||
    data.jwt ||
    data.jwtToken ||
    data.authenticationToken ||
    ''
  )
}

const extractUser = (payload, fallback = null) => {
  const data = unwrapApiData(payload)
  if (!data || typeof data !== 'object') return fallback

  if (data.user && typeof data.user === 'object') return data.user

  const hasIdentity = data.username || data.email || data.userId
  return hasIdentity ? data : fallback
}

export const authService = {
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY) || ''
  },

  getUser() {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  saveSession(token, user) {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    }

    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    }
  },

  clearSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  },

  getSocialLoginUrl(provider) {
    const key = String(provider || '').toLowerCase()
    const oauthUrl = SOCIAL_URL_BY_PROVIDER[key]

    if (!oauthUrl) {
      throw new Error(`Provider ${provider} chưa được hỗ trợ`)
    }

    // oauthUrl is already a full URL, just return it
    // Spring Security will handle the OAuth flow
    return oauthUrl
  },

  completeOAuthCallback(query) {
    const getQueryValue = (key) => {
      const value = query?.[key]
      if (Array.isArray(value)) return value[0]
      return value || ''
    }

    const token =
      getQueryValue('token') ||
      getQueryValue('accessToken') ||
      getQueryValue('jwt') ||
      getQueryValue('jwtToken')

    if (!token) {
      throw new Error('Callback không có token. Hãy kiểm tra backend redirect về /auth/callback?token=...')
    }

    const user = {
      username: getQueryValue('username') || 'social-user',
      email: getQueryValue('email') || '',
      fullName: getQueryValue('fullName') || getQueryValue('name') || '',
      provider: getQueryValue('provider') || 'social',
    }

    this.saveSession(token, user)

    return {
      token,
      user,
      message: 'Đăng nhập mạng xã hội thành công',
    }
  },

  async completeOAuthCallbackAndLoadUser(query) {
    const result = this.completeOAuthCallback(query)
    const userWithRoles = await this.fetchCurrentUser().catch(() => result.user)
    this.saveSession(null, userWithRoles || result.user)
    return { ...result, user: userWithRoles || result.user }
  },

  async signIn(form) {
    const payload = {
      username: form.username,
      password: form.password,
    }

    const response = await authApi.signIn(payload)
    const token = extractToken(response)
    const user = extractUser(response, {
      username: form.username,
    })

    if (!token) {
      throw new Error('Đăng nhập thành công nhưng không nhận được token từ BE')
    }

    this.saveSession(token, user)
    const userWithRoles = await this.fetchCurrentUser().catch(() => user)
    return {
      token,
      user: userWithRoles || user,
      message: getMessage(response, 'Đăng nhập thành công'),
    }
  },

  async signUp(form) {
    const payload = {
      username: (form.username || '').trim(),
      fullName: (form.fullName || '').trim() || null,
      phoneNumber: (form.phoneNumber || '').trim() || null,
      address: (form.address || '').trim() || null,
      email: (form.email || '').trim(),
      password: form.password,
      status: true,
    }

    const response = await authApi.signUp(payload)

    return {
      data: unwrapApiData(response),
      message: getMessage(response, 'Đăng ký thành công'),
    }
  },

  async forgotPassword(form) {
    const response = await authApi.forgotPassword({ email: form.email })

    return {
      data: unwrapApiData(response),
      message: getMessage(response, 'Yêu cầu quên mật khẩu đã được gửi'),
    }
  },

  async resetPassword(code, newPassword) {
    const response = await authApi.resetPassword({ code, newPassword })

    return {
      message: getMessage(response, 'Đặt lại mật khẩu thành công'),
    }
  },

  async verifyResetCode(code) {
    await authApi.verifyResetCode({ code })
    return {}
  },

  async logout() {
    const token = this.getToken()

    // Clear session immediately (don't wait for API response)
    this.clearSession()
    clearHttpCache() // Clear HTTP cache on logout

    // Call API in background (fire and forget)
    if (token) {
      authApi.logout(token).catch((error) => {
        // Silently fail - session already cleared
        console.warn('Logout API call failed:', error)
      })
    }

    return {
      message: 'Đã đăng xuất',
    }
  },

  /**
   * Fetch current user with roles from BE and save to session.
   * Call after login or on app load when token exists.
   * @returns {Promise<object|null>} user with roles or null
   */
  async fetchCurrentUser() {
    const token = this.getToken()
    if (!token) return null
    try {
      const response = await authApi.getMe()
      const user = unwrapApiData(response)
      if (user && typeof user === 'object') {
        this.saveSession(null, user)
        return user
      }
      return null
    } catch (e) {
      if (e.message && (e.message.includes('401') || e.message.includes('Token'))) {
        this.clearSession()
      }
      throw e
    }
  },
}
